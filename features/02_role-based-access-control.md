# Feature: Role-Based Access Control (RBAC)

## Feature ID
`F-02`

## Purpose
Enforce fine-grained, role-based permissions across all modules at the `api-gateway` layer. Every inbound request is evaluated against the authenticated user's role before being routed to any downstream service. No downstream service performs its own authorization — the gateway is the single enforcement point.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-02-1 | System (api-gateway) | Evaluate the user's role from JWT claims before routing any request | Downstream services receive only pre-authorized requests |
| US-02-2 | Admin | Assign roles and permissions to users | Each team member can only perform actions within their designated scope |
| US-02-3 | Compliance Analyst | Be restricted from performing settlement actions | Risk of unauthorized financial operations is eliminated |
| US-02-4 | Trade Officer | Be restricted from accessing admin user management endpoints | Segregation of duties is enforced at all times |
| US-02-5 | Security Auditor | See every unauthorized access attempt logged | Privilege escalation attempts are detectable and auditable |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-02-1 | System must define and enforce the following roles: `ADMIN`, `TRADE_OFFICER`, `COMPLIANCE_ANALYST`, `SETTLEMENT_OFFICER`, `READ_ONLY`. |
| FR-02-2 | Each role must have a defined permission matrix specifying allowed HTTP methods and endpoint patterns. |
| FR-02-3 | `api-gateway` must extract the `role` claim from the JWT and evaluate it against the permission matrix before routing. |
| FR-02-4 | Requests from users with insufficient role must be rejected with `403 Forbidden` before any downstream service is invoked. |
| FR-02-5 | Role permission matrix must be configurable at runtime without requiring service redeployment. |
| FR-02-6 | All `403 Forbidden` rejections must be logged to `reporting-service` with userId, attempted endpoint, method, and timestamp. |
| FR-02-7 | Admin role changes must propagate to `api-gateway` enforcement within 30 seconds of update. |
| FR-02-8 | Admin mutations (role assignment, permission changes) must require dual-control secondary approval before becoming effective. |

---

## Validation Rules

| Rule | Detail |
| --- | --- |
| JWT `role` claim | Must be present and match a known system role. Missing or unknown role → `403 Forbidden`. |
| Endpoint-role matrix | Every protected route must have at least one permitted role defined. Unmatched routes default to `403`. |
| Dual-control approval | Admin-initiated role changes must have a different approver than the initiator. Self-approval not permitted. |
| Role propagation | Redis role cache TTL must be ≤ 30 seconds to ensure prompt enforcement of role changes. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| JWT with unknown/invalid role | `403 Forbidden` returned; request not routed. |
| Role changed mid-session | New role applied on next token refresh (within 30 seconds via Redis cache invalidation). |
| Admin attempts self-approval of role change | Request rejected; message: `"Self-approval is not permitted for admin mutations."` |
| `READ_ONLY` user calls `POST /api/v1/lc` | `403 Forbidden` returned at gateway. |
| Route with no role defined in permission matrix | Default deny; `403 Forbidden` returned. |
| Concurrent dual-control approval race condition | Optimistic locking on approval record; second approver receives `409 Conflict`. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `auth-service` | Internal Service | Source of truth for role assignments |
| `api-gateway` | Internal Service | Single RBAC enforcement point |
| Redis | Cache | Stores role permission matrix; TTL ≤ 30 seconds |
| `reporting-service` | Internal Service | Receives `403` audit events |
| F-01 (JWT Authentication) | Feature | JWT must be issued with `role` claim before RBAC can be evaluated |

---

## API Requirements

> RBAC is enforced at the gateway layer. No dedicated RBAC endpoint exists. Enforcement is implicit on all protected routes.

### Role Permission Matrix (Reference)

| Role | Permitted Operations |
| --- | --- |
| `ADMIN` | All endpoints including user management and system configuration |
| `TRADE_OFFICER` | LC create, read, document upload; dashboard read; notifications read |
| `COMPLIANCE_ANALYST` | LC read, status update (approval/rejection); dashboard read; reports read |
| `SETTLEMENT_OFFICER` | LC settlement; dashboard read; notifications read |
| `READ_ONLY` | GET endpoints only across all modules; no mutations permitted |

### `GET /api/v1/rbac/matrix` *(Internal/Admin only)*
- **Response 200:** `{ "status": "success", "data": { "roles": { "TRADE_OFFICER": ["GET /lc/*", "POST /lc", ...] } } }`

---

## Database Impact

### Collection: `role_permissions` *(config store)*
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | — |
| `role` | String | Enum of system roles |
| `allowedEndpoints` | Array\<String\> | Patterns e.g., `"POST /api/v1/lc"` |
| `updatedAt` | Date | — |
| `updatedBy` | UUID | Admin user who last modified |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `RBAC_DENIED` |
| `userId` | UUID | — |
| `attemptedEndpoint` | String | — |
| `attemptedMethod` | String | — |
| `timestamp` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `RolePermissionMatrix` | Admin UI table showing roles vs. permitted endpoint patterns; inline edit with dual-approval trigger |
| `UnauthorizedScreen` | Rendered when `403 Forbidden` is returned; displays user's current role and contact information |
| `DualApprovalModal` | Modal requiring a second admin to confirm role assignment changes |
| `RoleBadge` | Displays the authenticated user's role in the navigation header |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Single enforcement point | RBAC evaluated only at `api-gateway`; downstream services must not re-implement authorization |
| Cache invalidation | Redis role cache must be invalidated within 30 seconds of any role change |
| Audit completeness | 100% of `403` events must produce an audit record; zero silent drops |
| Privilege escalation detection | Any attempt to access an endpoint above the user's role must trigger an audit event and alert |
| Dual-control immutability | Approved role changes must be append-only in audit log; no modification permitted post-approval |

---

## Acceptance Criteria

- [ ] GIVEN a `READ_ONLY` user JWT, WHEN `POST /api/v1/lc` is called, THEN `403 Forbidden` is returned at `api-gateway`.
- [ ] GIVEN a `TRADE_OFFICER` JWT, WHEN `DELETE /api/v1/users/{id}` is attempted, THEN `403 Forbidden` is returned.
- [ ] GIVEN an admin role change, WHEN a second admin approves it, THEN the permission propagates to the gateway within 30 seconds.
- [ ] GIVEN an admin who initiated a role change, WHEN they attempt self-approval, THEN request is rejected.
- [ ] GIVEN any `403` event, WHEN it occurs, THEN an audit record is written to `reporting-service`.
- [ ] GIVEN a user's role is changed, WHEN their next JWT is issued (on refresh), THEN the new role is enforced.
- [ ] GIVEN 0 unauthorized privilege escalation incidents, WHEN monitored over a quarter, THEN count remains zero.

---

## Definition of Done

- [ ] Role permission matrix defined and loaded into Redis on service startup.
- [ ] RBAC middleware implemented at `api-gateway`; evaluates JWT `role` claim against permission matrix on every request.
- [ ] `403 Forbidden` response standardized with structured error body.
- [ ] All `403` events written to `reporting-service` audit log.
- [ ] Dual-control approval flow implemented for admin role mutations.
- [ ] Redis cache TTL set to ≤ 30 seconds; role propagation validated.
- [ ] Admin UI permission matrix table implemented with dual-approval modal.
- [ ] All acceptance criteria pass in QA environment.
