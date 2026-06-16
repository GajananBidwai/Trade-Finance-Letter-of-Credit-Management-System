# Feature: API Gateway — Security, Routing & Rate Limiting

## Feature ID
`F-12`

## Purpose
The `api-gateway` is the single, secure entry point for all inbound traffic to the Trade Finance & LC Management System. It enforces JWT authentication, RBAC-based authorization, rate limiting, and accurate request routing to downstream services (`auth-service`, `core-business-service`, `notification-service`, `reporting-service`, `ai-service`). High-availability failover is configured to ensure ≥ 99.9% monthly uptime.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-12-1 | System | Validate every inbound JWT at the gateway before routing | No unauthenticated request ever reaches a downstream service |
| US-12-2 | System | Apply RBAC enforcement at the gateway per route | Downstream services are never burdened with authorization logic |
| US-12-3 | System | Enforce rate limits per client to prevent abuse | No single client can overwhelm the system with excessive requests |
| US-12-4 | System | Route requests accurately to the correct downstream service | Each service receives only the requests it is responsible for |
| US-12-5 | Infrastructure Team | Have automatic failover to a standby gateway instance | System remains available even if the primary gateway node fails |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-12-1 | `api-gateway` must validate the JWT on every inbound request before routing. Requests with missing, expired, or tampered JWTs must return `401 Unauthorized`. |
| FR-12-2 | `api-gateway` must evaluate the JWT `role` claim against the configured route permission matrix for every request. Role-insufficient requests must return `403 Forbidden`. |
| FR-12-3 | `api-gateway` must enforce rate limiting per authenticated user (and per IP for unauthenticated requests). Exceeding limits returns `429 Too Many Requests`. |
| FR-12-4 | `api-gateway` must route each request to the correct downstream service based on the request path prefix. |
| FR-12-5 | `api-gateway` must support high-availability configuration with automatic failover to a standby instance within ≤ 10 seconds of primary failure. |
| FR-12-6 | P95 end-to-end latency (measured at gateway) must be < 500ms for all non-export endpoints. |
| FR-12-7 | All `401`, `403`, and `429` responses must be logged to `reporting-service` audit log. |
| FR-12-8 | `api-gateway` must achieve ≥ 99.9% monthly uptime. |

---

## Route-to-Service Mapping

| Path Prefix | Downstream Service | Notes |
| --- | --- | --- |
| `/api/v1/auth/*` | `auth-service` | Login, logout, refresh |
| `/api/v1/users/*` | `auth-service` | User management |
| `/api/v1/lc/*` | `core-business-service` | LC lifecycle, documents, settlement |
| `/api/v1/dashboard/*` | `core-business-service` | Dashboard summary |
| `/api/v1/notifications/*` | `notification-service` | Send and retrieve notifications |
| `/api/v1/reports/*` | `reporting-service` | Audit trail, export |
| `/api/v1/ai/*` | `ai-service` | Document analysis and query |

---

## Rate Limit Policy

| User Type | Endpoint Category | Limit |
| --- | --- | --- |
| Authenticated user | General endpoints | 300 requests / 15 minutes |
| Authenticated user | Export endpoints | 10 requests / hour |
| Unauthenticated (IP-based) | `/auth/login` only | 10 requests / 10 minutes |
| Any | Any | Hard cap: 1000 requests / minute per IP |

---

## Validation Rules

| Rule | Detail |
| --- | --- |
| JWT presence | `Authorization: Bearer <token>` header required on all protected routes. |
| JWT signature | Verified against public key (RS256) or secret (HS256). Tampered signature → `401`. |
| JWT expiry | `exp` claim checked on every request. Expired → `401`. |
| Role claim | `role` claim must be present and match a known role. Unknown role → `403`. |
| Route existence | Requests to undefined routes return `404 Not Found`. |
| Rate limit headers | All responses must include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Missing `Authorization` header | `401 Unauthorized`: `"Authentication token is required."` |
| Expired JWT | `401 Unauthorized`: `"Token has expired. Please refresh your session."` |
| Tampered JWT (invalid signature) | `401 Unauthorized`: `"Invalid authentication token."` |
| Valid JWT but insufficient role | `403 Forbidden`: `"You do not have permission to perform this action."` |
| Rate limit exceeded | `429 Too Many Requests` with `Retry-After` header. |
| Primary gateway node failure | Automatic failover to standby within ≤ 10 seconds. In-flight requests retried. |
| Downstream service unavailable | `502 Bad Gateway`: `"Upstream service is temporarily unavailable."` |
| Route not found | `404 Not Found`: `"Endpoint not found."` |
| Downstream service timeout | `504 Gateway Timeout` after configurable timeout (default: 30 seconds). |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `auth-service` | Downstream Service | Token validation public key sourced from `auth-service` JWKS endpoint |
| `core-business-service` | Downstream Service | Routes LC, dashboard endpoints |
| `notification-service` | Downstream Service | Routes notification endpoints |
| `reporting-service` | Downstream Service | Routes audit/report endpoints; also receives gateway audit events |
| `ai-service` | Downstream Service | Routes AI endpoints |
| Redis | Cache | Stores rate limit counters (per user/IP) and role permission matrix cache |
| F-01 (JWT Auth) | Feature | JWT tokens issued by `auth-service` are validated at gateway |
| F-02 (RBAC) | Feature | Role permission matrix enforced at gateway |

