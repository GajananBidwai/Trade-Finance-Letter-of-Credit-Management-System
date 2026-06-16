# Feature: Settlement Processing

## Feature ID
`F-07`

## Purpose
Enable settlement officers to authorize and process payment instructions for compliance-approved LCs. The system validates the settlement amount against the approved LC amount, processes the settlement via `core-business-service`, updates the LC status to `SETTLED`, generates a settlement ID, and produces a final audit report. All settlement events are audit-logged and notified.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-07-1 | Settlement Officer | Review and authorize a payment instruction for a compliance-approved LC | The LC is settled and all parties are confirmed of the payment |
| US-07-2 | Settlement Officer | Be prevented from processing a settlement with a mismatched amount | Financial errors and unauthorized payment overrides are prevented |
| US-07-3 | Trade Officer | Receive a settlement confirmation notification | I know the LC has been successfully settled |
| US-07-4 | Senior Officer | Approve any settlement amount override that deviates from the approved LC amount | Exceptional overrides are controlled with an additional authorization layer |
| US-07-5 | Audit Officer | Have every settlement event produce an immutable audit record | Full financial traceability is maintained for regulatory compliance |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-07-1 | `POST /api/v1/lc/{lcId}/settlement` must accept `settlementAmount`, `currency`, and `authorizedBy` and process the settlement if validations pass. |
| FR-07-2 | System must validate that `settlementAmount` matches the approved LC `amount` exactly. Mismatch must return `422 Unprocessable Entity`. |
| FR-07-3 | Override of a mismatched settlement amount must require explicit senior officer approval before processing. |
| FR-07-4 | On successful settlement, system must generate a `settlementId` (UUID) and update LC `lcStatus` to `SETTLED`. |
| FR-07-5 | System must dispatch a settlement confirmation notification to trade officer, compliance analyst, and beneficiary via `notification-service`. |
| FR-07-6 | Every settlement event (attempt, success, override) must produce an immutable audit record in `reporting-service`. |
| FR-07-7 | Settlement can only be processed for LCs with `lcStatus: ACTIVE` and all documents in a compliant state (`documentsUnderReview: false` and `complianceStatus: PASS` or all discrepancies waived). |
| FR-07-8 | Settlement processing must be idempotent: duplicate settlement requests for the same `lcId` must return `409 Conflict`. |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `lcId` | Must reference an existing LC with `lcStatus: ACTIVE`. |
| `settlementAmount` | Required. Must be a positive decimal. Must match the LC's approved `amount` exactly (within ±0.01 tolerance for floating point). |
| `currency` | Required. Must match the LC's `currency` field exactly. |
| `authorizedBy` | Required. Must be a valid `userId` with `SETTLEMENT_OFFICER` or `ADMIN` role. |
| Document compliance | LC must have no documents in `MANUAL_REVIEW` or `FAIL` state. All discrepancies must be `WAIVED` or no discrepancies raised. |
| Duplicate settlement | `lcId` must not already have `lcStatus: SETTLED`. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Settlement amount does not match LC amount | `422 Unprocessable Entity`: `"Settlement amount does not match approved LC amount. Senior officer approval required."` |
| Senior officer override of amount mismatch | Override recorded with `overriddenBy` and `overrideComment`; settlement proceeds after approval. |
| LC is not `ACTIVE` | `422 Unprocessable Entity`: `"Settlement can only be processed for an ACTIVE LC."` |
| Documents still under review | `422 Unprocessable Entity`: `"All document discrepancies must be resolved before settlement."` |
| Duplicate settlement attempt (already `SETTLED`) | `409 Conflict`: `"This LC has already been settled."` |
| `notification-service` unavailable at settlement | Settlement proceeds. Notification queued for retry. |
| `authorizedBy` user lacks `SETTLEMENT_OFFICER` role | `403 Forbidden` from `api-gateway`. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `core-business-service` | Internal Service | Owns settlement processing logic and LC status update |
| `api-gateway` | Internal Service | Enforces role: only `SETTLEMENT_OFFICER` and `ADMIN` may call settlement endpoint |
| `notification-service` | Internal Service | Dispatches settlement confirmation |
| `reporting-service` | Internal Service | Receives settlement audit events |
| MongoDB | Database | Stores settlement records |
| F-04 (LC Issuance) | Feature | LC must exist |
| F-05 (LC Status Management) | Feature | LC must be `ACTIVE` |
| F-06 (Document Compliance) | Feature | All documents must be compliant before settlement |

---

## API Requirements

