package com.eushop.core.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FoodVatRateProviderTest {

    private final FoodVatRateProvider provider = new FoodVatRateProvider(new ObjectMapper());

    @Test
    void loadsAllEuMemberStateRatesFromCompliancePackage() {
        assertEquals(27, provider.getRates().size());
        assertEquals(new BigDecimal("0.07"), provider.requireRate("de"));
        assertEquals(new BigDecimal("0.055"), provider.requireRate("FR"));
    }

    @Test
    void failsClosedForUnsupportedDestination() {
        assertThrows(IllegalArgumentException.class, () -> provider.requireRate("XX"));
    }
}
