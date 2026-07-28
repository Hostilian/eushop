---
name: eushop-whistleblower-secure-reporting
description: Skill for maintaining encrypted anonymous reporting channels and audit trail sanitization under EU 2019/1937.
---

# EU Whistleblower Protection (Directive 2019/1937)

## Overview
Directive 2019/1937 on the protection of persons who report breaches of EU law requires organisations with 50+ workers to establish internal secure reporting channels. EUshop must maintain a breach-reporting endpoint, acknowledge receipt within 7 days, and provide feedback within 3 months — all while guaranteeing reporter confidentiality.

// COMPLIANCE-REVIEW: Transposition varies by member state. Some countries have stricter obligations. Review with legal counsel per jurisdiction of operation.

## Response Timeline Requirements

| Obligation | Deadline |
|-----------|---------|
| Acknowledge receipt of report | 7 calendar days |
| Provide follow-up feedback | 3 months from acknowledgement |
| Retain report records | Minimum required by national law (no longer than necessary) |
| Anonymise if reporter requests | Immediately on request |

## Secure Reporting Channel Architecture

```typescript
// services/core-service/src/whistleblower/WhistleblowerReport.java → TypeScript equivalent
export interface WhistleblowerReport {
  reportId: string;              // UUID, generated server-side — never expose to reporter
  reportToken: string;           // One-time lookup token given to reporter for status checks
  submittedAt: Date;
  category: ReportCategory;
  description: string;           // Encrypted at rest
  attachments?: EncryptedFile[]; // E2E encrypted before upload
  isAnonymous: boolean;
  // Never store: reporter name, email, IP address without consent
}

export type ReportCategory =
  | 'VAT_FRAUD'
  | 'GDPR_VIOLATION'
  | 'DSA_BREACH'
  | 'PRODUCT_SAFETY'
  | 'LABOUR_LAW'
  | 'ENVIRONMENTAL'
  | 'FINANCIAL_CRIME'
  | 'OTHER_EU_LAW';
```

## Encryption Requirements

```typescript
// packages/compliance/src/whistleblower.ts
// Use AES-256-GCM for report content encryption
// Key stored in HSM / AWS KMS / GCP KMS — never in application config
export async function encryptReportContent(plaintext: string): Promise<EncryptedPayload> {
  // COMPLIANCE-REVIEW: Encryption key rotation policy must be defined
  // and not break access to historical reports
  const key = await getWhistleblowerEncryptionKey(); // from KMS
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // ... AES-GCM encrypt
  return { ciphertext, iv, keyVersion: key.version };
}
```

## Audit Trail Sanitization

```sql
-- Audit logs must NOT include reporter-identifying data
-- Safe audit log: log action, timestamp, outcome — NOT reporter identity
INSERT INTO whistleblower_audit_log (
  action,          -- e.g. 'REPORT_RECEIVED', 'ACKNOWLEDGEMENT_SENT', 'FEEDBACK_SENT'
  report_token,    -- NOT the report UUID — only the lookup token
  occurred_at,
  outcome
) VALUES ($1, $2, now(), $3);
-- COMPLIANCE-REVIEW: Audit log retention period must align with national transposition law
```

## Reporter Confidentiality Rules

- **Never log** reporter IP address in server access logs for the reporting endpoint
- **Never share** report contents with the subject of the report during investigation
- **Strip metadata** from uploaded document attachments before storage
- If anonymity is requested: immediately delete any identifier data and return only the `reportToken`

## Status Check Flow

```typescript
// Reporter uses token to check status — no account required
export async function getReportStatus(reportToken: string): Promise<ReportStatus> {
  const report = await reportRepository.findByToken(reportToken);
  if (!report) throw new NotFoundError('Invalid token');
  return {
    acknowledged: report.acknowledgedAt != null,
    feedbackProvided: report.feedbackAt != null,
    status: report.currentStatus,
    // Never return: report content, reporter identity, assigned investigator
  };
}
```

## Source Files
- `services/core-service/src/whistleblower/` — reporting endpoints
- `packages/compliance/src/whistleblower.ts` — encryption utilities
- `db/migrations/` — `whistleblower_reports`, `whistleblower_audit_log` tables
