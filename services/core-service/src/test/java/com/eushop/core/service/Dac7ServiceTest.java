package com.eushop.core.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eushop.core.dto.Dac7AggregateProjection;
import com.eushop.core.entity.Dac7AnnualSnapshot;
import com.eushop.core.entity.User;
import com.eushop.core.repository.Dac7AnnualSnapshotRepository;
import com.eushop.core.repository.OrderRepository;
import com.eushop.core.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class Dac7ServiceTest {

    @Mock
    private Dac7AnnualSnapshotRepository dac7SnapshotRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private Dac7Service dac7Service;

    @Test
    void testGenerateSnapshotsForYear_Success() {
        int year = 2026;
        LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime end = LocalDateTime.of(year + 1, 1, 1, 0, 0, 0);

        Dac7AggregateProjection aggregate = mock(Dac7AggregateProjection.class);
        when(aggregate.getSellerId()).thenReturn("seller-uuid");
        when(aggregate.getTotalConsideration()).thenReturn(new BigDecimal("2500.50"));
        when(aggregate.getTransactionCount()).thenReturn(35L);
        when(aggregate.getPlatformFeeTotal()).thenReturn(new BigDecimal("375.00"));
        when(aggregate.getSellerPayoutTotal()).thenReturn(new BigDecimal("2125.50"));

        List<Dac7AggregateProjection> mockAggregates = Collections.singletonList(aggregate);

        when(orderRepository.calculateDac7AggregatesForYear(start, end)).thenReturn(mockAggregates);
        when(dac7SnapshotRepository.findBySellerIdAndReportingYear("seller-uuid", (short) year))
                .thenReturn(Optional.empty());

        Dac7AnnualSnapshot expectedSnapshot = new Dac7AnnualSnapshot();
        expectedSnapshot.setSellerId("seller-uuid");
        expectedSnapshot.setReportingYear((short) year);
        expectedSnapshot.setTotalConsideration(2500.50);
        expectedSnapshot.setTransactionCount(35);
        expectedSnapshot.setPlatformFeeTotal(375.00);
        expectedSnapshot.setSellerPayoutTotal(2125.50);

        when(dac7SnapshotRepository.save(any(Dac7AnnualSnapshot.class))).thenReturn(expectedSnapshot);

        List<Dac7AnnualSnapshot> snapshots = dac7Service.generateSnapshotsForYear(year);

        assertNotNull(snapshots);
        assertEquals(1, snapshots.size());
        Dac7AnnualSnapshot snapshot = snapshots.get(0);
        assertEquals("seller-uuid", snapshot.getSellerId());
        assertEquals((short) year, snapshot.getReportingYear());
        assertEquals(2500.50, snapshot.getTotalConsideration());
        assertEquals(35, snapshot.getTransactionCount());

        verify(orderRepository, times(1)).calculateDac7AggregatesForYear(start, end);
        verify(dac7SnapshotRepository, times(1)).save(any(Dac7AnnualSnapshot.class));
    }

    private Dac7AnnualSnapshot createMockSnapshot(String id, String sellerId, Short year, Double consideration, Integer count, Double platformFee, Double payout) {
        Dac7AnnualSnapshot snapshot = new Dac7AnnualSnapshot();
        snapshot.setId(id);
        snapshot.setSellerId(sellerId);
        snapshot.setReportingYear(year);
        snapshot.setTotalConsideration(consideration);
        snapshot.setTransactionCount(count);
        snapshot.setPlatformFeeTotal(platformFee);
        snapshot.setSellerPayoutTotal(payout);
        return snapshot;
    }

    @Test
    void testGetReportableSellers() {
        int year = 2026;
        Dac7AnnualSnapshot reportable1 = createMockSnapshot("1", "seller-1", (short) year, 2500.00, 10, 375.00, 2125.00);
        Dac7AnnualSnapshot reportable2 = createMockSnapshot("2", "seller-2", (short) year, 500.00, 35, 75.00, 425.00);
        Dac7AnnualSnapshot nonReportable = createMockSnapshot("3", "seller-3", (short) year, 1000.00, 15, 150.00, 850.00);

        when(dac7SnapshotRepository.findByReportingYear((short) year))
                .thenReturn(Arrays.asList(reportable1, reportable2, nonReportable));

        List<Dac7AnnualSnapshot> reportable = dac7Service.getReportableSellers(year);

        assertEquals(2, reportable.size());
        assertTrue(reportable.contains(reportable1));
        assertTrue(reportable.contains(reportable2));
        assertFalse(reportable.contains(nonReportable));
    }

    @Test
    void testExportXmlForYear() {
        int year = 2026;
        Dac7AnnualSnapshot snapshot = createMockSnapshot("1", "seller-1", (short) year, 2500.00, 10, 375.00, 2125.00);
        
        User seller = new User();
        seller.setId("seller-1");
        seller.setName("Artisan John");
        seller.setCountry("FR");
        seller.setTaxId("FR12345678");

        when(dac7SnapshotRepository.findByReportingYear((short) year)).thenReturn(Collections.singletonList(snapshot));
        when(userRepository.findById("seller-1")).thenReturn(Optional.of(seller));

        String xml = dac7Service.exportXmlForYear(year);

        assertNotNull(xml);
        assertTrue(xml.contains("<DPI_OECD"));
        assertTrue(xml.contains("<FirstName>Artisan John</FirstName>"));
        assertTrue(xml.contains("<TIN>FR12345678</TIN>"));
        assertTrue(xml.contains("<Amount>2500.0</Amount>"));
    }
}
