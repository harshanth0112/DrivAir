# DRIVAIR — Phase 2 Initial Security & Authentication Findings

**Date:** November 23, 2026  
**Auditor:** Principal Software Architect & Lead Security Engineer  
**Status:** Initial Findings (Pre-Remediation Inspection)

---

## Executive Summary

Following the completion of Phase 1 verification (`PHASE_1_VERIFIED_WITH_LIMITATIONS`), a comprehensive security and authentication audit of all backend modules, middlewares, socket handlers, and data access layers was conducted.

The 6 unresolved items from Phase 1 are carried forward explicitly:
1. **MongoDB transaction fallback detection is unreliable** (in `bids.service.js` and `directHiring.controller.js`).
2. **Contract source references lack verified uniqueness protection** (`sourceBidId` and `sourceRequestId` on `Contract`).
3. **Frontend notification integration is pending** (`client/src/features/notifications` empty).
4. **Marketplace service is not integrated** (`marketplace.service.js` unused).
5. **Live MongoDB replica-set integration tests are unavailable**.
6. **Role escalation implementation history reconciled** (originally unprotected client parameter; fixed via whitelist in `auth.service.js`).

---

## Critical & High Security Vulnerabilities Identified in Phase 2

### Finding SEC-01 (Severity: HIGH) — Unauthenticated Socket Room Typing & Location Broadcast Checks
- **Location:** `server/src/sockets/chat.socket.js`
- **Issue:** 
  1. `socket.on('typing')` accepts arbitrary conversation IDs and broadcasts blindly without checking whether the socket user is actually a participant of that conversation.
  2. In `socket.on('join_trip_room')`, any client can join a room if they emit an event, potentially listening in on private driver telemetry if authorization is not checked at room entry.

### Finding SEC-02 (Severity: HIGH) — Arbitrary File Upload via Multer Without MIME Type & Extension Whitelist
- **Location:** `server/src/modules/documents/documents.controller.js` (`uploadMiddleware`)
- **Issue:**
  - `uploadMiddleware` specifies only `{ limits: { fileSize: 10 * 1024 * 1024 } }` with memory storage.
  - It does **not** validate `fileFilter` (MIME type or file extension). Any executable or script file (`.html`, `.svg` with XSS payloads, `.exe`, `.sh`) can be uploaded.
  - When Cloudinary is not configured or fails, the file buffer is converted to a `data:${req.file.mimetype};base64,...` URL and stored directly in MongoDB, which can be rendered in the browser, enabling Stored XSS if `req.file.mimetype` is attacker-controlled.

### Finding SEC-03 (Severity: MEDIUM) — Missing Validation on Direct File Upload Metadata
- **Location:** `server/src/modules/documents/documents.routes.js` (`/upload-file`)
- **Issue:**
  - `router.post('/upload-file', documentsController.uploadMiddleware, documentsController.uploadDirectFile)` does **not** pass through the `validate(...)` Zod middleware.
  - `ownerType` and `documentType` are checked with basic falsy checks (`if (!ownerType || !documentType)`), allowing arbitrary strings like `ownerType: "hacker"` or non-enum values to be stored in MongoDB.

### Finding SEC-04 (Severity: MEDIUM) — Mass Assignment Vulnerability in Profile Updates
- **Location:** 
  - `server/src/modules/companies/companies.controller.js` (`updateMyCompany`)
  - `server/src/modules/drivers/drivers.controller.js` (`updateMyDriverProfile`)
  - `server/src/modules/vehicleOwners/vehicleOwners.controller.js` (`updateMyVehicleOwnerProfile`)
- **Issue:**
  - In `updateMyCompany`: `Object.assign(company, req.body)` is used directly on the Mongoose document.
  - In `updateMyDriverProfile`: `Object.assign(driver, req.body)`.
  - While routes have Zod schemas, using `Object.assign` instead of explicitly picking sanitized fields leaves models open to prototype pollution or overwriting internal properties (e.g., `verificationStatus`, `verifiedAt`, `userId`).

### Finding SEC-05 (Severity: MEDIUM) — Rate Limiter Stub & Sensitive Endpoint Protection
- **Location:** `server/src/middleware/rateLimiter.js`
- **Issue:**
  - `server/src/middleware/rateLimiter.js` is a 0-byte file.
  - Sensitive endpoints such as `/api/v1/auth/sync`, `/api/v1/documents/upload-file`, and bidding/negotiation endpoints lack dedicated, restrictive rate limiting.

### Finding SEC-06 (Severity: LOW / INFORMATIONAL) — Missing Explicit Error Sanitization in Sockets
- **Location:** `server/src/sockets/chat.socket.js`
- **Issue:**
  - Sockets emit `err.message` directly back to the client on uncaught errors, potentially leaking internal database error messages or stack details.
