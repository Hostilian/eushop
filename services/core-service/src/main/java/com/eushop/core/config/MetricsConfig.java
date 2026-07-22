package com.eushop.core.config;

import org.springframework.context.annotation.Configuration;

/**
 * MetricsConfig configures Spring Boot Actuator & Prometheus metrics exporter standards.
 */
@Configuration
public class MetricsConfig {

    public static final String METRIC_ORDER_CREATED = "eushop.orders.created.total";
    public static final String METRIC_CHECKOUT_LATENCY = "eushop.checkout.latency.seconds";
    public static final String METRIC_VAT_CALCULATIONS = "eushop.vat.calculations.total";
}
