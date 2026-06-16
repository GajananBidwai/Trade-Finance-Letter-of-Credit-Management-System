# KPI Document

**Project Name:** Trade Finance & Letter of Credit Management System
**Version:** 1.0
**Date:** 2026-06-16
**Reference:** PRD_Trade_Finance_LC_Management_System.md

---

# KPI Matrix

## Module 1: Auth Module (`auth-service`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| AUTH-01 | Login Success Rate | Percentage of login attempts that return a valid JWT + refresh token with `200 OK` | ≥ 99.5% of login requests succeed without system-side error |
| AUTH-02 | Login API Response Latency | Time taken for `POST /api/v1/auth/login` to return a response | P95 latency < 300ms under normal load |
| AUTH-03 | Token Refresh Success Rate | Percentage of `/auth/refresh` calls that return a new valid JWT | ≥ 99.9% success rate; zero silent token failures |
| AUTH-04 | Expired Token Rejection Rate | Percentage of expired JWT requests correctly rejected with `401 Unauthorized` | 100% of expired tokens must be rejected; zero bypass incidents |
| AUTH-05 | Unauthorized Access Attempt Blocking | Rate at which `403 Forbidden` is returned for role-insufficient access attempts | 100% of unauthorized role attempts blocked at `api-gateway` |
| AUTH-06 | Session Invalidation on Logout | Percentage of logout requests that successfully invalidate the JWT server-side | 100% of `POST /api/v1/auth/logout` calls must revoke the token immediately |
| AUTH-07 | Concurrent Session Control | Maximum number of active sessions permitted per user role | Configurable per role; breach triggers automatic oldest-session termination |
| AUTH-08 | Privilege Escalation Incidents | Count of unauthorized privilege escalation events detected per quarter | Zero incidents per quarter; any detection triggers immediate alert |
| AUTH-09 | Brute Force Detection Rate | Number of failed login attempts before account lockout triggers | Account locked after 5 consecutive failures within 10 minutes |
| AUTH-10 | RBAC Role Assignment Accuracy | Percentage of users assigned the correct role and permission set at provisioning | 100% of users must have role verified against RBAC policy before first login |

---

## Module 2: User Management Module (`auth-service`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| USR-01 | User Provisioning Time | Time from `POST /api/v1/users` submission to user account being active | ≤ 5 minutes end-to-end for standard role provisioning |
| USR-02 | User Creation API Success Rate | Percentage of `POST /api/v1/users` calls returning `201 Created` | ≥ 99.5% under normal operational conditions |
| USR-03 | Role Update Propagation Time | Time taken for a `PUT /api/v1/users/{id}` role change to reflect across all modules | ≤ 30 seconds for permission change to propagate to `api-gateway` enforcement |
| USR-04 | Duplicate User Prevention Rate | Percentage of duplicate email/user submissions correctly rejected | 100% prevention; zero duplicate accounts created |
| USR-05 | User Listing API Latency | Response time for `GET /api/v1/users` returning full user list | P95 latency < 400ms for up to 10,000 user records |
| USR-06 | Admin Dual-Control Compliance | Percentage of admin-level user changes that are subject to dual-control approval | 100% of admin mutations require a secondary approver before commit |
| USR-07 | Inactive User Deactivation Rate | Percentage of user accounts inactive beyond policy threshold that are auto-deactivated | 100% of accounts inactive > 90 days flagged; ≥ 95% auto-deactivated within 24 hours of threshold |
| USR-08 | PII Data Masking Coverage | Percentage of PII fields masked or encrypted in API responses and database records | 100% coverage; zero plaintext PII in logs, API responses, or exports |
| USR-09 | Audit Log Coverage for User Events | Percentage of user create/update/delete events captured in `reporting-service` | 100% of user management events must produce an audit record |
| USR-10 | User Status Update Accuracy | Percentage of `PUT /api/v1/users/{id}` calls correctly reflecting updated `status` field | 100% consistency between request payload and persisted state |

---

