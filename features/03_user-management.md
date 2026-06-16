# Feature: User Management

## Feature ID
`F-03`

## Purpose
Allow administrators to create, update, deactivate, and list user accounts within the Trade Finance & LC Management System. Each user is provisioned with a specific RBAC role and permission set. All admin-level mutations require dual-control secondary approval. All PII fields are masked in API responses and logs.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-03-1 | Admin | Create a new user account with a specific role | New team members can access the system with appropriate permissions |
| US-03-2 | Admin | Update a user's role or status | Personnel changes are immediately reflected in system permissions |
| US-03-3 | Admin | Deactivate a user account | Former employees lose system access immediately |
| US-03-4 | Admin | List all user accounts with their roles and statuses | I have full visibility over who has access to the system |
| US-03-5 | Security Officer | Have all admin mutations require a second approver | Unauthorized or accidental privilege grants are prevented |
| US-03-6 | Compliance Officer | Have PII automatically masked in all API responses and logs | Regulatory data privacy requirements are satisfied |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-03-1 | `POST /api/v1/users` must create a new user record with `name`, `email`, `role`, and `permissions`. |
| FR-03-2 | `GET /api/v1/users` must return a paginated list of all users with `id`, `name`, `role`, and `status`. |
| FR-03-3 | `PUT /api/v1/users/{id}` must update `role`, `permissions`, and/or `status` for the specified user. |
| FR-03-4 | All admin-level mutations (`POST`, `PUT` on user records) must be staged as pending and require a secondary admin approval before commit. |
| FR-03-5 | Duplicate email submissions must be rejected with `409 Conflict`. |
| FR-03-6 | All PII fields (`email`, `name`) must be masked in API responses returned to non-admin roles and in all system log outputs. |
| FR-03-7 | User accounts inactive for more than 90 days must be automatically flagged and deactivated within 24 hours of reaching the threshold. |
| FR-03-8 | All user create/update/delete events must be written to the audit log in `reporting-service`. |
| FR-03-9 | Role changes must propagate to `api-gateway` RBAC enforcement within 30 seconds. |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `name` | Required. 2–100 characters. |
| `email` | Required. RFC 5322 format. Must be unique across all user records. |
| `role` | Required. Must be one of: `ADMIN`, `TRADE_OFFICER`, `COMPLIANCE_ANALYST`, `SETTLEMENT_OFFICER`, `READ_ONLY`. |
| `permissions` | Optional array of strings. Must be valid permission identifiers defined in the role matrix. |
| `status` | Enum: `ACTIVE`, `INACTIVE`. Default: `ACTIVE` on creation. |
| Dual-approval | Approver must be a different `ADMIN` than the initiator. Self-approval rejected. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Duplicate email submission | Return `409 Conflict`: `"A user with this email already exists."` |
| Non-existent user `{id}` on PUT | Return `404 Not Found`. |
| Admin self-approval of mutation | Rejected: `"Self-approval is not permitted."` |
| Deactivation of the only active `ADMIN` | Blocked: `"System must retain at least one active admin."` |
| Role update for a currently logged-in user | New role applied on next JWT refresh (within 30 seconds). |
| Inactive threshold auto-deactivation failure | Alert generated; manual review required; failure logged in audit. |
| `GET /api/v1/users` with 10,000+ records | Response paginated; default page size 50; P95 latency < 400ms. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `auth-service` | Internal Service | Owns user records, password provisioning, and role storage |
| `api-gateway` | Internal Service | Enforces RBAC from user role data |
| Redis | Cache | Role permission cache invalidated on role update (≤ 30 sec TTL) |
| `reporting-service` | Internal Service | Receives user management audit events |
| F-01 (JWT Auth) | Feature | User must exist in the system before JWT issuance |
| F-02 (RBAC) | Feature | Role assignments feed directly into gateway permission enforcement |

---

## API Requirements

### `POST /api/v1/users`
- **Auth:** `ADMIN` only
- **Payload:** `{ "name": "string", "email": "string", "role": "string", "permissions": ["string"] }`
- **Response 201:** `{ "status": "success", "data": { "id": "uuid" } }`
- **Response 409:** `{ "status": "error", "message": "A user with this email already exists." }`

### `GET /api/v1/users`
- **Auth:** `ADMIN` only
- **Query Params:** `page`, `limit`, `role`, `status`
- **Response 200:** `{ "status": "success", "data": [ { "id": "uuid", "name": "string", "role": "string", "status": "string" } ], "pagination": { "page": 1, "total": 250 } }`

