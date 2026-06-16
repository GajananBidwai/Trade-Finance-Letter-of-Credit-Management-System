# Feature: LC Application Issuance

## Feature ID
`F-04`

## Purpose
Enable trade officers to submit new Letter of Credit (LC) applications into the system. The system validates the payload, assigns an idempotency key to prevent duplicates, runs a compliance pre-check, and routes the LC to the approval queue with status `PENDING_APPROVAL`. An audit record is created on submission.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-04-1 | Trade Officer | Submit a new LC application with all required trade terms | The LC enters the approval workflow and is tracked in the system |
| US-04-2 | Trade Officer | Receive an LC ID immediately after submission | I can reference and track this LC throughout its lifecycle |
| US-04-3 | Compliance Analyst | Have the system flag risk items on submission via AI | I can focus review effort on high-risk fields |
| US-04-4 | System | Prevent duplicate LC submissions with the same reference | Idempotency is maintained and no duplicate records are created |
| US-04-5 | Audit Officer | Have every LC submission produce an audit record | Full traceability of LC origin and submission details is maintained |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-04-1 | `POST /api/v1/lc` must accept `applicant`, `beneficiary`, `amount`, `currency`, `expiryDate`, `terms`, and `documents` fields. |
| FR-04-2 | System must generate a UUID `lcId` and set initial status to `PENDING_APPROVAL` on successful creation. |
| FR-04-3 | System must generate and store an idempotency key per LC submission. Duplicate submissions with the same key must return `409 Conflict` without creating a new record. |
| FR-04-4 | System must invoke the AI risk-flagging hook (`ai-service`) asynchronously on submission; risk flags are stored against the LC record. |
| FR-04-5 | System must route the LC to the compliance analyst approval queue on creation. |
| FR-04-6 | System must notify all relevant parties (compliance analyst, trade officer) via `notification-service` when LC is submitted. |
| FR-04-7 | An audit record must be written to `reporting-service` on every LC creation, capturing submitter, timestamp, and full LC payload snapshot. |
| FR-04-8 | P95 API latency for `POST /api/v1/lc` must be < 500ms (AI flagging is async and does not block the response). |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `applicant` | Required. String. 2–200 characters. |
| `beneficiary` | Required. String. 2–200 characters. |
| `amount` | Required. Positive decimal. Greater than 0. Maximum 15 digits including 2 decimal places. |
| `currency` | Required. ISO 4217 currency code (e.g., `USD`, `EUR`). |
| `expiryDate` | Required. ISO 8601 date. Must be a future date (at least 1 business day from submission date). |
| `terms` | Required. String. 10–5000 characters. |
| `documents` | Optional. Array of strings (document type identifiers). Each entry must be a valid document type enum. |
| Idempotency key | Derived from hash of `applicant + beneficiary + amount + currency + expiryDate`. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Duplicate LC submission (same idempotency key) | Return `409 Conflict`: `"An LC with this reference already exists."` No new record created. |
| `expiryDate` is in the past | Return `422 Unprocessable Entity`: `"Expiry date must be a future date."` |
| `amount` is zero or negative | Return `422 Unprocessable Entity`: `"Amount must be greater than zero."` |
| `currency` is not ISO 4217 | Return `422 Unprocessable Entity`: `"Invalid currency code."` |
| AI service unavailable at submission | AI flagging skipped for this LC; LC still created. LC flagged for manual compliance review. Officer notified. |
| `notification-service` unavailable at submission | LC still created. Notification queued for retry. No submission failure. |
| User role not `TRADE_OFFICER` or `ADMIN` | `403 Forbidden` returned by `api-gateway` before endpoint is reached. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `core-business-service` | Internal Service | Owns LC creation, validation, and approval queue routing |
| `api-gateway` | Internal Service | Enforces RBAC; only `TRADE_OFFICER` and `ADMIN` may call `POST /api/v1/lc` |
| `ai-service` | Internal Service | Called asynchronously for risk flagging on submission |
| `notification-service` | Internal Service | Dispatches submission confirmation to trade officer and compliance analyst |
| `reporting-service` | Internal Service | Receives LC creation audit event |
| MongoDB | Database | Stores LC records |
| Redis | Cache | Stores idempotency keys with TTL |
| F-01 (JWT Auth) | Feature | Authenticated user required |
| F-02 (RBAC) | Feature | Role enforcement at gateway |

---

## API Requirements

### `POST /api/v1/lc`
- **Auth:** `TRADE_OFFICER`, `ADMIN`
- **Payload:**
```json
{
  "applicant": "string",
  "beneficiary": "string",
  "amount": "decimal",
  "currency": "string",
  "expiryDate": "ISO8601",
  "terms": "string",
  "documents": ["string"]
}
```
- **Response 201:**
```json
{ "status": "success", "data": { "lcId": "uuid", "lcStatus": "PENDING_APPROVAL" } }
```
- **Response 409:** `{ "status": "error", "message": "An LC with this reference already exists." }`
- **Response 422:** `{ "status": "error", "message": "Validation error detail" }`

