package com.eushop.core.service;

import com.eushop.core.entity.User;
import com.eushop.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * DsaNoticeService implements Digital Services Act (DSA) Article 30 trader traceability,
 * notice-and-action intake, and structured Statements of Reasons for content moderation decisions.
 */
@Service
public class DsaNoticeService {

    @Autowired
    private UserRepository userRepository;

    private final List<Map<String, Object>> notices = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> statementsOfReasons = Collections.synchronizedList(new ArrayList<>());

    @Transactional(readOnly = true)
    public boolean verifyTraderTraceability(String sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Trader not found: " + sellerId));

        return Boolean.TRUE.equals(seller.getKycVerified()) && Boolean.TRUE.equals(seller.getSelfCertifiedCompliant());
    }

    public Map<String, Object> submitNoticeAndAction(String reporterEmail, String targetId, String reason, String details) {
        Map<String, Object> notice = new HashMap<>();
        notice.put("id", "notice-" + UUID.randomUUID().toString().substring(0, 8));
        notice.put("reporterEmail", reporterEmail);
        notice.put("targetId", targetId);
        notice.put("reason", reason);
        notice.put("details", details);
        notice.put("status", "SUBMITTED");
        notice.put("timestamp", LocalDateTime.now().toString());

        notices.add(notice);
        return notice;
    }

    public Map<String, Object> issueStatementOfReasons(String traderId, String listingId, String decision, String justification) {
        Map<String, Object> sor = new HashMap<>();
        sor.put("id", "sor-" + UUID.randomUUID().toString().substring(0, 8));
        sor.put("traderId", traderId);
        sor.put("listingId", listingId);
        sor.put("decision", decision);
        sor.put("justification", justification);
        sor.put("legalBasis", "DSA Regulation (EU) 2022/2065 Article 17");
        sor.put("redressOptions", "Internal complaint-handling system or out-of-court dispute settlement");
        sor.put("timestamp", LocalDateTime.now().toString());

        statementsOfReasons.add(sor);
        return sor;
    }

    public List<Map<String, Object>> getAllNotices() {
        return new ArrayList<>(notices);
    }

    public List<Map<String, Object>> getStatementsOfReasons() {
        return new ArrayList<>(statementsOfReasons);
    }
}
