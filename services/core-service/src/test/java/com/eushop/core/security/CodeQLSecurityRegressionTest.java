package com.eushop.core.security;

import com.eushop.core.dto.Dac7AggregateProjection;
import com.eushop.core.entity.Dac7AnnualSnapshot;
import com.eushop.core.repository.Dac7AnnualSnapshotRepository;
import com.eushop.core.repository.OrderRepository;
import com.eushop.core.repository.UserRepository;
import com.eushop.core.service.Dac7Service;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class CodeQLSecurityRegressionTest {

    private Dac7AnnualSnapshotRepository dac7SnapshotRepository;
    private OrderRepository orderRepository;
    private UserRepository userRepository;
    private Dac7Service dac7Service;

    @BeforeEach
    void setUp() {
        dac7SnapshotRepository = Mockito.mock(Dac7AnnualSnapshotRepository.class);
        orderRepository = Mockito.mock(OrderRepository.class);
        userRepository = Mockito.mock(UserRepository.class);

        dac7Service = new Dac7Service(dac7SnapshotRepository, orderRepository, userRepository);
    }

    @Test
    @DisplayName("DAC7: Invalid year rejects out-of-bounds inputs without arithmetic overflow")
    void testDac7YearBounds() {
        assertThrows(IllegalArgumentException.class, () -> dac7Service.generateSnapshotsForYear(1999));
        assertThrows(IllegalArgumentException.class, () -> dac7Service.generateSnapshotsForYear(2101));
        assertThrows(IllegalArgumentException.class, () -> dac7Service.generateSnapshotsForYear(Integer.MIN_VALUE));
        assertThrows(IllegalArgumentException.class, () -> dac7Service.generateSnapshotsForYear(Integer.MAX_VALUE));
    }

    @Test
    @DisplayName("DAC7: Typed projection processes financial decimal aggregates with HALF_EVEN rounding")
    void testDac7TypedProjectionProcessing() {
        Dac7AggregateProjection mockProjection = Mockito.mock(Dac7AggregateProjection.class);
        when(mockProjection.getSellerId()).thenReturn("seller-uuid-101");
        when(mockProjection.getTotalConsideration()).thenReturn(new BigDecimal("2500.555"));
        when(mockProjection.getTransactionCount()).thenReturn(35L);
        when(mockProjection.getPlatformFeeTotal()).thenReturn(new BigDecimal("125.000"));
        when(mockProjection.getSellerPayoutTotal()).thenReturn(new BigDecimal("2375.555"));

        when(orderRepository.calculateDac7AggregatesForYear(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(mockProjection));

        when(dac7SnapshotRepository.findBySellerIdAndReportingYear(eq("seller-uuid-101"), eq((short) 2026)))
                .thenReturn(Optional.empty());

        when(dac7SnapshotRepository.save(any(Dac7AnnualSnapshot.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<Dac7AnnualSnapshot> snapshots = dac7Service.generateSnapshotsForYear(2026);

        assertNotNull(snapshots);
        assertEquals(1, snapshots.size());
        Dac7AnnualSnapshot snapshot = snapshots.get(0);
        assertEquals("seller-uuid-101", snapshot.getSellerId());
        assertEquals((short) 2026, (short) snapshot.getReportingYear());
        assertEquals(2500.56, snapshot.getTotalConsideration());
        assertEquals(35, snapshot.getTransactionCount().intValue());
        assertEquals(125.00, snapshot.getPlatformFeeTotal());
        assertEquals(2375.56, snapshot.getSellerPayoutTotal());
    }
}
