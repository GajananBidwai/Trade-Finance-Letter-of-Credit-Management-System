# Feature: AI Assistant — Document Analysis & Query Resolution

## Feature ID
`F-11`

## Purpose
Provide an AI-powered assistant powered by OpenAI and MongoDB Atlas Vector Search that performs two functions: (1) automated document compliance analysis against LC terms, returning discrepancy lists and risk scores; and (2) contextual query resolution for users asking questions about specific LCs, trade terms, or compliance requirements. All AI interactions are audit-logged. Unavailability triggers a resilient retry-and-fallback mechanism.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-11-1 | Back-Office Officer | Have AI automatically check uploaded documents against LC terms | Discrepancies are detected instantly without full manual review |
| US-11-2 | Compliance Analyst | Ask the AI assistant questions about a specific LC | I get contextual answers about LC terms and compliance requirements without digging through records |
| US-11-3 | Trade Officer | Ask the AI what documents are required for my LC | I can prepare the correct documentation without consulting a specialist |
| US-11-4 | System | Fall back to manual review when AI is unavailable | Business continuity is preserved even during AI service outages |
| US-11-5 | Audit Officer | Have every AI interaction logged with inputs and outputs | AI decisions are fully auditable and explainable |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-11-1 | `POST /api/v1/ai/analyze-document` must accept `lcId`, `documentUrl`, and `documentType`, invoke OpenAI with the document and LC terms as context, and return `complianceStatus`, `discrepancies`, and `riskScore`. |
| FR-11-2 | `POST /api/v1/ai/query` must accept `userId`, `query`, and optional `context.lcId`, invoke OpenAI with LC-context-aware prompt, and return a `response` with `references`. |
| FR-11-3 | Document analysis must complete within P95 10 seconds. |
| FR-11-4 | AI query resolution must complete within P95 5 seconds. |
| FR-11-5 | If `ai-service` is unreachable, the system must queue the document analysis request for retry (3 attempts, exponential backoff: 1s, 2s, 4s). After exhaustion, the document must be flagged `MANUAL_REVIEW` and the officer notified. |
| FR-11-6 | Discrepancy detection accuracy must be ≥ 95% vs. manual review baseline. False positive rate must be < 5%. |
| FR-11-7 | Low-quality documents (poor scan, low resolution) must trigger a `qualityWarning` in the response rather than a silent incorrect analysis result. |
| FR-11-8 | MongoDB Atlas Vector Search must be used for semantic matching of document content against LC terms stored as vector embeddings. |
| FR-11-9 | Every `ai-service` call (analyze-document and query) must produce an audit record in `reporting-service` with full input, output, and timestamp. |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `lcId` | Required for document analysis. Must reference an existing `ACTIVE` LC. |
| `documentUrl` | Required. Must be a valid HTTPS URL. |
| `documentType` | Required. Must be a valid document type enum. |
| `userId` | Required for query. Must be a valid userId. |
| `query` | Required. Min 5 characters. Max 2000 characters. |
| `riskScore` | Output value. Must be a float between 0.0 and 1.0. |
| `context.lcId` | Optional for query. If provided, AI uses LC terms as context for the answer. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| `ai-service` unreachable on document analysis | Retry 3 times (1s, 2s, 4s). On exhaustion, flag document `MANUAL_REVIEW`, notify officer, write audit record. |
| `ai-service` unreachable on query | Return `503 Service Unavailable`: `"AI Assistant is temporarily unavailable. Please try again shortly."` |
| Low-quality document detected | Return `qualityWarning` in response body. Officer can override and accept or re-upload. |
| `lcId` does not exist | `404 Not Found`. |
| `documentUrl` is inaccessible (403/404 from storage) | Return `422 Unprocessable Entity`: `"Document could not be retrieved from the provided URL."` |
| AI returns empty discrepancies array | `complianceStatus: PASS`. `riskScore` still returned. |
| AI query with no `context.lcId` | Answer provided using general trade finance knowledge base only (no LC-specific context). |
| Retry queue success | Document analyzed on retry. `MANUAL_REVIEW` flag cleared. Audit record updated with final AI outcome. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `ai-service` | Internal Service | Orchestrates OpenAI calls and vector search queries |
| OpenAI API | External Service | LLM for document analysis and query resolution |
| MongoDB Atlas Vector Search | External Service | Stores LC term embeddings; semantic document-term matching |
| `core-business-service` | Internal Service | Provides LC terms to `ai-service` for context; receives analysis results |
| `reporting-service` | Internal Service | Receives AI audit events |
| Redis | Cache | Stores AI retry queue for failed analysis requests |
| F-06 (Document Presentation) | Feature | Triggers document analysis on upload |

---

## API Requirements

### `POST /api/v1/ai/analyze-document`
- **Auth:** Internal service-to-service (called by `core-business-service`)
- **Payload:**
```json
{
  "lcId": "uuid",
  "documentUrl": "string",
  "documentType": "string"
}
```
- **Response 200:**
```json
{
  "status": "success",
  "data": {
    "complianceStatus": "PASS | FAIL | MANUAL_REVIEW",
    "discrepancies": ["string"],
    "riskScore": "float",
    "qualityWarning": "string | null"
  }
}
```
- **Response 503:** `{ "status": "error", "message": "AI service temporarily unavailable." }`
- **Response 422:** `{ "status": "error", "message": "Document could not be retrieved from the provided URL." }`

