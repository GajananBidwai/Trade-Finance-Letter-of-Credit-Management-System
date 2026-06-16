# Feature: User Login & JWT Authentication

## Feature ID
`F-01`

## Purpose
Enable trade officers, compliance analysts, bank relationship managers, and settlement teams to securely authenticate into the Trade Finance & LC Management System using email/password credentials. The system issues a signed JWT and refresh token with embedded RBAC role data, forming the security foundation for all downstream module access.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-01-1 | Trade Officer | Log in with my email and password | I can access LC issuance and workflow management features |
| US-01-2 | Compliance Analyst | Receive a JWT with my role encoded | I don't need to re-authenticate for every action within my session |
| US-01-3 | System (api-gateway) | Validate every inbound JWT before routing | Unauthenticated requests never reach downstream services |
| US-01-4 | Back-Office Officer | Refresh my session token silently | My session continues uninterrupted without a forced re-login during active work |
| US-01-5 | Settlement Officer | Be locked out after repeated failed login attempts | My account is protected from brute-force attacks |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-01-1 | System must accept `email` and `password` as login payload via `POST /api/v1/auth/login`. |
| FR-01-2 | On successful authentication, system must return a signed JWT, a refresh token, and user object containing `id`, `role`. |
| FR-01-3 | JWT must have a configurable expiry (default: 15 minutes). Refresh token must have a longer configurable expiry (default: 7 days). |
| FR-01-4 | `POST /api/v1/auth/refresh` must accept a valid refresh token and return a new JWT. |
| FR-01-5 | `POST /api/v1/auth/logout` must revoke the JWT server-side immediately upon receipt. |
| FR-01-6 | System must track failed login attempts per account. Lock account after 5 consecutive failures within 10 minutes. |
| FR-01-7 | All authentication events (login, logout, refresh, lockout) must be written to the audit log in `reporting-service`. |
| FR-01-8 | `api-gateway` must validate JWT on every inbound request before routing to any downstream service. |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `email` | Required. Must be a valid RFC 5322 email format. |
| `password` | Required. Minimum 8 characters. Must not be empty. |
| JWT | Must be signed with HS256 or RS256. Must not be expired. Must contain `userId`, `role`, `iat`, `exp`. |
| `refreshToken` | Must match server-side stored token. Single-use; rotated on each refresh. |
| Login attempt counter | Reset to 0 on successful login. Increment on each failure. Lock at 5 within 10-minute window. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Expired JWT on inbound request | `api-gateway` returns `401 Unauthorized`. Client must call `/auth/refresh`. |
| Both JWT and refresh token expired | Force re-login. Return `401` with message `"Session expired. Please log in again."` |
| Login attempt after account lockout | Return `423 Locked` with message `"Account locked. Try again after 10 minutes."` |
| Logout with already-revoked token | Return `200 OK` idempotently; no error. |
| Refresh token reuse (replay attack) | Detect reuse, invalidate the entire token family, force re-login. |
| Non-existent email submitted | Return `401 Unauthorized` (do not reveal whether email exists). |
| Malformed JWT (tampered signature) | `api-gateway` rejects with `401 Unauthorized`. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `auth-service` | Internal Service | Handles credential validation, token issuance, and revocation |
| `api-gateway` | Internal Service | JWT middleware applied to every inbound route |
| `reporting-service` | Internal Service | Receives auth audit events |
| MongoDB | Database | Stores user credentials (hashed), refresh token records, lockout counters |
| Redis | Cache | Stores refresh token revocation list and active session metadata |

---

## API Requirements

### `POST /api/v1/auth/login`
- **Payload:** `{ "email": "string", "password": "string" }`
- **Response 200:** `{ "status": "success", "data": { "token": "jwt_string", "refreshToken": "string", "user": { "id": "uuid", "role": "string" } } }`
- **Response 401:** `{ "status": "error", "message": "Invalid credentials" }`
- **Response 423:** `{ "status": "error", "message": "Account locked. Try again after 10 minutes." }`

### `POST /api/v1/auth/refresh`
- **Payload:** `{ "refreshToken": "string" }`
- **Response 200:** `{ "status": "success", "data": { "token": "jwt_string" } }`
- **Response 401:** `{ "status": "error", "message": "Invalid or expired refresh token" }`