## Module 3: Workflow Management Module (`core-business-service`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| WF-01 | LC Application Submission Success Rate | Percentage of `POST /api/v1/lc` calls returning `201 Created` with `PENDING_APPROVAL` status | ≥ 99.5% success rate; zero silent data-loss failures |
| WF-02 | LC End-to-End Processing Time | Average elapsed time from LC submission (`POST /api/v1/lc`) to status `ACTIVE` | < 4 hours average; < 8 hours at P95 |
| WF-03 | LC Status Update Accuracy | Percentage of `PUT /api/v1/lc/{lcId}/status` calls correctly persisting the new status | 100% state consistency between request and persisted record |
| WF-04 | Duplicate LC Rejection Rate | Percentage of duplicate LC submissions (same idempotency key) correctly blocked with `409 Conflict` | 100% prevention; zero duplicate LC records created |
| WF-05 | Concurrent Workflow Conflict Handling | Percentage of concurrent LC update conflicts correctly resolved via optimistic locking with `409 Conflict` | 100% of conflicts detected; zero silent data overwrites |
| WF-06 | Document Upload Success Rate | Percentage of `POST /api/v1/lc/{lcId}/documents` calls returning a `documentId` and `complianceStatus` | ≥ 99% success rate under normal conditions |
| WF-07 | Invalid Document Format Rejection | Percentage of unsupported file type uploads correctly rejected with `400 Bad Request` | 100% rejection of non-PDF/TIFF/PNG uploads |
| WF-08 | Settlement Processing Success Rate | Percentage of `POST /api/v1/lc/{lcId}/settlement` calls resulting in `lcStatus: SETTLED` | ≥ 99.5% success rate; settlement error rate < 0.5% |
| WF-09 | Settlement Amount Mismatch Detection | Percentage of settlement requests with mismatched amounts correctly rejected with `422 Unprocessable Entity` | 100% detection and rejection; zero incorrect settlements processed |
| WF-10 | LC Amendment Blocking During Review | Percentage of amendment attempts on LCs under active document review correctly blocked with `409 Conflict` | 100% blocking rate; zero amendments permitted during active review |
| WF-11 | LC Lifecycle Audit Trail Coverage | Percentage of LC lifecycle state transitions (issuance → amendment → settlement) captured in audit log | 100% of state transitions produce an audit record in `reporting-service` |
| WF-12 | Workflow API P95 Latency | P95 response time for all non-export workflow endpoints | < 500ms for all read/write workflow endpoints under normal load |

---

## Module 4: Dashboard & Analytics Module (`core-business-service` / `api-gateway`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| DASH-01 | Dashboard Summary API Latency | Response time for `GET /api/v1/dashboard/summary` returning real-time LC metrics | P95 latency < 500ms |
| DASH-02 | Dashboard Data Accuracy | Accuracy of `activeLCs`, `pendingSettlements`, `complianceScore`, `overdueWorkflows` values vs. live database state | 100% data consistency; no stale cache values older than 60 seconds |
| DASH-03 | Dashboard Availability | Uptime of dashboard API endpoint | ≥ 99.9% monthly availability |
| DASH-04 | Overdue Workflow Detection Rate | Percentage of overdue LC workflows correctly surfaced in `overdueWorkflows` count | 100% of workflows past SLA threshold reflected within 60 seconds |
| DASH-05 | Compliance Score Calculation Accuracy | Accuracy of the `complianceScore` metric vs. underlying compliance check outcomes | Deviation from manual calculation ≤ 0.5% |
| DASH-06 | Role-Based Dashboard Data Filtering | Percentage of dashboard responses correctly filtered to the requesting user's permitted data scope | 100% of responses scoped to user's RBAC role; zero cross-role data leaks |
| DASH-07 | Concurrent Dashboard User Load | Number of concurrent users dashboard API supports without degradation | P95 latency < 500ms with up to 200 concurrent users |

---