### `PUT /api/v1/users/{id}`
- **Auth:** `ADMIN` only (dual-approval required)
- **Payload:** `{ "role": "string", "permissions": ["string"], "status": "string" }`
- **Response 200:** `{ "status": "success", "data": { "id": "uuid" } }`
- **Response 404:** `{ "status": "error", "message": "User not found." }`

---

## Database Impact

### Collection: `users`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | Primary key |
| `name` | String | Masked in logs |
| `email` | String | Unique index; masked in logs |
| `passwordHash` | String | Never returned in API responses |
| `role` | String | Enum |
| `permissions` | Array\<String\> | Optional overrides |
| `status` | String | `ACTIVE` / `INACTIVE` |
| `lastActiveAt` | Date | Updated on each authenticated request |
| `createdBy` | UUID | Admin who created the record |
| `approvedBy` | UUID | Admin who approved the mutation |
| `createdAt` | Date | — |
| `updatedAt` | Date | — |

### Collection: `pending_user_mutations`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | — |
| `targetUserId` | UUID | User being modified |
| `initiatedBy` | UUID | Admin initiating the change |
| `proposedChanges` | Object | Snapshot of proposed field changes |
| `status` | String | `PENDING` / `APPROVED` / `REJECTED` |
| `approvedBy` | UUID | Second admin who approved |
| `createdAt` | Date | — |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `USER_CREATED`, `USER_UPDATED`, `USER_DEACTIVATED` |
| `performedBy` | UUID | Admin who initiated |
| `approvedBy` | UUID | Admin who approved |
| `targetUserId` | UUID | — |
| `changes` | Object | Before/after snapshot |
| `timestamp` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `UserListTable` | Paginated table of all users with role badges, status indicators, and action buttons |
| `CreateUserForm` | Form with name, email, role selector, and permission checkboxes |
| `EditUserModal` | Modal for updating role/status/permissions; triggers dual-approval flow |
| `DualApprovalModal` | Second-admin confirmation dialog for all user mutations |
| `InactiveUserAlert` | Dashboard alert showing users flagged for auto-deactivation |
| `PendingMutationBadge` | Visual indicator on user rows with pending unapproved changes |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| PII masking | `email` and `name` masked in all log outputs and API responses for non-`ADMIN` roles |
| Dual-control | 100% of admin user mutations require a second approver; initiator cannot self-approve |
| Audit immutability | User event audit records are append-only; no modification permitted post-creation |
| Password provisioning | System sends a temporary password via secure channel on user creation; user forced to change on first login |
| Inactive deactivation | Automated job runs every 24 hours; any failure generates an alert |

---

## Acceptance Criteria

- [ ] GIVEN a valid new user payload, WHEN `POST /api/v1/users` is called by an `ADMIN`, THEN `201 Created` is returned and the user is in `PENDING` approval state.
- [ ] GIVEN the pending user mutation is approved by a second admin, WHEN approval is confirmed, THEN the user account becomes `ACTIVE` within 5 minutes.
- [ ] GIVEN a duplicate email, WHEN `POST /api/v1/users` is called, THEN `409 Conflict` is returned.
- [ ] GIVEN an admin initiating a role change, WHEN they attempt self-approval, THEN request is rejected.
- [ ] GIVEN a role update is approved, WHEN applied, THEN the new role propagates to `api-gateway` within 30 seconds.
- [ ] GIVEN `GET /api/v1/users` with 10,000 records, WHEN called, THEN P95 response time < 400ms with pagination.
- [ ] GIVEN a user inactive for > 90 days, WHEN the nightly job runs, THEN account is deactivated within 24 hours.
- [ ] GIVEN any user management event, WHEN it occurs, THEN an audit record with initiator, approver, and changes is written to `reporting-service`.
- [ ] GIVEN any API response, WHEN PII fields are present, THEN `email` and `name` are masked for non-`ADMIN` consumers.

---

## Definition of Done

- [ ] `POST /api/v1/users`, `GET /api/v1/users`, `PUT /api/v1/users/{id}` implemented and unit tested.
- [ ] Dual-control approval flow implemented with `pending_user_mutations` collection.
- [ ] PII masking applied in all log outputs and non-admin API responses.
- [ ] Inactive user auto-deactivation job implemented and tested.
- [ ] Role propagation to Redis cache (≤ 30 sec) validated.
- [ ] All user management events written to `reporting-service` audit log.
- [ ] P95 latency < 400ms for `GET /api/v1/users` with 10,000 records validated.
- [ ] All acceptance criteria pass in QA environment.
