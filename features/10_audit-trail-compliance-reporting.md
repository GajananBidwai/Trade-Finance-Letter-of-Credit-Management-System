# Feature: Audit Trail & Compliance Reporting

## Feature ID
`F-10`

## Purpose
Capture every LC lifecycle event, user management action, settlement event, and AI interaction as an immutable, append-only audit record in `reporting-service`. Provide regulators, auditors, and senior officers with queryable audit trails and exportable compliance reports in PDF and CSV formats. Large exports are handled asynchronously with job tracking. Audit records are retained for a minimum of 7 years.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-10-1 | Audit Officer | Query all events for a specific LC with date and user filters | I can reconstruct the full history of any LC for regulatory review |
| US-10-2 | Compliance Manager | Export a PDF compliance report for a given period | I can submit a formatted report to regulators |
| US-10-3 | Senior Officer | Export a CSV of all settlement transactions | I can reconcile financial records against external bank statements |
| US-10-4 | System | Record every business event as an immutable audit entry | No event is ever lost or altered after creation |
| US-10-5 | IT Auditor | Verify that audit records cannot be modified or deleted | Regulatory data integrity requirements are satisfied |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-10-1 | `GET /api/v1/reports/audit` must accept `lcId`, `fromDate`, `toDate`, and `userId` as query filters and return matching audit records in chronological order. |
| FR-10-2 | `POST /api/v1/reports/export` must accept `reportType` (`AUDIT`, `SETTLEMENT`, `COMPLIANCE`), `format` (`PDF`, `CSV`), and `filters`, and trigger export generation. |
| FR-10-3 | Exports completing within 60 seconds must be returned synchronously with a `downloadUrl`. |
| FR-10-4 | Exports exceeding 60 seconds must be handled asynchronously: return `202 Accepted` with a `jobId`. User is notified via `notification-service` when the export is complete. |
| FR-10-5 | Audit records must be append-only. No `UPDATE` or `DELETE` operation may be performed on any audit record post-creation. |
| FR-10-6 | Audit records must be retained for a minimum of 7 years. Automated retention policy must prevent premature deletion. |
| FR-10-7 | `reporting-service` must support regional configurability — report configurations scoped per jurisdiction without code changes. |
| FR-10-8 | System must support ≥ 20 concurrent export jobs. Queue saturation alerts must fire at 80% capacity. |
| FR-10-9 | Every event produced by all other modules must write an audit record to `reporting-service` as a non-blocking side-effect (fire-and-forget with guaranteed delivery). |

---

## Audit Event Types Reference

| Module | Event Types |
| --- | --- |
| Auth | `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_LOCKOUT`, `AUTH_REFRESH` |
| User Management | `USER_CREATED`, `USER_UPDATED`, `USER_DEACTIVATED` |
| RBAC | `RBAC_DENIED` |
| Workflow (LC) | `LC_CREATED`, `LC_STATUS_UPDATED`, `LC_EXPIRED` |
| Documents | `DOCUMENT_UPLOADED`, `DISCREPANCY_RAISED`, `DISCREPANCY_WAIVED` |
| Settlement | `SETTLEMENT_PROCESSED`, `SETTLEMENT_OVERRIDE_APPROVED`, `SETTLEMENT_FAILED` |
| Notifications | `NOTIFICATION_SENT`, `NOTIFICATION_FAILED`, `NOTIFICATION_FALLBACK` |
| AI | `AI_DOCUMENT_ANALYZED`, `AI_QUERY_EXECUTED`, `AI_FALLBACK_TRIGGERED` |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `fromDate` / `toDate` | ISO 8601 format. `fromDate` must be ≤ `toDate`. Date range must not exceed 365 days per query. |
| `lcId` | Optional. If provided, must be a valid UUID matching an existing LC. |
| `userId` | Optional filter. If provided, must be a valid UUID. |
| `reportType` | Required for export. Must be one of: `AUDIT`, `SETTLEMENT`, `COMPLIANCE`. |
| `format` | Required for export. Must be `PDF` or `CSV`. |
| Audit record write | Must be atomic; partial writes rejected. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Audit query date range > 365 days | `400 Bad Request`: `"Date range must not exceed 365 days."` |
| Audit query returns zero results | `200 OK` with empty array `[]`. |
| Export job exceeds sync threshold (60 seconds) | Return `202 Accepted` with `jobId`. Notify user via IN_APP when complete. |
| Export job queue at ≥ 80% capacity | Monitoring alert fired. New jobs still accepted; warning logged. |
| Export job queue full | `503 Service Unavailable`: `"Export queue is currently at capacity. Please try again shortly."` |
| Attempt to UPDATE an audit record | `405 Method Not Allowed`. Write to tamper-detection log. |
| Attempt to DELETE an audit record | `405 Method Not Allowed`. Write to tamper-detection log. |
| Report with no data for filters | Export produces empty but valid PDF/CSV with header and filter metadata. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `reporting-service` | Internal Service | Central audit collection and export engine |
| MongoDB | Database | Stores audit records (append-only, immutable) |
| `notification-service` | Internal Service | Dispatches export-ready notifications for async jobs |
| Job Queue (e.g., Bull/BullMQ) | Infrastructure | Manages async export job execution |
| PDF/CSV generation library | Library | Generates formatted report output |
| All other modules | Event producers | Write audit records via `reporting-service` |

---

## API Requirements

