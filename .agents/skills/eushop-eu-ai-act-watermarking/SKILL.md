---
name: eushop-eu-ai-act-watermarking
description: Skill for verifying C2PA watermarks, synthetic content disclosures, and AI risk categorization.
---

# EU AI Act Compliance (Reg. 2024/1689)

## Overview
The EU AI Act (Regulation 2024/1689) entered into force August 2024. EUshop uses AI for product description generation, image enhancement, and recommendation systems. All AI-generated content must be disclosed, and AI systems must be categorised by risk level before deployment.

// COMPLIANCE-REVIEW: Prohibited AI practices are binding from February 2025. High-risk AI obligations apply from August 2026. Verify timelines per use case with legal counsel.

## EUshop AI Use Cases & Risk Classification

| AI Feature | Risk Category | Disclosure Required | Obligations |
|-----------|--------------|--------------------|----|
| Product description generation | Minimal | Yes — content label | None beyond disclosure |
| AI search recommendations | Minimal | No (recommendation engine) | None |
| AI chatbot / support assistant | Limited | Yes — "AI agent" disclosure | Art. 50 transparency notice |
| Biometric checkout (planned) | HIGH | Yes + DPIA | **Do NOT build without legal sign-off** |
| Fraud detection scoring | Limited | No | Monitor for discrimination |
| AI-generated product images | Minimal | Yes — C2PA watermark | Art. 50(4) synthetic media label |

## C2PA Content Credentials (AI-Generated Images)

```typescript
// packages/compliance/src/aiAct.ts
export interface C2paContentCredential {
  generatorTool: string;          // e.g. 'Gemini Imagen', 'DALL-E 3'
  generatedAt: string;            // ISO 8601 timestamp
  isAiGenerated: true;
  c2paManifest?: string;          // Base64-encoded C2PA manifest if tool supports it
}

export function attachC2paMetadata(
  imageBuffer: Buffer,
  credential: C2paContentCredential
): Buffer {
  // Embed C2PA manifest in image EXIF/XMP metadata
  // COMPLIANCE-REVIEW: C2PA library (content-credentials/c2pa-node) must be used
  // This ensures watermark survives common image processing operations
  return embedC2paManifest(imageBuffer, credential);
}
```

## AI-Generated Content Disclosure (Art. 50)

```tsx
// apps/web/components/product/AiContentBadge.tsx
export function AiGeneratedBadge({ contentType }: { contentType: 'description' | 'image' }) {
  return (
    <span
      className="ai-disclosure-badge"
      aria-label={`This ${contentType} was generated using artificial intelligence`}
      role="note"
    >
      ✨ AI-assisted {contentType}
    </span>
  );
}

// Required wherever AI-generated text appears in public-facing UI
export function AiAgentDisclosure() {
  return (
    <div role="status" aria-live="polite" className="ai-agent-notice">
      You are interacting with an AI assistant. For human support, click here.
    </div>
  );
}
```

## Prohibited AI Practices (Binding Feb 2025)

The following AI applications are **absolutely prohibited** on EUshop:

```typescript
// packages/compliance/src/aiAct.ts
export const PROHIBITED_AI_USES = [
  'biometric_categorisation_by_sensitive_attributes', // Art. 5(1)(b)
  'social_scoring_by_public_authority',               // Art. 5(1)(c)
  'real_time_remote_biometric_identification',        // Art. 5(1)(h) — public spaces
  'subliminal_manipulation',                          // Art. 5(1)(a)
  'exploit_vulnerabilities_of_persons',              // Art. 5(1)(b)
] as const;

// COMPLIANCE-REVIEW: Any proposed new AI feature must be checked against this list first
```

## AI System Registration (High-Risk)

If EUshop deploys any high-risk AI system (e.g. employment screening, credit scoring for sellers):
1. Register in EU AI Act database before deployment
2. Conduct conformity assessment
3. Implement human oversight mechanism
4. Maintain logs for minimum 6 months

## Source Files
- `packages/compliance/src/aiAct.ts`
- `apps/web/components/product/AiContentBadge.tsx`
- `apps/web/components/chat/AiAgentDisclosure.tsx`
- `services/core-service/src/ai/AiContentAuditService.java`
