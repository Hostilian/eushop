# EUshop Stage-Based Target Architecture (Stage 0 to Stage 3 Cell Failover)

**Architectural Evolution:** Pragmatic Monolith -> Distributed Regional Cells  

---

## 1. Architectural Stage Roadmap

| Stage | Scale Target | Primary Database | Compute & Frontend | Observability & Failover |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 0 (Current)** | Pre-Seed / Seed | Single PostgreSQL (Port 5432) | Modular Monolith (Port 3001) + Next.js Static Export | Local logs + OpenTelemetry traces |
| **Stage 1 (Launch)** | 10k-50k MAU | PostgreSQL Primary + 2 Read Replicas | Spring Boot Container Cluster + Cloudflare CDN | Prometheus + Grafana Alerts |
| **Stage 2 (Growth)** | 500k MAU | PostgreSQL Partitioning (by EU Country) | Decoupled Core Services + Kafka Event Outbox | Distributed Jaeger Tracing |
| **Stage 3 (Scale)** | Multi-Million MAU | Multi-Region CockroachDB / AlloyDB | Multi-Region Cell Failover Deployment | Automated 99.99% Cell Isolation |

---

## 2. Stage 0 Modular Monolith Safeguards

To ensure seamless transition from Stage 0 to Stage 2:
1. All 16 domain modules communicate via explicit Java Service interfaces, never direct cross-repository table joins.
2. Data mutations produce atomic outbox events (`OutboxEvent.java`).
