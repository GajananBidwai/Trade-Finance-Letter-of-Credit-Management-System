# Feature: Real-Time Dashboard & Analytics

## Feature ID
`F-08`

## Purpose
Provide authenticated users with a role-scoped, real-time operational dashboard displaying active LCs, pending settlements, compliance scores, and overdue workflows. Data is served from a Redis-backed cache refreshed every 60 seconds. The dashboard supports up to 200 concurrent users without degradation.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-08-1 | Trade Officer | See all my active LCs and their statuses at a glance | I can quickly identify which LCs need my attention |
| US-08-2 | Compliance Analyst | See pending LCs awaiting my review | I can prioritize my compliance workload efficiently |
| US-08-3 | Settlement Officer | See pending settlements and their due dates | I can ensure settlements are processed on time |
| US-08-4 | Admin | See system-wide compliance scores and overdue workflow counts | I have operational visibility across all trade finance activities |
| US-08-5 | Any User | Have my dashboard show only data within my RBAC scope | I cannot see data I am not authorized to access |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-08-1 | `GET /api/v1/dashboard/summary` must return `activeLCs`, `pendingSettlements`, `complianceScore`, and `overdueWorkflows` for the requesting user's RBAC scope. |
| FR-08-2 | Dashboard data must be served from a Redis cache. Cache must be refreshed from MongoDB every ≤ 60 seconds. |
| FR-08-3 | Dashboard data must be scoped to the requesting user's role: `TRADE_OFFICER` sees only their own LCs; `COMPLIANCE_ANALYST` sees all pending review LCs; `ADMIN` sees system-wide data. |
| FR-08-4 | Dashboard must surface all LC workflows that have exceeded their SLA threshold in the `overdueWorkflows` count, updated within 60 seconds of threshold breach. |
| FR-08-5 | `complianceScore` must be calculated as the percentage of LCs that passed compliance checks without discrepancies over the last 30 days. |
| FR-08-6 | Dashboard API must support at least 200 concurrent users with P95 latency < 500ms. |
| FR-08-7 | Zero cross-role data leaks are permitted; all dashboard responses must be validated against the requesting user's RBAC role before return. |

---

## Validation Rules

| Rule | Detail |
| --- | --- |
| JWT `role` claim | Must be present and valid. Determines data scope of the response. |
| Cache staleness | Cache TTL must never exceed 60 seconds. Stale entries must be invalidated on mutation events. |
| `complianceScore` | Calculated as: `(LCs with no raised discrepancies / total LCs) * 100` for rolling 30-day window. |
| `overdueWorkflows` | Any LC in `PENDING_APPROVAL` or `AMENDED` status for more than the configured SLA threshold (default: 4 hours). |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Redis cache miss | Fall through to MongoDB query. Response returned from live data. Cache updated with fresh result. |
| MongoDB query failure during cache refresh | Return stale cache data with `"dataAsOf"` timestamp in response. Log error. |
| `TRADE_OFFICER` requests dashboard | Only their own LCs (by `submittedBy`) returned in `activeLCs`. |
| Zero active LCs | Return `{ "activeLCs": 0, "pendingSettlements": 0, "complianceScore": 100.0, "overdueWorkflows": 0 }`. |
| 200+ concurrent users | Rate limiting enforced at `api-gateway`; queued requests served within SLA. |
| Role-scoped data mismatch (cross-role leak attempt) | `403 Forbidden` returned before data is returned; logged in `reporting-service`. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `core-business-service` | Internal Service | Owns dashboard aggregation logic |
| `api-gateway` | Internal Service | Routes and enforces role-scoped access |
| Redis | Cache | Stores pre-computed dashboard summaries per role scope; TTL ≤ 60 seconds |
| MongoDB | Database | Source of truth for live LC, settlement, and compliance data |
| `reporting-service` | Internal Service | Receives cross-role access attempt audit events |
| F-02 (RBAC) | Feature | Role determines dashboard data scope |
| F-04 (LC Issuance) | Feature | LC data feeds dashboard |
| F-05 (Status Management) | Feature | LC status drives `activeLCs` and `overdueWorkflows` |
| F-07 (Settlement) | Feature | Settlement data feeds `pendingSettlements` |

---

## API Requirements

