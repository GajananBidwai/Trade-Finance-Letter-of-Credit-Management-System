# Feature: Event-Driven Notifications

## Feature ID
`F-09`

## Purpose
Dispatch real-time, event-driven notifications to relevant stakeholders for all significant LC lifecycle events — including LC submission, status changes, document compliance decisions, settlement confirmations, and compliance flags. Notifications are delivered via EMAIL, SMS, and IN_APP channels using Firebase FCM. Failed deliveries are retried 3 times with exponential backoff and fall back to IN_APP. All notification events are audit-logged.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-09-1 | Trade Officer | Receive an in-app and email notification when my LC status changes | I am always informed of workflow progress without manually polling |
| US-09-2 | Compliance Analyst | Be notified when a new LC is pending my review | I can prioritize and action new work promptly |
| US-09-3 | Settlement Officer | Be notified when an LC is ready for settlement | I don't miss settlement deadlines |
| US-09-4 | Beneficiary | Be notified when documents are accepted or rejected | I can take timely corrective action on discrepancies |
| US-09-5 | Any User | See a complete history of my notifications in-app | I can review past alerts I may have missed |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-09-1 | `POST /api/v1/notifications/send` must accept `recipientId`, `eventType`, `message`, and `channel` and dispatch the notification to the specified channel. |
| FR-09-2 | Notifications must be dispatched within 30 seconds of the triggering event. |
| FR-09-3 | Supported channels: `EMAIL`, `SMS`, `IN_APP`. Each channel dispatched independently per recipient preference. |
| FR-09-4 | Firebase FCM must be used for `IN_APP` push notifications. |
| FR-09-5 | Failed EMAIL or SMS deliveries must be retried up to 3 times with exponential backoff (1s, 2s, 4s intervals). |
| FR-09-6 | After 3 failed retries on EMAIL or SMS, system must fall back to `IN_APP` notification. Failure must be logged in `reporting-service`. |
| FR-09-7 | `GET /api/v1/notifications/{userId}` must return the complete, chronologically ordered notification history for the user. |
| FR-09-8 | Every notification dispatch (success or failure) must produce an audit record in `reporting-service` with timestamp, channel, recipient, and outcome. |
| FR-09-9 | Notification events must be triggered automatically by the following system events: LC created, LC status changed, document uploaded, discrepancy raised/waived, settlement processed. |

---

## Notification Event Trigger Map

| System Event | Recipient(s) | Channels |
| --- | --- | --- |
| LC created (`PENDING_APPROVAL`) | Trade Officer (confirmation), Compliance Analyst (review request) | EMAIL, IN_APP |
| LC status → `ACTIVE` | Trade Officer | EMAIL, IN_APP |
| LC status → `REJECTED` | Trade Officer | EMAIL, IN_APP |
| LC status → `SETTLED` | Trade Officer, Compliance Analyst, Beneficiary | EMAIL, SMS, IN_APP |
| LC status → `EXPIRED` | Trade Officer, Admin | EMAIL, IN_APP |
| Document uploaded | Compliance Analyst | IN_APP |
| Discrepancy raised | Beneficiary | EMAIL, SMS |
| All discrepancies waived | Trade Officer | IN_APP |
| AI service fallback (manual review flag) | Compliance Analyst | IN_APP, EMAIL |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `recipientId` | Required. Must be a valid `userId` in the system. |
| `eventType` | Required. Must be a defined notification event type enum. |
| `message` | Required. Max 1000 characters. |
| `channel` | Required. Must be one of: `EMAIL`, `SMS`, `IN_APP`. |
| `userId` (in `GET`) | Must match the authenticated user's own `userId`, unless caller is `ADMIN`. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| EMAIL delivery fails | Retry 3 times (1s, 2s, 4s). On all failures, fall back to `IN_APP`. Log failure. |
| SMS delivery fails | Same retry and fallback as EMAIL. |
| Firebase FCM push fails (IN_APP) | Log failure. No further fallback. Alert monitoring system. |
| `recipientId` does not exist | Log error. Notification dropped. Alert written to audit log. |
| `notification-service` is unavailable | Triggering service queues notification for retry on service recovery. |
| User has no registered push token | Skip `IN_APP` push; deliver via EMAIL/SMS if configured. |
| Notification history exceeds display limit | Response paginated; default page size 50, chronological order descending. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `notification-service` | Internal Service | Owns dispatch logic, retry, fallback, and Firebase FCM integration |
| Firebase FCM | External Service | Push notification delivery for IN_APP channel |
| Email Provider (e.g., SendGrid) | External Service | EMAIL channel delivery |
| SMS Provider (e.g., Twilio) | External Service | SMS channel delivery |
| `reporting-service` | Internal Service | Receives notification delivery audit events |
| Redis | Cache | Stores retry queue for failed notification dispatches |
| MongoDB | Database | Stores notification history per user |
| F-04, F-05, F-06, F-07 | Features | Trigger notification events on business events |