---

## API Requirements

> The `api-gateway` does not expose its own business endpoints. All routing is transparent. The following apply to all routed requests:

### Standard Error Response Format
```json
{
  "status": "error",
  "code": "401 | 403 | 404 | 429 | 502 | 504",
  "message": "string"
}
```

### Standard Rate Limit Headers (on all responses)
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 245
X-RateLimit-Reset: 1718540400
```

### Health Check Endpoint
`GET /health`
- **Auth:** None
- **Response 200:** `{ "status": "ok", "uptime": "seconds", "version": "string" }`

---

## Database Impact

> `api-gateway` does not directly write to MongoDB.

### Redis Keys (managed by gateway)
| Key Pattern | Value | TTL |
| --- | --- | --- |
| `ratelimit:{userId}:general` | Request count | 15 minutes |
| `ratelimit:{userId}:export` | Request count | 60 minutes |
| `ratelimit:ip:{ip}:login` | Request count | 10 minutes |
| `rbac:matrix` | JSON route-role permission matrix | 30 seconds |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `GATEWAY_AUTH_DENIED`, `GATEWAY_RBAC_DENIED`, `GATEWAY_RATE_LIMITED` |
| `userId` | UUID | Null for unauthenticated requests |
| `ipAddress` | String | — |
| `requestedPath` | String | — |
| `responseCode` | Number | `401`, `403`, `429` |
| `timestamp` | Date | — |

---

## UI Components

> UI components for the gateway are limited to error states rendered by the frontend client.

| Component | Description |
| --- | --- |
| `UnauthorizedScreen` | Rendered on `401`; prompts re-login |
| `ForbiddenScreen` | Rendered on `403`; displays current role and contact info |
| `RateLimitedBanner` | Rendered on `429`; shows retry countdown from `Retry-After` header |
| `ServiceUnavailablePage` | Rendered on `502`/`504`; shows maintenance message with retry option |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| JWT validation | RS256 signature verified against JWKS from `auth-service` on every request |
| Single enforcement point | All RBAC and auth enforcement at gateway; downstream services trust gateway-forwarded headers |
| Rate limiting | Redis-backed per-user and per-IP counters; cannot be bypassed |
| Failover | Health checks every 5 seconds; automatic traffic shift to standby on 3 consecutive failures |
| Audit completeness | 100% of `401`, `403`, `429` events logged to `reporting-service` |
| HTTPS only | All HTTP requests rejected with `301 Redirect` to HTTPS; enforced at load balancer |

---

## Acceptance Criteria

- [ ] GIVEN a request with no `Authorization` header, WHEN it reaches the gateway, THEN `401 Unauthorized` is returned before routing.
- [ ] GIVEN an expired JWT, WHEN any protected endpoint is called, THEN `401 Unauthorized` is returned.
- [ ] GIVEN a valid JWT with a role that lacks permission for the requested route, WHEN called, THEN `403 Forbidden` is returned.
- [ ] GIVEN a user exceeding the rate limit (300 requests / 15 min), WHEN the 301st request is made, THEN `429 Too Many Requests` is returned with `Retry-After` header.
- [ ] GIVEN the primary gateway node fails, WHEN failover triggers, THEN traffic is routed to the standby instance within ≤ 10 seconds.
- [ ] GIVEN all inbound requests, WHEN measured at P95, THEN end-to-end latency < 500ms for non-export endpoints.
- [ ] GIVEN any `401`, `403`, or `429` event, WHEN it occurs, THEN an audit record is written to `reporting-service`.
- [ ] GIVEN 30 days of operation, WHEN uptime is measured, THEN gateway availability ≥ 99.9%.

---

## Definition of Done

- [ ] JWT validation middleware implemented and applied to all protected routes.
- [ ] RBAC middleware implemented; route-role permission matrix loaded from Redis with 30-second TTL.
- [ ] Rate limiting implemented per-user and per-IP with Redis counters; `429` with `Retry-After` header.
- [ ] Route-to-service mapping configured for all 7 service path prefixes.
- [ ] High-availability failover configured; health check every 5 seconds; failover ≤ 10 seconds.
- [ ] `GET /health` endpoint implemented.
- [ ] All `401`, `403`, `429` events written to `reporting-service` audit log.
- [ ] Standard rate limit headers included on all responses.
- [ ] P95 < 500ms validated under load test.
- [ ] All acceptance criteria pass in QA environment.