## Module 5: Notification Module (`notification-service`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| NOTIF-01 | Notification Delivery Rate | Percentage of `POST /api/v1/notifications/send` calls resulting in confirmed delivery to recipient | ≥ 99% successful delivery across EMAIL, SMS, and IN_APP channels |
| NOTIF-02 | Notification Dispatch Latency | Time from LC status change event to notification dispatch reaching the recipient channel | ≤ 30 seconds from event trigger to delivery |
| NOTIF-03 | Email Delivery Failure Fallback Rate | Percentage of failed EMAIL/SMS deliveries that successfully fall back to IN_APP notification after 3 retries | 100% fallback activation on delivery failure; zero silent notification drops |
| NOTIF-04 | Notification Retry Success Rate | Percentage of initially-failed notifications that succeed within 3 retry attempts | ≥ 95% resolved within retry window |
| NOTIF-05 | Notification Read Rate | Percentage of IN_APP notifications marked as read by recipient within 24 hours | Tracked as engagement metric; target ≥ 80% read within 24 hours |
| NOTIF-06 | Notification API Latency | Response time for `POST /api/v1/notifications/send` | P95 latency < 300ms |
| NOTIF-07 | Notification Failure Logging Rate | Percentage of notification delivery failures captured in `reporting-service` audit log | 100% of delivery failures logged with timestamp, channel, recipient, and error code |
| NOTIF-08 | Notification History Retrieval Accuracy | Percentage of `GET /api/v1/notifications/{userId}` responses returning complete, chronologically ordered notification history | 100% complete and ordered; zero missing records |
| NOTIF-09 | Channel-Specific Delivery SLA Compliance | Percentage of notifications delivered within channel-specific SLA (EMAIL ≤ 2 min, SMS ≤ 1 min, IN_APP ≤ 10 sec) | ≥ 99% within respective SLA per channel |

---

## Module 6: Reporting & Audit Module (`reporting-service`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| RPT-01 | Audit Trail Completeness | Percentage of LC lifecycle events, user management events, and settlement events captured in audit log | 100% coverage; zero missing events |
| RPT-02 | Audit Query Response Latency | Response time for `GET /api/v1/reports/audit` with standard filters | P95 latency < 500ms for queries spanning up to 90 days |
| RPT-03 | Report Export Sync Completion Rate | Percentage of export requests (`POST /api/v1/reports/export`) completed synchronously within 60 seconds | ≥ 95% completed synchronously; async fallback for remaining 5% |
| RPT-04 | Async Report Job Completion Rate | Percentage of async export jobs (returning `202 Accepted`) that complete and notify the user within 10 minutes | ≥ 99% async jobs complete within 10 minutes |
| RPT-05 | Audit Record Immutability | Rate at which audit log records are modified or deleted post-creation | 0% modification rate; audit records must be append-only and immutable |
| RPT-06 | Report Data Accuracy | Accuracy of exported AUDIT/SETTLEMENT/COMPLIANCE reports vs. source database records | 100% data fidelity; zero discrepancies between export and source |
| RPT-07 | Export Format Compliance | Percentage of export jobs producing correctly formatted PDF and CSV outputs per specification | 100% format compliance; zero corrupted or malformed exports |
| RPT-08 | Compliance Report Regional Configurability | Percentage of `reporting-service` report configurations that can be scoped per jurisdiction without code changes | 100% configurable via runtime settings; zero hard-coded jurisdiction logic |
| RPT-09 | Audit Log Retention Coverage | Percentage of audit records retained for the regulatory-required retention period (minimum 7 years) | 100% retention compliance; zero premature deletions |
| RPT-10 | Concurrent Report Generation Capacity | Number of simultaneous export jobs supported without queue overflow or degraded latency | System supports ≥ 20 concurrent export jobs; queue saturation alerts triggered at 80% capacity |

---

## Module 7: AI Assistant Module (`ai-service`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| AI-01 | Document Compliance Check Latency | Time for `POST /api/v1/ai/analyze-document` to return `complianceStatus`, `discrepancies`, and `riskScore` | P95 latency < 10 seconds per document |
| AI-02 | Discrepancy Detection Accuracy | Accuracy of AI-detected discrepancies vs. manual compliance review baseline | ≥ 95% accuracy; false-negative rate < 2% |
| AI-03 | AI Query Response Latency | Time for `POST /api/v1/ai/query` to return a contextual response | P95 latency < 5 seconds per query |
| AI-04 | AI Service Availability | Uptime of `ai-service` endpoint | ≥ 99.5% monthly availability |
| AI-05 | AI Service Unavailability Fallback Rate | Percentage of document analysis requests that correctly trigger the 3-attempt retry + manual review flag when `ai-service` is unreachable | 100% fallback activation; zero requests lost or silently dropped |
| AI-06 | Risk Score Calibration Accuracy | Percentage of AI-generated `riskScore` values validated within acceptable tolerance vs. expert-reviewed risk assessments | ≥ 90% within ±5% tolerance of expert assessment |
| AI-07 | False Positive Discrepancy Rate | Percentage of AI-flagged discrepancies that are cleared as non-issues on manual review | < 5% false positive rate |
| AI-08 | Document Quality Degradation Handling | Percentage of low-quality document uploads (poor scan, low resolution) that trigger a quality warning vs. producing a silent incorrect result | 100% of low-quality uploads surface a quality warning; zero silent incorrect analyses |
| AI-09 | AI Audit Trail Coverage | Percentage of `ai-service` analyze and query calls logged in `reporting-service` with inputs, outputs, and timestamps | 100% coverage; all AI interactions auditable |
| AI-10 | Retry Queue Success Rate | Percentage of queued document analysis retries (exponential backoff) that succeed before falling back to manual review | ≥ 70% resolved within retry window before manual escalation |