### `GET /api/v1/lc/{lcId}`
- **Auth:** `TRADE_OFFICER`, `COMPLIANCE_ANALYST`, `SETTLEMENT_OFFICER`, `ADMIN`, `READ_ONLY`
- **Response 200:**
```json
{ "status": "success", "data": { "lcId": "uuid", "lcStatus": "string", "timeline": [], "riskFlags": [] } }
```
- **Response 404:** `{ "status": "error", "message": "LC not found." }`

---

## Database Impact

### Collection: `letters_of_credit`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | `lcId` |
| `applicant` | String | — |
| `beneficiary` | String | — |
| `amount` | Decimal128 | — |
| `currency` | String | ISO 4217 |
| `expiryDate` | Date | — |
| `terms` | String | — |
| `documents` | Array\<String\> | Document type enums |
| `lcStatus` | String | Enum: `PENDING_APPROVAL`, `ACTIVE`, `AMENDED`, `SETTLED`, `REJECTED`, `EXPIRED` |
| `idempotencyKey` | String | Unique index |
| `riskFlags` | Array\<Object\> | Populated by `ai-service` asynchronously |
| `submittedBy` | UUID | `userId` of trade officer |
| `createdAt` | Date | — |
| `updatedAt` | Date | — |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `LC_CREATED` |
| `lcId` | UUID | — |
| `performedBy` | UUID | Trade officer |
| `payload` | Object | Full LC payload snapshot |
| `timestamp` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `NewLCApplicationForm` | Multi-step form: applicant/beneficiary details → financial terms → document types → review & submit |
| `CurrencySelector` | ISO 4217 searchable dropdown |
| `ExpiryDatePicker` | Date picker enforcing future-date constraint |
| `DocumentTypeChecklist` | Multi-select checklist of required document types |
| `LCSubmissionConfirmation` | Success screen showing `lcId` and status `PENDING_APPROVAL` |
| `DuplicateSubmissionAlert` | Inline alert when `409 Conflict` is returned |
| `AIRiskFlagBanner` | Async-loaded banner showing AI-detected risk flags after submission |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Role enforcement | Only `TRADE_OFFICER` and `ADMIN` may call `POST /api/v1/lc`; enforced at `api-gateway` |
| Idempotency | Redis-backed idempotency key with TTL = 90 days (LC expiry window) |
| Payload validation | All fields validated server-side regardless of client-side validation |
| Audit trail | Every LC creation produces an immutable audit record; cannot be deleted |
| Data residency | LC records stored in jurisdiction-configured MongoDB instance per regional policy |

---

## Acceptance Criteria

- [ ] GIVEN a valid LC payload from a `TRADE_OFFICER`, WHEN `POST /api/v1/lc` is called, THEN `201 Created` returns `lcId` and `lcStatus: PENDING_APPROVAL`.
- [ ] GIVEN the same LC payload submitted twice, WHEN the second `POST /api/v1/lc` is called, THEN `409 Conflict` is returned with no new record created.
- [ ] GIVEN `expiryDate` is in the past, WHEN `POST /api/v1/lc` is called, THEN `422 Unprocessable Entity` is returned.
- [ ] GIVEN `ai-service` is unavailable, WHEN LC is submitted, THEN LC is still created and flagged for manual compliance review.
- [ ] GIVEN LC submission, WHEN the LC is created, THEN an audit record is written to `reporting-service`.
- [ ] GIVEN LC submission, WHEN the LC is created, THEN notifications are dispatched to the trade officer and compliance analyst.
- [ ] GIVEN `POST /api/v1/lc` under P95 load, WHEN called, THEN response time < 500ms (AI flagging is async).
- [ ] GIVEN a `READ_ONLY` user, WHEN `POST /api/v1/lc` is called, THEN `403 Forbidden` is returned.

---

## Definition of Done

- [ ] `POST /api/v1/lc` and `GET /api/v1/lc/{lcId}` implemented and unit tested.
- [ ] Idempotency key generation and Redis-backed deduplication implemented.
- [ ] Async AI risk-flagging hook integrated; LC creation not blocked by AI response.
- [ ] Notification dispatch on LC creation integrated with `notification-service`.
- [ ] Audit record written to `reporting-service` on every LC creation.
- [ ] Field validation (all rules) implemented and tested for all edge cases.
- [ ] P95 latency < 500ms validated under load test.
- [ ] All acceptance criteria pass in QA environment.
