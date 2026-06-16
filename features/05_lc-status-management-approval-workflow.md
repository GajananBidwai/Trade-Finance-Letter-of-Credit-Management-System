# Feature: LC Status Management & Approval Workflow

## Feature ID
`F-05`

## Purpose
Manage the full lifecycle state machine of a Letter of Credit from `PENDING_APPROVAL` through `ACTIVE`, `AMENDED`, `SETTLED`, `REJECTED`, and `EXPIRED`. Compliance analysts and senior officers drive status transitions. All transitions are protected against concurrent updates via optimistic locking, and every transition produces an immutable audit record.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-05-1 | Compliance Analyst | Approve or reject a pending LC application | The LC either becomes active or is returned with documented reasons |
| US-05-2 | Compliance Analyst | Add comments when approving or rejecting | The trade officer understands the outcome and any conditions |
| US-05-3 | Trade Officer | Receive a notification when my LC status changes | I am always informed of the workflow progress |
| US-05-4 | Senior Officer | Block LC amendments while documents are under compliance review | Data integrity of the active review is preserved |
| US-05-5 | System | Detect and reject concurrent status updates | No two officers can overwrite each other's LC status update simultaneously |
| US-05-6 | Audit Officer | See every status transition logged with who made the change | Full accountability is maintained across the LC lifecycle |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-05-1 | `PUT /api/v1/lc/{lcId}/status` must accept `status`, `comment`, and `approvedBy` fields and update the LC status accordingly. |
| FR-05-2 | The LC status machine must enforce valid transitions only (see State Machine below). Invalid transitions must return `422 Unprocessable Entity`. |
| FR-05-3 | System must apply optimistic locking on LC records. Concurrent updates must return `409 Conflict` for the second request, with a prompt to reload. |
| FR-05-4 | LC amendments must be blocked if the LC has documents under active compliance review. Return `409 Conflict`: `"Amendment blocked: document review in progress."` |
| FR-05-5 | Every status transition must produce an audit record in `reporting-service` with `lcId`, `fromStatus`, `toStatus`, `performedBy`, `comment`, and `timestamp`. |
| FR-05-6 | Every status transition must trigger a notification to all relevant parties via `notification-service`. |
| FR-05-7 | LC records must include a `version` field (integer) that increments on every update; used for optimistic locking. |
| FR-05-8 | LCs with `expiryDate` in the past and status not `SETTLED` or `REJECTED` must be automatically transitioned to `EXPIRED` by a scheduled job. |

---

## LC State Machine

```
PENDING_APPROVAL → ACTIVE (approved by Compliance Analyst)
PENDING_APPROVAL → REJECTED (rejected by Compliance Analyst)
ACTIVE → AMENDED (amendment submitted by Trade Officer)
ACTIVE → SETTLED (settlement confirmed by Settlement Officer)
ACTIVE → EXPIRED (auto-transitioned by scheduler on expiry)
AMENDED → ACTIVE (amendment approved by Compliance Analyst)
AMENDED → REJECTED (amendment rejected)
```
> Any other transition returns `422 Unprocessable Entity`.

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `status` | Required. Must be a valid target status per the state machine for the current `lcStatus`. |
| `comment` | Required when `status` is `REJECTED`. Optional otherwise. Max 2000 characters. |
| `approvedBy` | Required. Must be a valid `userId` with appropriate role for the transition. |
| `version` | Request must include the current `version` value. Mismatch → `409 Conflict`. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Concurrent update (two officers update same LC simultaneously) | Optimistic locking: second update returns `409 Conflict`. User prompted to reload. |
| Amendment attempted while documents under review | `409 Conflict`: `"Amendment blocked: document review in progress."` |
| Invalid status transition (e.g., `SETTLED → ACTIVE`) | `422 Unprocessable Entity`: `"Invalid status transition."` |
| LC expiry date passes without settlement | Scheduled job transitions status to `EXPIRED`. Notifications dispatched. Audit record created. |
| Rejection without comment | `422 Unprocessable Entity`: `"Comment is required when rejecting an LC."` |
| `approvedBy` user does not have the required role | `403 Forbidden` from `api-gateway`. |
| `lcId` does not exist | `404 Not Found`. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `core-business-service` | Internal Service | Owns LC status state machine and update logic |
| `api-gateway` | Internal Service | Enforces role-based access per transition type |
| `notification-service` | Internal Service | Dispatches status change notifications |
| `reporting-service` | Internal Service | Receives status transition audit events |
| MongoDB | Database | LC records with optimistic locking `version` field |
| F-04 (LC Issuance) | Feature | LC must exist before status can be updated |
| F-06 (Document Compliance) | Feature | Active document review blocks amendments |