---

## Module 8: API Gateway (Cross-Cutting — `api-gateway`)

| KPI Number | KPI Name | Description | Criteria |
| --- | --- | --- | --- |
| GW-01 | API Gateway Uptime | Availability of `api-gateway` as the single entry point for all service traffic | ≥ 99.9% monthly uptime |
| GW-02 | End-to-End API Latency (P95) | P95 response latency measured at `api-gateway` for all non-export endpoints | < 500ms across all routed endpoints |
| GW-03 | Rate Limiting Enforcement Rate | Percentage of requests exceeding rate limits correctly throttled with `429 Too Many Requests` | 100% enforcement; zero bypass of rate limit policy |
| GW-04 | Auth Token Enforcement Rate | Percentage of requests missing or carrying invalid JWT correctly rejected at `api-gateway` before reaching downstream services | 100% enforcement; zero unauthenticated requests reaching services |
| GW-05 | RBAC Enforcement at Gateway | Percentage of role-unauthorized requests blocked at `api-gateway` before reaching `core-business-service` | 100% blocking rate; `403 Forbidden` returned for all unauthorized role attempts |
| GW-06 | Single Point of Failure Mitigation | Percentage of `api-gateway` node failures that trigger automatic failover to standby instance | ≥ 99.9% failover success rate within ≤ 10 seconds of primary failure |
| GW-07 | Request Routing Accuracy | Percentage of incoming requests correctly routed to the intended downstream service | 100% routing accuracy; zero misrouted requests |

---

# Development Timeline

| Sprint | Focus Area | Deliverables |
| --- | --- | --- |
| Sprint 1 | Auth Module & User Management | `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`; RBAC role provisioning; JWT middleware at `api-gateway`; `POST /users`, `GET /users`, `PUT /users/{id}`; brute-force lockout; audit log for user events |
| Sprint 2 | Workflow Management — LC Issuance | `POST /lc` (LC creation); `GET /lc/{lcId}`; `PUT /lc/{lcId}/status`; compliance validation hook; idempotency key enforcement; duplicate LC rejection; concurrent optimistic locking; audit trail per LC state change |
| Sprint 3 | Workflow Management — Documents & Settlement | `POST /lc/{lcId}/documents`; document format validation; AI integration hook for compliance check; `POST /lc/{lcId}/settlement`; settlement amount validation; `422` mismatch handling; settlement audit record |
| Sprint 4 | Notification Module | `POST /notifications/send`; EVENT → notification trigger integration; EMAIL/SMS/IN_APP channel routing; 3-attempt retry with exponential backoff; fallback to IN_APP; delivery failure audit logging; `GET /notifications/{userId}` |
| Sprint 5 | Dashboard & Analytics Module | `GET /dashboard/summary`; real-time `activeLCs`, `pendingSettlements`, `complianceScore`, `overdueWorkflows` metrics; role-scoped data filtering; cache refresh ≤ 60 seconds; concurrent load testing |
| Sprint 6 | Reporting & Audit Module | `GET /reports/audit` with filter params; `POST /reports/export` (PDF/CSV); async job queue for large exports; `202 Accepted` + job ID flow; immutable audit log enforcement; retention policy configuration; regional configurability |
| Sprint 7 | AI Assistant Module | `POST /ai/analyze-document`; discrepancy detection pipeline; `riskScore` output; `POST /ai/query`; contextual LC-aware responses; `ai-service` unavailability retry + fallback; document quality warning; AI audit logging |
| Sprint 8 | API Gateway Hardening & Integration | Rate limiting enforcement; RBAC enforcement at gateway layer; high-availability failover configuration; end-to-end latency validation; full cross-module integration testing; edge case validation (all 10 from PRD) |
| Sprint 9 | QA, UAT & Compliance Validation | KPI validation against all acceptance criteria; UCP 600 compliance review; DPIA review; penetration testing; load testing (200 concurrent users); audit trail completeness verification; stakeholder UAT sign-off |
| Sprint 10 | Stabilization & Go-Live Preparation | Bug fixes from UAT; performance tuning; SLA documentation; runbook creation; monitoring & alerting setup; production deployment readiness review |

