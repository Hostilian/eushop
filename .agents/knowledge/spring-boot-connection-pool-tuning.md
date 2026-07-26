# Spring Boot Connection Pool Tuning

## Overview
EUshop core-service uses HikariCP for PostgreSQL connection pooling. These settings are validated and production-ready.

## Recommended HikariCP Config
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      keepalive-time: 300000
      validation-timeout: 5000
      leak-detection-threshold: 60000
```

## Connection Pool Sizing Formula
`pool_size = (core_count * 2) + effective_spindle_count`

For 4-core VM with SSD: `4 * 2 + 1 = 9` min, cap at 20 for safety margin.

## Alert Thresholds
- Pool utilization > 80% → alert (scale or optimize queries)
- Connection wait time > 1s → critical alert
- Leaked connections → security incident

## Monitoring
Via Actuator: `GET /actuator/metrics/hikaricp.connections.active`
