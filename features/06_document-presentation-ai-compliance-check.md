# Feature: Document Presentation & AI Compliance Check

## Feature ID
`F-06`

## Purpose
Allow back-office officers to upload trade documents (Bills of Lading, Invoices, Certificates of Origin, etc.) against an active LC. The `ai-service`, powered by OpenAI and MongoDB Atlas Vector Search, performs an automated compliance check of the uploaded documents against the LC terms. Discrepancies and a risk score are returned. Officers review AI findings and raise or waive discrepancies. All document events are audit-logged.

---

## User Stories

| ID | As a… | I want to… | So that… |
| --- | --- | --- | --- |
| US-06-1 | Back-Office Officer | Upload trade documents against an active LC | The documents enter the compliance review workflow |
| US-06-2 | Back-Office Officer | Receive an AI compliance check result within 10 seconds | I can immediately see discrepancies without waiting for manual review |
| US-06-3 | Compliance Analyst | Review AI-flagged discrepancies and decide to raise or waive them | I have AI-assisted efficiency while retaining final decision authority |
| US-06-4 | Beneficiary (notified) | Be notified when my documents are accepted or rejected | I know the outcome and can take corrective action if needed |
| US-06-5 | Audit Officer | Have every document upload and compliance decision logged | Full traceability of the document presentation process is maintained |

---

## Functional Requirements

| Ref | Requirement |
| --- | --- |
| FR-06-1 | `POST /api/v1/lc/{lcId}/documents` must accept `documentType`, `fileUrl`, and `submittedBy` and associate the document with the specified LC. |
| FR-06-2 | On document upload, system must invoke `POST /api/v1/ai/analyze-document` synchronously and return `complianceStatus` and `discrepancies` to the officer within 10 seconds (P95). |
| FR-06-3 | If `ai-service` is unavailable, the system must queue the document for retry (3 attempts, exponential backoff) and flag the LC for manual compliance review. Officer must be notified. |
| FR-06-4 | System must set the parent LC's `documentsUnderReview` flag to `true` when documents are under active compliance review (blocking amendments, per F-05). |
| FR-06-5 | Officers must be able to raise or waive individual discrepancies returned by the AI. Each decision must be recorded with the officer's userId and a comment. |
| FR-06-6 | Document upload must accept only PDF, TIFF, and PNG file types. Other types must be rejected with `400 Bad Request`. |
| FR-06-7 | If a document is of low quality (low resolution or poor scan), the AI service must surface a quality warning rather than producing a silent incorrect result. |
| FR-06-8 | System must notify the beneficiary when documents are accepted or rejected via `notification-service`. |
| FR-06-9 | Every document upload, AI result, and discrepancy decision must be written to the audit log in `reporting-service`. |

---

## Validation Rules

| Field | Rule |
| --- | --- |
| `lcId` | Must reference an existing LC with `lcStatus: ACTIVE`. |
| `documentType` | Required. Must be a valid enum: `BILL_OF_LADING`, `COMMERCIAL_INVOICE`, `CERTIFICATE_OF_ORIGIN`, `PACKING_LIST`, `INSURANCE_CERTIFICATE`, `DRAFT`. |
| `fileUrl` | Required. Must be a valid HTTPS URL pointing to the uploaded document. |
| File format | Only PDF, TIFF, PNG accepted. Validated by MIME type and file extension. |
| `submittedBy` | Required. Must be a valid `userId` with `TRADE_OFFICER` or `ADMIN` role. |
| Discrepancy decision | `RAISE` or `WAIVE`. Comment required when `RAISE` is selected. |

---

## Edge Cases

| Case | System Behavior |
| --- | --- |
| Unsupported file format uploaded | `400 Bad Request`: `"Unsupported document format. Accepted: PDF, TIFF, PNG."` |
| LC does not exist | `404 Not Found`. |
| LC status is not `ACTIVE` | `422 Unprocessable Entity`: `"Documents can only be submitted against an ACTIVE LC."` |
| `ai-service` unavailable | Queue document for retry (3 attempts, exponential backoff). Flag LC for manual review. Notify officer. |
| Low-quality document uploaded | AI surfaces quality warning in response. Officer can override and proceed or re-upload. |
| All discrepancies waived | LC moves to fully compliant state. `documentsUnderReview` flag cleared. Settlement can proceed. |
| At least one discrepancy raised | LC remains in review. Beneficiary notified of discrepancies. |
| Duplicate document uploaded (same type, same LC) | Warning returned; officer prompted to confirm replacement or cancel. |

---

## Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| `core-business-service` | Internal Service | Manages LC document records and `documentsUnderReview` flag |
| `ai-service` | Internal Service | Performs compliance analysis via OpenAI + MongoDB Atlas Vector Search |
| `notification-service` | Internal Service | Dispatches document acceptance/rejection notifications |
| `reporting-service` | Internal Service | Receives document and compliance decision audit events |
| MongoDB | Database | Stores document records and discrepancy decisions |
| MongoDB Atlas Vector Search | AI Infrastructure | Powers semantic document-vs-LC-terms matching |
| Redis | Cache | Stores AI retry queue for failed analysis requests |
| F-04 (LC Issuance) | Feature | LC must exist and be `ACTIVE` |
| F-05 (LC Status Management) | Feature | `documentsUnderReview` flag feeds into amendment blocking logic |

---

## API Requirements