### `POST /api/v1/auth/logout`
- **Payload:** `{ "token": "jwt_string" }`
- **Response 200:** `{ "status": "success", "message": "Logged out" }`

---

## Database Impact

### Collection: `users`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | Primary key |
| `email` | String | Unique, indexed |
| `passwordHash` | String | bcrypt hash; never returned in API response |
| `role` | String | Enum: `TRADE_OFFICER`, `COMPLIANCE_ANALYST`, `SETTLEMENT_OFFICER`, `ADMIN`, `READ_ONLY` |
| `status` | String | Enum: `ACTIVE`, `LOCKED`, `INACTIVE` |
| `failedLoginCount` | Number | Reset on successful login |
| `lockoutUntil` | Date | Null if not locked |
| `createdAt` | Date | — |
| `updatedAt` | Date | — |

### Collection: `refresh_tokens`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | — |
| `userId` | UUID | FK to `users` |
| `tokenHash` | String | Hashed refresh token |
| `expiresAt` | Date | — |
| `revoked` | Boolean | Set to true on logout or reuse detection |
| `createdAt` | Date | — |

### Collection: `audit_logs` (written via `reporting-service`)
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | e.g., `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_LOCKOUT` |
| `userId` | UUID | — |
| `timestamp` | Date | — |
| `ipAddress` | String | — |
| `outcome` | String | `SUCCESS` or `FAILURE` |

---

## UI Components

| Component | Description |
| --- | --- |
| `LoginForm` | Email + password fields, submit button, inline validation errors |
| `BruteForceWarning` | Banner shown after 3 failed attempts warning of impending lockout |
| `AccountLockedScreen` | Full-screen message with lockout duration countdown |
| `SessionExpiredModal` | Modal prompting re-login when refresh token is also expired |
| `LoadingSpinner` | Shown during authentication API call |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Password hashing | bcrypt with minimum cost factor 12 |
| JWT signing algorithm | RS256 (asymmetric) preferred; HS256 acceptable with secret rotation |
| Refresh token storage | HttpOnly, Secure, SameSite=Strict cookie or encrypted client-side storage |
| Transport | HTTPS only; HTTP requests rejected at gateway |
| Token revocation | Server-side revocation list stored in Redis with TTL matching token expiry |
| PII in logs | Email must be masked in all log outputs (e.g., `jo**@example.com`) |
| Brute-force protection | Rate limiting at `api-gateway` + account-level lockout in `auth-service` |

---

## Acceptance Criteria

- [ ] GIVEN valid email and password, WHEN `POST /api/v1/auth/login` is called, THEN `200 OK` returns JWT, refresh token, and user role.
- [ ] GIVEN an expired JWT, WHEN any authenticated endpoint is called, THEN `401 Unauthorized` is returned.
- [ ] GIVEN a valid refresh token, WHEN `POST /api/v1/auth/refresh` is called, THEN a new JWT is returned.
- [ ] GIVEN 5 consecutive failed logins within 10 minutes, WHEN the 5th attempt is made, THEN account is locked and `423 Locked` returned.
- [ ] GIVEN a logged-out user's JWT, WHEN any authenticated endpoint is called, THEN `401 Unauthorized` is returned.
- [ ] GIVEN any auth event, WHEN it occurs, THEN an audit record is created in `reporting-service` within 5 seconds.
- [ ] GIVEN a request with no JWT, WHEN it reaches `api-gateway`, THEN `401 Unauthorized` is returned before routing to any service.
- [ ] GIVEN login under P95 load, WHEN `POST /api/v1/auth/login` is called, THEN response time < 300ms.

---

## Definition of Done

- [ ] `POST /api/v1/auth/login`, `/auth/refresh`, `/auth/logout` implemented and unit tested.
- [ ] JWT middleware integrated at `api-gateway`; all routes protected.
- [ ] Brute-force lockout logic implemented with Redis counter and TTL.
- [ ] Refresh token rotation and replay-attack detection implemented.
- [ ] All auth events written to `reporting-service` audit log.
- [ ] P95 latency < 300ms validated under load test.
- [ ] PII masking verified in all log outputs.
- [ ] Security review completed: password hashing, transport security, token storage.
- [ ] All acceptance criteria pass in QA environment.