### `POST /api/v1/ai/query`
- **Auth:** All authenticated roles
- **Payload:**
```json
{
  "userId": "uuid",
  "query": "string",
  "context": { "lcId": "uuid" }
}
```
- **Response 200:**
```json
{
  "status": "success",
  "data": {
    "response": "string",
    "references": ["string"]
  }
}
```
- **Response 503:** `{ "status": "error", "message": "AI Assistant is temporarily unavailable. Please try again shortly." }`

---

## Database Impact

### Collection: `ai_interactions`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | — |
| `interactionType` | String | `DOCUMENT_ANALYSIS`, `QUERY` |
| `lcId` | UUID | Null for general queries |
| `userId` | UUID | — |
| `input` | Object | Full input payload |
| `output` | Object | Full AI response |
| `riskScore` | Number | 0.0–1.0; null for queries |
| `retryCount` | Number | 0–3 |
| `finalStatus` | String | `SUCCESS`, `FALLBACK_MANUAL_REVIEW` |
| `createdAt` | Date | — |

### MongoDB Atlas Vector Search Index
| Entity | Embedding | Purpose |
| --- | --- | --- |
| LC terms (per `lcId`) | OpenAI `text-embedding-ada-002` | Semantic matching against uploaded document content |
| Trade finance knowledge base | OpenAI embedding | Context for general AI query resolution |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `AI_DOCUMENT_ANALYZED`, `AI_QUERY_EXECUTED`, `AI_FALLBACK_TRIGGERED` |
| `lcId` | UUID | — |
| `userId` | UUID | — |
| `inputSnapshot` | Object | Full request payload |
| `outputSnapshot` | Object | Full AI response |
| `timestamp` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `AIComplianceResultCard` | Post-upload card showing `complianceStatus`, `riskScore` gauge, and discrepancy list |
| `AIAssistantChat` | Chat interface for `POST /api/v1/ai/query`; supports LC-contextual queries |
| `QualityWarningBanner` | Shown when AI detects low-quality document; options to re-upload or override |
| `ManualReviewFlagBanner` | Shown when AI is unavailable and document is queued for manual review |
| `RiskScoreGauge` | Radial gauge displaying 0.0–1.0 risk score with color thresholds (green/amber/red) |
| `AIUnavailableState` | Graceful degradation UI for query endpoint when AI is unreachable |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| AI audit trail | 100% of `ai-service` calls (both endpoints) logged with full input and output in `reporting-service` |
| Document URL security | Only pre-signed HTTPS document URLs accepted; `ai-service` must validate URL before fetching |
| OpenAI API key | Stored as environment secret; never exposed in logs, responses, or client code |
| Retry queue isolation | Per-LC retry queue entries isolated; one LC's retry failure does not affect others |
| User query PII | Query content must not be logged with personally identifiable information; `userId` logged by reference only |

---

## Acceptance Criteria

- [ ] GIVEN a valid document URL and active `lcId`, WHEN `POST /api/v1/ai/analyze-document` is called, THEN `complianceStatus`, `discrepancies`, and `riskScore` are returned within P95 10 seconds.
- [ ] GIVEN `ai-service` is unreachable, WHEN document analysis is requested, THEN 3 retries are attempted; on exhaustion, document is flagged `MANUAL_REVIEW` and officer is notified.
- [ ] GIVEN a low-quality document, WHEN analyzed, THEN `qualityWarning` is returned in the response; no silent incorrect analysis.
- [ ] GIVEN a valid user query with `context.lcId`, WHEN `POST /api/v1/ai/query` is called, THEN a contextual LC-aware response is returned within P95 5 seconds.
- [ ] GIVEN AI discrepancy detection vs. manual review baseline, WHEN measured, THEN accuracy ≥ 95% and false positive rate < 5%.
- [ ] GIVEN any AI interaction, WHEN it occurs, THEN a full audit record with input and output is written to `reporting-service`.
- [ ] GIVEN retry queue success, WHEN AI becomes available, THEN queued documents are analyzed and `MANUAL_REVIEW` flag is cleared.

---

## Definition of Done

- [ ] `POST /api/v1/ai/analyze-document` implemented with OpenAI integration and MongoDB Atlas Vector Search.
- [ ] `POST /api/v1/ai/query` implemented with LC-context-aware prompting.
- [ ] 3-retry exponential backoff queue (1s, 2s, 4s) implemented for document analysis.
- [ ] Manual review fallback and officer notification implemented on retry exhaustion.
- [ ] Document quality warning detection implemented.
- [ ] MongoDB Atlas Vector Search index created for LC terms and knowledge base.
- [ ] All AI interactions written to `reporting-service` audit log.
- [ ] P95 latencies validated: document analysis < 10 seconds, query < 5 seconds.
- [ ] All acceptance criteria pass in QA environment.