---

## API Requirements

### `POST /api/v1/notifications/send`
- **Auth:** Internal service-to-service call (not exposed to end users directly)
- **Payload:**
```json
{
  "recipientId": "uuid",
  "eventType": "string",
  "message": "string",
  "channel": "EMAIL | SMS | IN_APP"
}
```
- **Response 200:**
```json
{ "status": "success", "data": { "notificationId": "uuid" } }
```
- **Response 400:** `{ "status": "error", "message": "Invalid channel or recipient." }`

### `GET /api/v1/notifications/{userId}`
- **Auth:** Authenticated user (own `userId` only; `ADMIN` can access any)
- **Query Params:** `page`, `limit`, `read` (boolean filter)
- **Response 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "message": "string",
      "eventType": "string",
      "channel": "string",
      "read": false,
      "timestamp": "ISO8601"
    }
  ],
  "pagination": { "page": 1, "total": 120 }
}
```

---

## Database Impact

### Collection: `notifications`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | `notificationId` |
| `recipientId` | UUID | FK to `users` |
| `eventType` | String | Enum |
| `message` | String | — |
| `channel` | String | `EMAIL`, `SMS`, `IN_APP` |
| `deliveryStatus` | String | `SENT`, `FAILED`, `FALLBACK_SENT` |
| `retryCount` | Number | 0–3 |
| `read` | Boolean | Default: `false` |
| `createdAt` | Date | — |
| `deliveredAt` | Date | Null if not delivered |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `NOTIFICATION_SENT`, `NOTIFICATION_FAILED`, `NOTIFICATION_FALLBACK` |
| `notificationId` | UUID | — |
| `recipientId` | UUID | — |
| `channel` | String | — |
| `outcome` | String | `SUCCESS`, `FAILURE`, `FALLBACK` |
| `timestamp` | Date | — |
| `errorDetail` | String | Provider error message if failed |

---

## UI Components

| Component | Description |
| --- | --- |
| `NotificationBell` | Navigation header icon with unread count badge; opens notification dropdown |
| `NotificationDropdown` | List of recent unread IN_APP notifications with mark-as-read on click |
| `NotificationHistoryPage` | Full paginated notification history with filters (read/unread, event type) |
| `NotificationToast` | Auto-dismissing toast for real-time IN_APP push arrivals |
| `ChannelPreferenceSettings` | User settings panel to enable/disable EMAIL and SMS notifications per event type |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| User data isolation | `GET /api/v1/notifications/{userId}` returns only the requesting user's own notifications; `ADMIN` can access any |
| Message content | Notification messages must not contain sensitive financial data (amounts, full account details) |
| Audit completeness | 100% of notification dispatches (success and failure) logged in `reporting-service` |
| FCM token security | Firebase device tokens stored encrypted; rotated on user logout |

---

## Acceptance Criteria

- [ ] GIVEN an LC status change, WHEN the event fires, THEN notification is dispatched to all configured recipients within 30 seconds.
- [ ] GIVEN an EMAIL delivery failure, WHEN 3 retries are exhausted, THEN IN_APP fallback is dispatched and failure is logged.
- [ ] GIVEN `GET /api/v1/notifications/{userId}`, WHEN called, THEN complete, chronologically ordered notification history is returned.
- [ ] GIVEN a user who is not `ADMIN`, WHEN they request another user's notification history, THEN `403 Forbidden` is returned.
- [ ] GIVEN notification dispatch, WHEN measured, THEN delivery rate ≥ 99% across all channels.
- [ ] GIVEN any notification event, WHEN it occurs, THEN an audit record is written to `reporting-service`.
- [ ] GIVEN `notification-service` is unavailable, WHEN a business event triggers a notification, THEN the notification is queued and dispatched on service recovery.

---

## Definition of Done

- [ ] `POST /api/v1/notifications/send` implemented with EMAIL, SMS, IN_APP channel routing.
- [ ] Firebase FCM integration implemented for IN_APP channel.
- [ ] 3-retry exponential backoff (1s, 2s, 4s) implemented for EMAIL/SMS.
- [ ] IN_APP fallback implemented after EMAIL/SMS exhaustion.
- [ ] `GET /api/v1/notifications/{userId}` implemented with pagination.
- [ ] Notification event triggers integrated into F-04, F-05, F-06, F-07 flows.
- [ ] All notification dispatch events (success/failure/fallback) written to `reporting-service`.
- [ ] Delivery rate ≥ 99% validated under test conditions.
- [ ] All acceptance criteria pass in QA environment.