---

# Success Criteria

| Category | Success Metric | Target |
| --- | --- | --- |
| **Authentication & Security** | Login success rate | ≥ 99.5% |
| **Authentication & Security** | Unauthorized access blocking rate | 100% |
| **Authentication & Security** | Privilege escalation incidents per quarter | Zero |
| **Authentication & Security** | Brute-force lockout trigger accuracy | 100% (after 5 failures in 10 min) |
| **User Management** | User provisioning end-to-end time | ≤ 5 minutes |
| **User Management** | PII masking coverage in API responses and logs | 100% |
| **User Management** | Admin dual-control compliance rate | 100% |
| **Workflow Management** | LC end-to-end processing time (average) | < 4 hours |
| **Workflow Management** | Settlement error rate | < 0.5% of total settlements |
| **Workflow Management** | Duplicate LC prevention rate | 100% |
| **Workflow Management** | Concurrent conflict detection accuracy | 100% (zero silent overwrites) |
| **Workflow Management** | Document format rejection accuracy | 100% |
| **Dashboard & Analytics** | Dashboard data freshness | Stale data ≤ 60 seconds |
| **Dashboard & Analytics** | Dashboard API availability | ≥ 99.9% monthly |
| **Dashboard & Analytics** | Role-scoped data leak incidents | Zero |
| **Notifications** | Notification delivery rate (all channels) | ≥ 99% |
| **Notifications** | Notification dispatch latency from event | ≤ 30 seconds |
| **Notifications** | Delivery failure fallback activation | 100% (after 3 retry failures) |
| **Notifications** | Notification failure audit logging | 100% coverage |
| **Reporting & Audit** | Audit trail completeness | 100% of all lifecycle events |
| **Reporting & Audit** | Audit record immutability | 0% post-creation modification rate |
| **Reporting & Audit** | Sync export completion rate (within 60 seconds) | ≥ 95% |
| **Reporting & Audit** | Async export job completion rate (within 10 minutes) | ≥ 99% |
| **Reporting & Audit** | Audit log retention coverage (7-year minimum) | 100% |
| **AI Assistant** | Document compliance check P95 latency | < 10 seconds |
| **AI Assistant** | Discrepancy detection accuracy vs. manual review | ≥ 95% |
| **AI Assistant** | False positive discrepancy rate | < 5% |
| **AI Assistant** | AI unavailability fallback activation | 100% (zero lost requests) |
| **AI Assistant** | AI interaction audit log coverage | 100% |
| **API Gateway** | API gateway uptime | ≥ 99.9% monthly |
| **API Gateway** | End-to-end P95 API latency (non-export) | < 500ms |
| **API Gateway** | Rate limiting enforcement accuracy | 100% |
| **API Gateway** | JWT enforcement at gateway (pre-service) | 100% |
| **API Gateway** | Failover to standby on primary failure | ≥ 99.9% within ≤ 10 seconds |
| **Compliance & Governance** | UCP 600 workflow logic validation sign-off | Legal counsel sign-off before go-live |
| **Compliance & Governance** | DPIA completion for PII modules | Completed and approved before Sprint 9 UAT |
| **Compliance & Governance** | Regional report configurability (no code change) | 100% runtime configurable |
| **Overall System** | System-wide API availability | ≥ 99.9% monthly |
| **Overall System** | Stakeholder UAT sign-off | 100% of acceptance criteria passed in Sprint 9 |

---