### `POST /api/v1/lc/{lcId}/documents`
- **Auth:** `TRADE_OFFICER`, `ADMIN`
- **Payload:**
```json
{
  "documentType": "string",
  "fileUrl": "string",
  "submittedBy": "uuid"
}
```
- **Response 200:**
```json
{
  "status": "success",
  "data": {
    "documentId": "uuid",
    "complianceStatus": "PASS | FAIL | MANUAL_REVIEW",
    "discrepancies": ["string"],
    "qualityWarning": "string | null",
    "riskScore": "float"
  }
}
```
- **Response 400:** `{ "status": "error", "message": "Unsupported document format. Accepted: PDF, TIFF, PNG." }`
- **Response 404:** `{ "status": "error", "message": "LC not found." }`
- **Response 422:** `{ "status": "error", "message": "Documents can only be submitted against an ACTIVE LC." }`

### `POST /api/v1/ai/analyze-document` *(called internally by core-business-service)*
- **Payload:** `{ "lcId": "uuid", "documentUrl": "string", "documentType": "string" }`
- **Response 200:** `{ "status": "success", "data": { "complianceStatus": "PASS|FAIL", "discrepancies": ["string"], "riskScore": "float" } }`

---

## Database Impact

### Collection: `lc_documents`
| Field | Type | Notes |
| --- | --- | --- |
| `_id` | UUID | `documentId` |
| `lcId` | UUID | FK to `letters_of_credit` |
| `documentType` | String | Enum |
| `fileUrl` | String | HTTPS URL |
| `submittedBy` | UUID | — |
| `complianceStatus` | String | `PASS`, `FAIL`, `MANUAL_REVIEW` |
| `discrepancies` | Array\<Object\> | `{ description, status: RAISED|WAIVED, decidedBy, comment }` |
| `riskScore` | Number | 0.0 – 1.0 |
| `qualityWarning` | String | Null if document quality acceptable |
| `createdAt` | Date | — |

### Collection: `letters_of_credit` *(field updated)*
| Field | Type | Notes |
| --- | --- | --- |
| `documentsUnderReview` | Boolean | Set to `true` on upload; cleared when all discrepancies resolved |

### Collection: `audit_logs` *(via `reporting-service`)*
| Field | Type | Notes |
| --- | --- | --- |
| `eventType` | String | `DOCUMENT_UPLOADED`, `DISCREPANCY_RAISED`, `DISCREPANCY_WAIVED` |
| `lcId` | UUID | — |
| `documentId` | UUID | — |
| `performedBy` | UUID | — |
| `aiResult` | Object | Full AI response snapshot |
| `timestamp` | Date | — |

---

## UI Components

| Component | Description |
| --- | --- |
| `DocumentUploadZone` | Drag-and-drop upload area accepting PDF/TIFF/PNG with file type validation |
| `DocumentTypeSelector` | Dropdown for selecting document type enum |
| `AIComplianceResultCard` | Displays `complianceStatus`, `riskScore`, and list of discrepancies after upload |
| `DiscrepancyReviewList` | Per-discrepancy raise/waive decision with comment input |
| `QualityWarningBanner` | Displayed when AI returns a quality warning for the uploaded document |
| `ManualReviewFlagBanner` | Displayed when AI service is unavailable and LC is flagged for manual review |
| `DocumentHistoryTable` | List of all documents uploaded against the LC with compliance status and decisions |

---

## Security Requirements

| Requirement | Detail |
| --- | --- |
| Role enforcement | Only `TRADE_OFFICER` and `ADMIN` may upload documents; enforced at `api-gateway` |
| File validation | MIME type and extension validated server-side; client-side validation is UI only |
| File storage | Documents stored in secure, access-controlled object storage; `fileUrl` must use pre-signed HTTPS URLs |
| AI audit trail | 100% of `ai-service` calls logged with full input/output in `reporting-service` |
| Discrepancy immutability | Once a discrepancy decision is recorded, it cannot be modified; new decision creates a new record |

---

## Acceptance Criteria

- [ ] GIVEN a valid PDF document, WHEN `POST /api/v1/lc/{lcId}/documents` is called, THEN `documentId` and `complianceStatus` are returned within 10 seconds (P95).
- [ ] GIVEN an unsupported file type (e.g., `.docx`), WHEN document is uploaded, THEN `400 Bad Request` is returned.
- [ ] GIVEN `ai-service` is unavailable, WHEN document is uploaded, THEN LC is flagged `MANUAL_REVIEW` and officer is notified; LC is still created successfully.
- [ ] GIVEN a low-quality document, WHEN AI analyzes it, THEN a quality warning is returned in the response.
- [ ] GIVEN a document under active review, WHEN an LC amendment is attempted (F-05), THEN `409 Conflict` blocks the amendment.
- [ ] GIVEN all discrepancies are waived, WHEN the last discrepancy is resolved, THEN `documentsUnderReview` flag is cleared on the LC.
- [ ] GIVEN document acceptance/rejection, WHEN the decision is made, THEN beneficiary is notified via `notification-service`.
- [ ] GIVEN any document event, WHEN it occurs, THEN an audit record is written to `reporting-service`.

---

## Definition of Done

- [ ] `POST /api/v1/lc/{lcId}/documents` implemented with file type validation and AI invocation.
- [ ] AI compliance check integrated synchronously; P95 < 10 seconds validated.
- [ ] `ai-service` unavailability retry queue (3 attempts, exponential backoff) implemented.
- [ ] `documentsUnderReview` flag lifecycle implemented (set on upload, cleared on resolution).
- [ ] Discrepancy raise/waive flow implemented with comment requirement on `RAISE`.
- [ ] Document quality warning surfaced from AI response.
- [ ] Notification dispatch on acceptance/rejection integrated.
- [ ] All document and compliance events written to `reporting-service` audit log.
- [ ] All acceptance criteria pass in QA environment.
