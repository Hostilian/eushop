// COMPLIANCE-REVIEW: GDPR Art. 30 Records of Processing Activities (ROPA) Automated Exporter
// Generates statutory ROPA JSON documentation for EU Data Protection Authority (DPA) audits.

export interface ROPACategory {
  activityId: string;
  processingPurpose: string;
  dataCategories: string[];
  dataSubjectTypes: string[];
  recipients: string[];
  transfersOutsideEU: boolean;
  retentionPeriod: string;
  technicalSecurityMeasures: string[];
}

export interface ROPAReport {
  controllerName: string;
  dpoEmail: string;
  generatedAt: string;
  activities: ROPACategory[];
}

export function generateStatutoryROPAReport(): ROPAReport {
  return {
    controllerName: 'EUshop GmbH (Sole Proprietorship / Marketplace)',
    dpoEmail: 'dpo@eushop.eu',
    generatedAt: new Date().toISOString(),
    activities: [
      {
        activityId: 'ACT-001',
        processingPurpose: 'Order Processing & Statutory EU Consumer Rights Warranty',
        dataCategories: ['Full Name', 'Shipping Address', 'Email', 'Order History'],
        dataSubjectTypes: ['Buyers / Consumers'],
        recipients: ['Sellers (DSA Art. 30 Verified)', 'Logistics Subprocessors'],
        transfersOutsideEU: false,
        retentionPeriod: '10 years (Statutory Commercial & Tax Code Retention)',
        technicalSecurityMeasures: ['AES-256 Encryption at Rest', 'TLS 1.3 in Transit', 'RBAC Scoping'],
      },
      {
        activityId: 'ACT-002',
        processingPurpose: 'DSA Art. 30 Trader Identity & KYB Verification',
        dataCategories: ['Legal Name', 'VAT Number', 'Commercial Registration', 'IBAN'],
        dataSubjectTypes: ['Traders / Sellers'],
        recipients: ['EU Market Surveillance Authorities upon lawful DSA Art. 31 request'],
        transfersOutsideEU: false,
        retentionPeriod: 'Duration of active trader listing + 5 years post-termination',
        technicalSecurityMeasures: ['Column-level DB Encryption', 'Audit Log Immutability'],
      },
      {
        activityId: 'ACT-003',
        processingPurpose: 'DAC7 Cross-Border Tax Reporting (EU Directive 2021/514)',
        dataCategories: ['Seller Consideration EUR', 'Transaction Counts', 'Tax Identification Numbers'],
        dataSubjectTypes: ['EU Sellers exceeding €2,000 or 30 transactions'],
        recipients: ['EU Member State Tax Authorities (via DAC7 XML payload)'],
        transfersOutsideEU: false,
        retentionPeriod: '10 years',
        technicalSecurityMeasures: ['DAC7 Threshold Event Bus', 'Automated XML Schema Validation'],
      },
    ],
  };
}
