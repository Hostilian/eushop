package com.eushop.core.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.Locale;
import java.util.Map;

/**
 * Loads destination-country food VAT rates from the compliance package's
 * machine-readable source.
 *
 * <p>COMPLIANCE-REVIEW: These indicative rates still require product-level and
 * jurisdiction-specific tax-advisor validation before production invoicing.
 */
@Service
public class FoodVatRateProvider {

    private static final String RATES_RESOURCE = "compliance/eu-food-vat-rates.json";

    private final Map<String, BigDecimal> rates;

    public FoodVatRateProvider(ObjectMapper objectMapper) {
        this.rates = Collections.unmodifiableMap(loadRates(objectMapper));
    }

    public BigDecimal requireRate(String destinationCountryIso2) {
        if (destinationCountryIso2 == null || destinationCountryIso2.length() != 2) {
            throw new IllegalArgumentException("Destination country must be a 2-letter ISO code");
        }

        String countryCode = destinationCountryIso2.toUpperCase(Locale.ROOT);
        BigDecimal rate = rates.get(countryCode);
        if (rate == null) {
            throw new IllegalArgumentException(
                    "Checkout is unavailable for unsupported destination country");
        }
        return rate;
    }

    public Map<String, BigDecimal> getRates() {
        return rates;
    }

    private static Map<String, BigDecimal> loadRates(ObjectMapper objectMapper) {
        ClassPathResource resource = new ClassPathResource(RATES_RESOURCE);
        try (InputStream input = resource.getInputStream()) {
            return objectMapper.readValue(input, new TypeReference<>() {});
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to load compliance VAT rates from " + RATES_RESOURCE,
                    exception);
        }
    }
}