### `GET /api/v1/dashboard/summary`
- **Auth:** All roles
- **Response 200:**
```json
{
  "status": "success",
  "data": {
    "activeLCs": "integer",
    "pendingSettlements": "integer",
    "complianceScore": "float",
    "overdueWorkflows": "integer",
    "dataAsOf": "ISO8601"
  }
}
```
- **Response 403:** `{ "status": "error", "message": "Access denied." }`

---

## Database Impact

### MongoDB Aggregation Queries *(executed by cache refresh job)*

| Metric | Query Basis |
| --- | --- |
| `activeLCs` | Count of documents in `letters_of_credit` with `lcStatus: ACTIVE`, scoped by user role |
| `pendingSettlements` | Count of `ACTIVE` LCs with fully compliant documents but no `settlementId` |
| `complianceScore` | Percentage of LCs in last 30 days with zero raised discrepancies |
| `overdueWorkflows` | Count of LCs in `PENDING_APPROVAL` or `AMENDED` for > SLA threshold duration |

### Redis Cache Keys
| Key Pattern | Value | TTL |
| --- | --- | --- |
| `dashboard:summary:ADMIN` | JSON summary for all-scope | 60 seconds |
| `dashboard:summary:TRADE_OFFICER:{userId}` | JSON summary for user-scope | 60 seconds |
| `dashboard:summary:COMPLIANCE_ANALYST` | JSON summary for compliance scope | 60 seconds |
| `dashboard:summary:SETTLEMENT_OFFICER` | JSON summary for settlement scope | 60 seconds |

---

## UI Components

| Component | Description |
| --- | --- |
| `DashboardSummaryCards` | Four KPI cards: Active LCs, Pending Settlements, Compliance Score (%), Overdue Workflows |
| `ComplianceScoreGauge` | Radial gauge visualization for compliance score percentage |
| `OverdueWorkflowAlert` | Highlighted alert panel listing LCs that have breached SLA, with links to workflow detail |
| `ActiveLCList` | Scoped table of active LCs with status badges, expiry dates, and quick-action buttons |
| `DataFreshnessIndicator` | Tooltip/badge showing `dataAsOf` timestamp and time elapsed since last refresh |
| `RoleScopeBadge` | Visual indicator showing the data scope currently applied (e.g., "Viewing: Your LCs") |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Role-scoped data | Every dashboard query must apply the requesting user's RBAC scope before returning data |
| Cross-role leak prevention | Zero tolerance; any attempt to return out-of-scope data must be blocked and audited |
| Cache key isolation | Redis cache keys must be namespaced per role (and per userId for `TRADE_OFFICER`) to prevent data bleed |
| Transport | HTTPS only; all data served over TLS |

---

## Acceptance Criteria

- [ ] GIVEN an authenticated `TRADE_OFFICER`, WHEN `GET /api/v1/dashboard/summary` is called, THEN only their own LCs are reflected in `activeLCs`.
- [ ] GIVEN an authenticated `ADMIN`, WHEN `GET /api/v1/dashboard/summary` is called, THEN system-wide aggregated data is returned.
- [ ] GIVEN a cache TTL of 60 seconds, WHEN LC status changes, THEN dashboard data reflects the change within 60 seconds.
- [ ] GIVEN a Redis cache miss, WHEN the dashboard is requested, THEN live MongoDB data is returned and cache is updated.
- [ ] GIVEN 200 concurrent users, WHEN all call `GET /api/v1/dashboard/summary` simultaneously, THEN P95 latency remains < 500ms.
- [ ] GIVEN a cross-role data access attempt, WHEN detected, THEN `403 Forbidden` is returned and logged.
- [ ] GIVEN an LC overdue beyond SLA threshold, WHEN dashboard is refreshed, THEN it appears in `overdueWorkflows` within 60 seconds.

---

## Definition of Done

- [ ] `GET /api/v1/dashboard/summary` implemented with role-scoped data aggregation.
- [ ] Redis cache implemented with per-role key namespacing and ≤ 60-second TTL.
- [ ] Cache miss fallthrough to MongoDB implemented.
- [ ] Cache refresh job implemented to refresh all role-scope keys every 60 seconds.
- [ ] `complianceScore` calculation (30-day rolling window) implemented.
- [ ] `overdueWorkflows` detection (SLA threshold breach) implemented.
- [ ] Cross-role data leak prevention validated and audited.
- [ ] Load test: 200 concurrent users, P95 < 500ms validated.
- [ ] All acceptance criteria pass in QA environment.