### `GET /api/v1/reports/audit`
- **Auth:** `COMPLIANCE_ANALYST`, `ADMIN`, `SETTLEMENT_OFFICER`
- **Query Params:** `lcId`, `fromDate`, `toDate`, `userId`, `eventType`, `page`, `limit`
- **Response 200:**
```json
{
  "status": "success",
  "data": [
    {
      "eventId": "uuid",
      "eventType": "string",
      "action": "string",
      "performedBy": "uuid",
      "lcId": "uuid",
      "timestamp": "ISO8601",
      "details": {}
    }
  ],
  "pagination": { "page": 1, "total": 4500 }
}
```
- **Response 400:** `{ "status": "error", "message": "Date range must not exceed 365 days." }`

### `POST /api/v1/reports/export`
- **Auth:** `COMPLIANCE_ANALYST`, `ADMIN`, `SETTLEMENT_OFFICER`
- **Payload:**
```json
{
  "reportType": "AUDIT | SETTLEMENT | COMPLIANCE",
  "format": "PDF | CSV",
  "filters": {
    "fromDate": "ISO8601",
    "toDate": "ISO8601",
    "lcId": "uuid"
  }
}
```
- **Response 200 (sync):** `{ "status": "success", "data": { "downloadUrl": "string" } }`
- **Response 202 (async):** `{ "status": "accepted", "data": { "jobId": "uuid", "message": "Export in progress. You will be notified when ready." } }`

---

## Database Impact

### Collection: `audit_logs`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | `eventId` |
| `eventType` | String | Enum from event types reference |
| `module` | String | Source module name |
| `action` | String | Human-readable action description |
| `performedBy` | UUID | Actor userId |
| `lcId` | UUID | Null if not LC-related |
| `details` | Object | Full context snapshot of the event |
| `timestamp` | Date | Indexed for range queries |
| `jurisdiction` | String | Region code for regional scoping |

> **Immutability:** No `updateOne`, `deleteOne`, or `updateMany` operations permitted on this collection. Enforced via MongoDB role-level write restrictions.

### Collection: `export_jobs`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | `jobId` |
| `requestedBy` | UUID | — |
| `reportType` | String | — |
| `format` | String | — |
| `filters` | Object | — |
| `status` | String | `PENDING`, `PROCESSING`, `COMPLETE`, `FAILED` |
| `downloadUrl` | String | Populated on completion |
| `createdAt` | Date | — |
| `completedAt` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `AuditTrailTable` | Filterable, paginated table of audit events with columns: eventType, module, performedBy, lcId, timestamp |
| `AuditFilterBar` | Filter controls: date range picker, LC ID input, event type selector, user selector |
| `ExportReportForm` | Form to select report type, format, and date range; submit triggers export |
| `ExportStatusTracker` | Async job status panel showing `PENDING → PROCESSING → COMPLETE` with download link |
| `ExportReadyNotification` | IN_APP toast and notification when async export is ready for download |
| `TamperDetectionAlert` | Admin-visible alert if any unauthorized write attempt on audit collection is detected |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Immutability enforcement | MongoDB collection-level write restrictions: `INSERT` only on `audit_logs`; no `UPDATE` or `DELETE` |
| Retention enforcement | Automated job enforces 7-year minimum retention; premature deletion blocked at database level |
| Role-restricted access | Audit query and export endpoints restricted to `COMPLIANCE_ANALYST`, `SETTLEMENT_OFFICER`, and `ADMIN` |
| Regional configurability | Jurisdiction field on all audit records; export filters apply jurisdiction-specific rules without code changes |
| Download URL security | Exported file download URLs must be pre-signed with ≤ 1-hour expiry |

---

## Acceptance Criteria

- [ ] GIVEN valid audit query filters, WHEN `GET /api/v1/reports/audit` is called, THEN all matching events are returned in chronological order.
- [ ] GIVEN a date range > 365 days, WHEN audit query is submitted, THEN `400 Bad Request` is returned.
- [ ] GIVEN an export request for a small dataset, WHEN completed within 60 seconds, THEN `downloadUrl` is returned synchronously.
- [ ] GIVEN an export request for a large dataset, WHEN it exceeds 60 seconds, THEN `202 Accepted` is returned with `jobId`; user is notified via IN_APP when complete.
- [ ] GIVEN any system business event, WHEN it occurs, THEN an audit record is written to `reporting-service` within 5 seconds.
- [ ] GIVEN an attempt to modify an audit record, WHEN attempted, THEN `405 Method Not Allowed` is returned and a tamper-detection log entry is created.
- [ ] GIVEN audit records older than 7 years, WHEN retention policy runs, THEN no premature deletions occur.
- [ ] GIVEN 20 concurrent export jobs, WHEN running simultaneously, THEN all complete without queue overflow or degraded performance.

---

## Definition of Done

- [ ] `GET /api/v1/reports/audit` implemented with all filter params, pagination, and chronological ordering.
- [ ] `POST /api/v1/reports/export` implemented with sync (≤60s) and async (>60s) paths.
- [ ] Async export job queue implemented with Bull/BullMQ; queue saturation alerts at 80%.
- [ ] Audit record immutability enforced at MongoDB collection level.
- [ ] 7-year retention policy implemented and tested.
- [ ] Regional jurisdiction filtering implemented as runtime configuration.
- [ ] Async export completion notification integrated with `notification-service`.
- [ ] Pre-signed download URL with ≤ 1-hour expiry implemented.
- [ ] All acceptance criteria pass in QA environment.
