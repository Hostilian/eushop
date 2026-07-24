package com.eushop.core.service;

import com.eushop.core.dto.Dac7AggregateProjection;
import com.eushop.core.entity.Dac7AnnualSnapshot;
import com.eushop.core.entity.User;
import com.eushop.core.repository.Dac7AnnualSnapshotRepository;
import com.eushop.core.repository.OrderRepository;
import com.eushop.core.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class Dac7Service {

    private static final Logger log = LoggerFactory.getLogger(Dac7Service.class);

    private final Dac7AnnualSnapshotRepository dac7SnapshotRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public Dac7Service(Dac7AnnualSnapshotRepository dac7SnapshotRepository,
                       OrderRepository orderRepository,
                       UserRepository userRepository) {
        this.dac7SnapshotRepository = dac7SnapshotRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    /**
     * Cron Job: Runs at midnight on the 1st of every month to compute/update snapshots for the current year.
     * Also scheduled to run on startup or on-demand via admin endpoint.
     */
    @Scheduled(cron = "0 0 0 1 * ?")
    public void runMonthlyDac7Computation() {
        int currentYear = LocalDate.now().getYear();
        log.info("Starting scheduled monthly DAC7 computation for year {}", currentYear);
        generateSnapshotsForYear(currentYear);
    }

    private int requireValidReportingYear(int year) {
        if (year < 2000 || year > 2100) {
            throw new IllegalArgumentException("Invalid DAC7 reporting year: " + year);
        }
        return year;
    }

    public List<Dac7AnnualSnapshot> generateSnapshotsForYear(int year) {
        int validYear = requireValidReportingYear(year);
        short reportingYear = (short) validYear;
        LocalDateTime startOfYear = LocalDateTime.of(validYear, 1, 1, 0, 0, 0);
        LocalDateTime endOfYear = startOfYear.plusYears(1);

        List<Dac7AggregateProjection> aggregates = orderRepository.calculateDac7AggregatesForYear(startOfYear, endOfYear);
        List<Dac7AnnualSnapshot> savedSnapshots = new ArrayList<>();

        for (Dac7AggregateProjection row : aggregates) {
            String sellerId = row.getSellerId();
            if (sellerId == null || sellerId.isEmpty()) continue;

            BigDecimal consideration = row.getTotalConsideration();
            Long count = row.getTransactionCount();
            BigDecimal platformFee = row.getPlatformFeeTotal();
            BigDecimal payout = row.getSellerPayoutTotal();

            Dac7AnnualSnapshot snapshot = dac7SnapshotRepository
                    .findBySellerIdAndReportingYear(sellerId, reportingYear)
                    .orElseGet(() -> {
                        Dac7AnnualSnapshot newSnap = new Dac7AnnualSnapshot();
                        newSnap.setSellerId(sellerId);
                        newSnap.setReportingYear(reportingYear);
                        return newSnap;
                    });

            double totalConsideration = consideration != null ? consideration.setScale(2, RoundingMode.HALF_EVEN).doubleValue() : 0.0;
            int transactionCount = count != null ? Math.toIntExact(Math.min(100_000L, Math.max(0L, count))) : 0;
            double feeTotal = platformFee != null ? platformFee.setScale(2, RoundingMode.HALF_EVEN).doubleValue() : 0.0;
            double payoutTotal = payout != null ? payout.setScale(2, RoundingMode.HALF_EVEN).doubleValue() : 0.0;

            snapshot.setTotalConsideration(totalConsideration);
            snapshot.setTransactionCount(transactionCount);
            snapshot.setPlatformFeeTotal(feeTotal);
            snapshot.setSellerPayoutTotal(payoutTotal);

            savedSnapshots.add(dac7SnapshotRepository.save(snapshot));
        }

        log.info("Generated/Updated {} DAC7 snapshots for year {}", savedSnapshots.size(), validYear);
        return savedSnapshots;
    }

    public List<Dac7AnnualSnapshot> getReportableSellers(int year) {
        int validYear = requireValidReportingYear(year);
        short reportingYear = (short) validYear;
        List<Dac7AnnualSnapshot> allSnapshots = dac7SnapshotRepository.findByReportingYear(reportingYear);
        List<Dac7AnnualSnapshot> reportable = new ArrayList<>();

        for (Dac7AnnualSnapshot snapshot : allSnapshots) {
            // DAC7 reporting thresholds: total consideration >= €2,000 OR transaction count >= 30
            if (snapshot.getTotalConsideration() >= 2000.00 || snapshot.getTransactionCount() >= 30) {
                reportable.add(snapshot);
            }
        }
        return reportable;
    }

    public void markAsSubmitted(List<String> snapshotIds) {
        for (String id : snapshotIds) {
            dac7SnapshotRepository.findById(id).ifPresent(snapshot -> {
                snapshot.setSubmittedAt(LocalDateTime.now());
                dac7SnapshotRepository.save(snapshot);
            });
        }
    }

    /**
     * Generates DAC7 EU-compliant XML structure for reporting to tax authorities.
     */
    public String exportXmlForYear(int year) {
        List<Dac7AnnualSnapshot> reportable = getReportableSellers(year);

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<DPI_OECD xmlns=\"urn:oecd:ties:dpi:v1\" version=\"1.0\">\n");
        
        // Message Header
        xml.append("  <MessageSpec>\n");
        xml.append("    <TransmittingCountry>CZ</TransmittingCountry>\n");
        xml.append("    <ReceivingCountry>CZ</ReceivingCountry>\n");
        xml.append("    <MessageType>DPI</MessageType>\n");
        xml.append("    <Warning>DAC7 Annual Tax Report</Warning>\n");
        xml.append("    <MessageRefId>CZ-EUshop-").append(year).append("-").append(System.currentTimeMillis()).append("</MessageRefId>\n");
        xml.append("    <ReportingPeriod>").append(year).append("-12-31</ReportingPeriod>\n");
        xml.append("    <Timestamp>").append(LocalDateTime.now()).append("</Timestamp>\n");
        xml.append("  </MessageSpec>\n");

        // Reporting Platform info
        xml.append("  <ReportingPlatform>\n");
        xml.append("    <PlatformName>EUshop Marketplace</PlatformName>\n");
        xml.append("    <Operator>\n");
        xml.append("      <Name>EUshop s.r.o.</Name>\n");
        xml.append("      <Address>Prague, Czech Republic</Address>\n");
        xml.append("    </Operator>\n");
        xml.append("  </ReportingPlatform>\n");

        // Reportable Sellers
        for (Dac7AnnualSnapshot snapshot : reportable) {
            Optional<User> sellerOpt = userRepository.findById(snapshot.getSellerId());
            if (sellerOpt.isEmpty()) continue;
            User seller = sellerOpt.get();

            xml.append("  <ReportableSeller>\n");
            xml.append("    <Identity>\n");
            xml.append("      <IndividualSeller>\n");
            xml.append("        <StandardName>\n");
            xml.append("          <FirstName>").append(escapeXml(seller.getName())).append("</FirstName>\n");
            xml.append("        </StandardName>\n");
            xml.append("        <Address>\n");
            xml.append("          <Street>").append(escapeXml(seller.getAddressStreet() != null ? seller.getAddressStreet() : "Unknown")).append("</Street>\n");
            xml.append("          <City>").append(escapeXml(seller.getAddressCity() != null ? seller.getAddressCity() : "Unknown")).append("</City>\n");
            xml.append("          <PostalCode>").append(escapeXml(seller.getAddressPostalCode() != null ? seller.getAddressPostalCode() : "Unknown")).append("</PostalCode>\n");
            xml.append("          <CountryCode>").append(escapeXml(seller.getCountry())).append("</CountryCode>\n");
            xml.append("        </Address>\n");
            if (seller.getTaxId() != null && !seller.getTaxId().isEmpty()) {
                xml.append("        <TIN>").append(escapeXml(seller.getTaxId())).append("</TIN>\n");
            }
            if (seller.getVatNumber() != null && !seller.getVatNumber().isEmpty()) {
                xml.append("        <VATNumber>").append(escapeXml(seller.getVatNumber())).append("</VATNumber>\n");
            }
            if (seller.getTradeRegisterNumber() != null && !seller.getTradeRegisterNumber().isEmpty()) {
                xml.append("        <TradeRegisterNumber>").append(escapeXml(seller.getTradeRegisterNumber())).append("</TradeRegisterNumber>\n");
            }
            xml.append("      </IndividualSeller>\n");
            xml.append("    </Identity>\n");

            // Financial Activity
            xml.append("    <FinancialActivity>\n");
            xml.append("      <Consideration>\n");
            xml.append("        <Amount>").append(snapshot.getTotalConsideration()).append("</Amount>\n");
            xml.append("        <CurrencyCode>EUR</CurrencyCode>\n");
            xml.append("      </Consideration>\n");
            xml.append("      <Fees>").append(snapshot.getPlatformFeeTotal()).append("</Fees>\n");
            xml.append("      <Payout>").append(snapshot.getSellerPayoutTotal()).append("</Payout>\n");
            xml.append("      <TransactionCount>").append(snapshot.getTransactionCount()).append("</TransactionCount>\n");
            xml.append("    </FinancialActivity>\n");
            xml.append("  </ReportableSeller>\n");
        }

        xml.append("</DPI_OECD>\n");
        return xml.toString();
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }
}