### `POST /api/v1/lc/{lcId}/settlement`
- **Auth:** `SETTLEMENT_OFFICER`, `ADMIN`
- **Payload:**
```json
{
  "settlementAmount": "decimal",
  "currency": "string",
  "authorizedBy": "uuid"
}
```
- **Response 200:**
```json
{ "status": "success", "data": { "settlementId": "uuid", "lcStatus": "SETTLED" } }
```
- **Response 409:** `{ "status": "error", "message": "This LC has already been settled." }`
- **Response 422 (amount mismatch):** `{ "status": "error", "message": "Settlement amount does not match approved LC amount. Senior officer approval required." }`
- **Response 422 (documents pending):** `{ "status": "error", "message": "All document discrepancies must be resolved before settlement." }`
- **Response 422 (wrong status):** `{ "status": "error", "message": "Settlement can only be processed for an ACTIVE LC." }`

---

## Database Impact

### Collection: `settlements`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | `settlementId` |
| `lcId` | UUID | FK to `letters_of_credit`; unique index |
| `settlementAmount` | Decimal128 | — |
| `currency` | String | ISO 4217 |
| `authorizedBy` | UUID | — |
| `overrideApprovedBy` | UUID | Null unless amount override used |
| `overrideComment` | String | Null unless override |
| `settledAt` | Date | — |

### Collection: `letters_of_credit` *(fields updated)*
| Field | Type | Notes |
| --- | --- | --- |
| `lcStatus` | String | Updated to `SETTLED` |
| `settledAt` | Date | Timestamp of settlement |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `SETTLEMENT_PROCESSED`, `SETTLEMENT_OVERRIDE_APPROVED`, `SETTLEMENT_FAILED` |
| `lcId` | UUID | — |
| `settlementId` | UUID | — |
| `performedBy` | UUID | — |
| `settlementAmount` | Decimal | — |
| `timestamp` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `SettlementAuthorizationForm` | Form showing LC details, approved amount, and settlement amount input field with currency |
| `AmountMismatchAlert` | Alert displayed when entered amount differs from LC amount; prompts senior officer override flow |
| `SeniorOfficerOverrideModal` | Modal for senior officer to provide override approval and comment |
| `SettlementSuccessScreen` | Success view showing `settlementId`, settled amount, and timestamp |
| `SettlementHistoryEntry` | Entry in LC timeline view showing settlement event |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Role enforcement | Only `SETTLEMENT_OFFICER` and `ADMIN` may call settlement endpoint; enforced at `api-gateway` |
| Amount validation | Server-side only; client pre-fill of amount does not bypass validation |
| Override authorization | Senior officer override requires a distinct user from the initiating settlement officer |
| Audit immutability | Settlement records and override records are append-only; no modification permitted |
| Idempotency | Duplicate settlement requests return `409` without reprocessing |

---

## Acceptance Criteria

- [ ] GIVEN a compliance-approved `ACTIVE` LC, WHEN `POST /api/v1/lc/{lcId}/settlement` is called with matching amount, THEN `200 OK` returns `settlementId` and `lcStatus: SETTLED`.
- [ ] GIVEN a settlement amount that differs from the LC amount, WHEN settlement is attempted, THEN `422 Unprocessable Entity` is returned.
- [ ] GIVEN senior officer approval for an override, WHEN settlement is resubmitted, THEN settlement is processed with override metadata recorded.
- [ ] GIVEN a second settlement attempt on an already-settled LC, WHEN called, THEN `409 Conflict` is returned.
- [ ] GIVEN documents still under review, WHEN settlement is attempted, THEN `422 Unprocessable Entity` is returned.
- [ ] GIVEN successful settlement, WHEN processed, THEN notifications are dispatched to trade officer, compliance analyst, and beneficiary.
- [ ] GIVEN any settlement event, WHEN it occurs, THEN an audit record is written to `reporting-service`.
- [ ] GIVEN settlement processing, WHEN measured, THEN settlement error rate < 0.5% of total settlements.

---

## Definition of Done

- [ ] `POST /api/v1/lc/{lcId}/settlement` implemented with all validation rules.
- [ ] Amount mismatch detection and `422` response implemented.
- [ ] Senior officer override flow implemented with override metadata recording.
- [ ] Idempotency check (duplicate settlement prevention) implemented.
- [ ] Document compliance pre-check implemented before settlement proceeds.
- [ ] LC status updated to `SETTLED` and `settledAt` timestamp recorded.
- [ ] Notification dispatch on settlement confirmation integrated.
- [ ] All settlement events written to `reporting-service` audit log.
- [ ] All acceptance criteria pass in QA environment.