---

## API Requirements

### `PUT /api/v1/lc/{lcId}/status`
- **Auth:** `COMPLIANCE_ANALYST`, `SETTLEMENT_OFFICER`, `ADMIN`
- **Payload:**
```json
{
  "status": "string",
  "comment": "string",
  "approvedBy": "uuid",
  "version": "integer"
}
```
- **Response 200:**
```json
{ "status": "success", "data": { "lcId": "uuid", "lcStatus": "string", "version": "integer" } }
```
- **Response 409:** `{ "status": "error", "message": "Concurrent update conflict. Please reload and retry." }`
- **Response 409 (amendment blocked):** `{ "status": "error", "message": "Amendment blocked: document review in progress." }`
- **Response 422:** `{ "status": "error", "message": "Invalid status transition." }`
- **Response 404:** `{ "status": "error", "message": "LC not found." }`

---

## Database Impact

### Collection: `letters_of_credit` *(additions to F-04 schema)*
| Field | Type | Notes |
| --- | --- | --- |
| `lcStatus` | String | Managed by state machine |
| `version` | Number | Incremented on every update; used for optimistic locking |
| `statusHistory` | Array\<Object\> | Array of `{ fromStatus, toStatus, performedBy, comment, timestamp }` |
| `documentsUnderReview` | Boolean | Set to `true` when documents are in active compliance review |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `LC_STATUS_UPDATED` |
| `lcId` | UUID | — |
| `fromStatus` | String | — |
| `toStatus` | String | — |
| `performedBy` | UUID | — |
| `comment` | String | — |
| `timestamp` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `LCStatusBadge` | Color-coded badge: `PENDING_APPROVAL` (amber), `ACTIVE` (green), `SETTLED` (blue), `REJECTED` (red), `EXPIRED` (grey) |
| `StatusUpdateModal` | Modal for compliance analyst: target status selector, comment field, confirm button |
| `ConcurrentConflictAlert` | Inline banner shown on `409` conflict with "Reload" CTA |
| `AmendmentBlockedBanner` | Banner shown when amendment is blocked due to active document review |
| `LCTimelineView` | Chronological list of all status transitions with actor, comment, and timestamp |
| `ExpiryCountdownBadge` | Displays days remaining until LC expiry on LC detail view |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Role-per-transition enforcement | Only `COMPLIANCE_ANALYST` can approve/reject. Only `SETTLEMENT_OFFICER` can trigger `SETTLED`. Enforced at `api-gateway`. |
| Optimistic locking | `version` field mandatory on all update requests; prevents silent data overwrite |
| Audit immutability | Status transition records are append-only; no modification permitted post-creation |
| Amendment blocking | `documentsUnderReview` flag checked before any amendment; cannot be bypassed via API |

---

## Acceptance Criteria

- [ ] GIVEN a `PENDING_APPROVAL` LC, WHEN `PUT /api/v1/lc/{lcId}/status` sets status to `ACTIVE`, THEN `200 OK` returns updated status and incremented `version`.
- [ ] GIVEN a `PENDING_APPROVAL` LC, WHEN status is set to `REJECTED` without a comment, THEN `422 Unprocessable Entity` is returned.
- [ ] GIVEN two officers updating the same LC concurrently, WHEN both submit simultaneously, THEN one succeeds and the other receives `409 Conflict`.
- [ ] GIVEN an `ACTIVE` LC with documents under review, WHEN an amendment is attempted, THEN `409 Conflict` is returned.
- [ ] GIVEN an invalid status transition (e.g., `SETTLED → ACTIVE`), WHEN attempted, THEN `422 Unprocessable Entity` is returned.
- [ ] GIVEN an LC whose `expiryDate` has passed, WHEN the scheduled job runs, THEN LC status transitions to `EXPIRED` and notifications are dispatched.
- [ ] GIVEN any status transition, WHEN it occurs, THEN an audit record is written to `reporting-service`.
- [ ] GIVEN any status transition, WHEN it occurs, THEN notifications are dispatched to relevant parties within 30 seconds.

---

## Definition of Done

- [ ] `PUT /api/v1/lc/{lcId}/status` implemented with full state machine enforcement.
- [ ] Optimistic locking with `version` field implemented and tested for concurrent update scenarios.
- [ ] Amendment blocking logic (`documentsUnderReview` flag) implemented and tested.
- [ ] Expiry auto-transition scheduled job implemented and tested.
- [ ] Notification dispatch on every status transition integrated.
- [ ] Audit record written to `reporting-service` on every transition.
- [ ] All edge cases tested (concurrent update, blocked amendment, invalid transition, missing comment on rejection).
- [ ] All acceptance criteria pass in QA environment.
