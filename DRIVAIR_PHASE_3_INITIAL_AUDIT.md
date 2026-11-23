# DRIVAIR — PHASE 3 INITIAL BUSINESS WORKFLOW AUDIT REPORT

**Date:** November 23, 2026  
**Auditor:** Principal Backend Architect, Database Engineer & QA Automation Lead  
**Audit Scope:** Core Business Logic, Tender Lifecycle, Bidding Lifecycle, Canonical Contract Generation, Direct Hiring, Trip Lifecycle & GPS Integrity, Frontend/Backend Workflow Consistency, Notifications, and Database Concurrency.

---

## 1. Executive Summary & Carried-Forward Issue Status

This audit reviews DRIVAIR's end-to-end transport contracting workflow, database concurrency, and full-stack integration across the backend and frontend client portals.

### Carried-Forward Issue Tracker (from Phase 1 & 2)

| Issue | Status | Phase 3 Verification Assessment |
|---|---|---|
| **MongoDB transaction fallback detection** | **UNRESOLVED** | In Mongoose 8.x, `session.startTransaction()` does not perform network I/O. In standalone MongoDB or when Atlas DNS SRV times out (`querySrv ETIMEOUT`), synchronous detection fails to catch lack of replica sets until writes. Furthermore, fallback paths must guarantee safe single-document atomic operations without claiming multi-document ACID atomicity. |
| **Contract source-reference unique indexes** | **UNRESOLVED** | `Contract` model lacks unique compound partial indexes on `sourceBidId` and `sourceRequestId`. This allows potential duplicate canonical contract creation under concurrent acceptance requests. |
| **Frontend notification integration** | **UNRESOLVED** | Backend notification endpoints exist and are covered by tests, but frontend `PortalLayout` and features have no notification bell, badge counter, or dropdown integration. |
| **Marketplace service integration** | **UNRESOLVED** | `marketplace.service.js` has extracted helpers (`getOrCreateCompanyForUser`, `publishContractPost`, `closeContractPost`), but `marketplace.controller.js` continues to use inline queries without delegating to service logic. |
| **Live MongoDB replica-set integration tests** | **UNRESOLVED** | Local testing environment executes in an isolated environment without active replica set / Atlas SRV egress (`querySrv ETIMEOUT`). Atomic multi-document transactions cannot run live in local test harness without replica sets; verified using in-memory schema invariants and robust single-document atomic update fallbacks. |
| **Phase 2 Socket.IO integration verification** | **PARTIALLY_VERIFIED** | Socket room authorization verified for assigned driver, contract owner, and admin. However, frontend GPS heartbeat and reconnect lifecycle requires formal handling of stale/duplicate coordinate events. |
| **Phase 2 HTTP document authorization tests** | **PARTIALLY_VERIFIED** | Unit tests cover document access rules; integration tests must verify cross-tenant rejection across all endpoints. |
| **Phase 2 HTTP rate-limit enforcement tests** | **PARTIALLY_VERIFIED** | Middleware verified mounted on routes; live HTTP burst tests to be added in test suites. |

---

## 2. Comprehensive Findings by Severity

### P0 — Critical (Data Integrity & Concurrency Race Conditions)

#### P0-1: Race Condition in Bid Acceptance & Duplicate Contract Creation
- **Module:** `server/src/modules/bids/bids.service.js` (`acceptBidAndCreateContractService`)
- **Vulnerability:**
  Under concurrent acceptance requests (e.g. two company admins or double-click from UI accepting bids simultaneously on a single-position post), the check `post.awardedBidIds.length >= maxPositions` is performed before updating `post`. In non-replica-set deployments or when isolation is read-committed, two concurrent requests can both read `awardedBidIds.length === 0`, pass the check, set `bid.status = 'accepted'`, and create two `Contract` documents.
- **Root Cause:**
  Lack of conditional atomic find-and-modify (`findOneAndUpdate` with filter `{ _id: postId, 'awardedBidIds.<maxPositions - 1>': { $exists: false } }`) or unique partial index on `Contract.sourceBidId`.
- **Impact:**
  Multiple contractors awarded for single-driver tender; duplicate binding contracts created; inconsistent post state.
- **Remediation:**
  1. Add unique sparse/partial index on `Contract.sourceBidId` (`{ sourceBidId: 1 }, { unique: true, sparse: true }`).
  2. Implement atomic conditional update on `ContractPost` using `$push: { awardedBidIds: bid._id }` conditional on `awardedBidIds` size and post status `open`. If the conditional update fails, abort and return `409 Conflict`.
  3. Ensure losing concurrent bid acceptance receives HTTP 409 and rolls back cleanly.

#### P0-2: Race Condition in Direct Hiring Offer Acceptance
- **Module:** `server/src/modules/directHiring/directHiring.controller.js` (`acceptDirectOffer`)
- **Vulnerability:**
  `offer.status` is checked in JavaScript memory (`if (offer.status === 'accepted')`). If two concurrent requests arrive for the same offer, both can pass the check, execute `Contract.create()`, and generate duplicate contracts (`CNT-DIR-...`).
- **Root Cause:**
  Non-atomic status transition from `pending`/`negotiating` to `accepted`.
- **Impact:**
  Duplicate canonical contracts generated from a single direct hire offer.
- **Remediation:**
  1. Add unique sparse/partial index on `Contract.sourceRequestId` (`{ sourceRequestId: 1 }, { unique: true, sparse: true }`).
  2. Perform atomic `findOneAndUpdate` on `ContractRequest`:
     `ContractRequest.findOneAndUpdate({ _id: offerId, providerId: userId, status: { $in: ['pending', 'negotiating'] } }, { $set: { status: 'accepted', respondedAt: new Date() } }, { new: true })`.
     If result is `null`, return `409 Conflict` (offer already accepted, cancelled, or withdrawn).
  3. If contract creation fails subsequently, revert status back to previous state or ensure atomic commit.

#### P0-3: Concurrent Trip Start Allowing Multiple Active Trips per Contract
- **Module:** `server/src/modules/trips/trips.controller.js` (`startTrip`), `server/src/sockets/chat.socket.js` (`start_trip`)
- **Vulnerability:**
  In `startTrip`, the query `Trip.findOne({ contractId, status: 'active' })` is followed by `Trip.create()`. Under concurrent requests, two active trips can be created for the same contract.
- **Root Cause:**
  Check-then-act without database unique constraint on `{ contractId: 1, status: 1 }` or atomic upsert.
- **Impact:**
  Orphaned trip records, split GPS telemetry breadcrumbs between multiple active trip IDs.
- **Remediation:**
  1. Add partial unique compound index on `Trip` where `status: 'active'`: `{ contractId: 1 }` with partial filter expression `{ status: 'active' }`.
  2. Handle E11000 duplicate key error in controller and return the existing active trip smoothly.

---

### P1 — High (Lifecycle Invariants & Authorization Boundaries)

#### P1-1: Incomplete Tender Validation & Lifecycle State Enforcement
- **Module:** `server/src/modules/marketplace/marketplace.validation.js`, `marketplace.controller.js`
- **Vulnerability:**
  `createContractPostSchema` permits `applicationDeadline` in the past. It also does not validate that `startDate` is before `endDate`.
  Furthermore, `publishPost` and `closePost` do not enforce a strict finite state machine (e.g. `closed` tenders can currently be re-published if `/publish` is called).
- **Root Cause:**
  Zod schema lacks custom refine checks for future dates and date ranges; controller transitions do not check allowable `from` states.
- **Impact:**
  Companies can publish already-expired tenders or reverse terminal statuses (`closed`, `cancelled`).
- **Remediation:**
  1. Add date validation in Zod schema: `applicationDeadline` >= now, `startDate` < `endDate`.
  2. Enforce valid state machine:
     - `draft` -> `open`
     - `open` -> `closed` | `cancelled`
     - `partiallyAwarded` -> `awarded` | `closed` | `cancelled`
     - Reject transitions from `closed` or `cancelled`.

#### P1-2: Bidding on Own Company Tenders & Inactive Provider Accounts
- **Module:** `server/src/modules/bids/bids.controller.js` (`submitBid`)
- **Vulnerability:**
  1. A user who is both a company owner and has access to a driver profile could bid on their own company's tender.
  2. The bid submission does not verify if the provider's account status is `active`.
  3. Tenders with status `closed`, `cancelled`, or `draft` must reject bids (currently checks `post.status !== 'open'`, which is good, but expired deadline check needs timezone-safe boundary).
- **Root Cause:**
  Missing check `if (post.companyId.toString() === req.user.companyId || post.createdBy.toString() === req.user._id.toString())`.
- **Impact:**
  Self-bidding, price manipulation, and bidding by suspended/blocked provider accounts.
- **Remediation:**
  Prevent bidding if `post.createdBy.toString() === req.user._id.toString()`. Reject bids if `req.user.accountStatus !== 'active'`.

#### P1-3: Provider Bid Modification and Withdrawal Not Implemented
- **Module:** `server/src/modules/bids/bids.routes.js`, `bids.controller.js`
- **Vulnerability:**
  Providers cannot withdraw a pending bid. If their availability changes, their bid remains eligible for company acceptance.
- **Root Cause:**
  Endpoints `PATCH /bids/:id/withdraw` and `PATCH /bids/:id` are missing from `bids.routes.js` and `bids.controller.js`.
- **Impact:**
  Providers are locked into bids even if rates or circumstances change.
- **Remediation:**
  Add `withdrawBid` controller method allowing bidders to transition `pending` -> `withdrawn`. Reject withdrawal if already `accepted`.

#### P1-4: Contract Status Updates Lack Role-Specific Invariant Checks
- **Module:** `server/src/modules/contracts/contracts.controller.js` (`updateContractStatus`)
- **Vulnerability:**
  `updateContractStatus` allows any party (company or provider) to set status to any value in `['active', 'completed', 'cancelled', 'terminated']`.
  A driver should not unilaterally terminate or cancel a contract without proper mutual completion rules or company consent.
- **Root Cause:**
  Missing transition matrix mapping roles to permitted target statuses.
- **Impact:**
  Unauthorized contract state manipulation by counterparty.
- **Remediation:**
  Enforce transition permissions:
  - Driver can only mark `completed` (if trip completed).
  - Company can mark `cancelled` or `terminated`.
  - Admin can update to any valid state.

---

### P2 — Medium (Workflow Consistency & Frontend/Backend Synchronization)

#### P2-1: Marketplace Service Detached from Controller
- **Module:** `server/src/modules/marketplace/marketplace.controller.js`, `marketplace.service.js`
- **Finding:**
  `marketplace.service.js` contains `publishContractPost` and `closeContractPost`, but `marketplace.controller.js` bypasses the service with duplicate inline queries.
- **Remediation:**
  Integrate `marketplace.service.js` into `marketplace.controller.js` with full state validation.

#### P2-2: Missing Idempotency & Concurrency Guards on Frontend Action Handlers
- **Module:** `client/src/features/marketplace/CompanyPostManager.jsx`, `BrowsePosts.jsx`, `direct-hiring/ReceivedOffers.jsx`
- **Finding:**
  Buttons like "Accept & Form Contract" (`handleAcceptBid`) in `CompanyPostManager.jsx` do not track a `loadingBidId` state, allowing users to rapidly click twice before the first network response returns.
- **Remediation:**
  Add `processingBidId` disabled state and visual spinner to prevent duplicate frontend dispatch.

#### P2-3: GPS Reconnect & Out-of-Order Handling
- **Module:** `server/src/sockets/chat.socket.js`, `client/src/features/tracking/CompanyLiveMap.jsx`
- **Finding:**
  While `tracking.controller.js` checks `recordedAt` against `lastKnownLocation.recordedAt`, `chat.socket.js` `update_location` does not verify if an incoming socket packet has an older timestamp than `trip.lastKnownLocation.recordedAt`.
- **Remediation:**
  Add stale coordinate protection to `chat.socket.js` `update_location` handler.

---

### P3 — Low (Code Cleanliness & Documentation)

#### P3-1: Empty or Incomplete Service Files
- `server/src/modules/contracts/contracts.service.js` is 0 bytes.
- `server/src/modules/contracts/contracts.validation.js` is 0 bytes.
- Standardize service exports and add Zod validation schemas for contract updates.

---

## 3. Workflow State Transition Tables

### 3.1 Tender (ContractPost) State Transitions
| Current State | Next State | Permitted Role | Conditions / Invariants |
|---|---|---|---|
| `draft` | `open` | Company Owner | Required fields valid; deadline > now |
| `draft` | `cancelled` | Company Owner | Owner decides not to publish |
| `open` | `partiallyAwarded` | System / Company | 1st bid accepted; `awardedBidIds.length < requiredPositions` |
| `open` | `awarded` | System / Company | All positions awarded (`awardedBidIds.length >= requiredPositions`) |
| `open` | `closed` | Company Owner / Admin | Manually closed by company; bids no longer accepted |
| `open` | `cancelled` | Company Owner / Admin | Cancelled; all pending bids become rejected/withdrawn |
| `partiallyAwarded`| `awarded` | System / Company | Final remaining position awarded |
| `partiallyAwarded`| `closed` | Company Owner | No further bids accepted |
| `closed` / `cancelled` / `awarded` | *None* | - | Terminal states. No transitions allowed. |

### 3.2 Bid State Transitions
| Current State | Next State | Permitted Role | Conditions / Invariants |
|---|---|---|---|
| *None* | `pending` | Driver / Vehicle Owner | Tender is `open`; provider is active; deadline not passed; no prior bid |
| `pending` | `shortlisted` | Company Owner | Tender is `open` or `partiallyAwarded` |
| `pending` | `withdrawn` | Bid Owner | Bidder retracts before acceptance |
| `shortlisted` | `withdrawn` | Bid Owner | Bidder retracts before acceptance |
| `pending` / `shortlisted` | `accepted` | Company Owner | Tender has open position; atomic conditional transition |
| `pending` / `shortlisted` | `rejected` | Company Owner | Company rejects bid |
| `accepted` | *None* | - | Terminal state; creates canonical `Contract`. |
| `rejected` / `withdrawn` | *None* | - | Terminal state; cannot be accepted or modified. |

### 3.3 Direct Hiring (ContractRequest) State Transitions
| Current State | Next State | Permitted Role | Conditions / Invariants |
|---|---|---|---|
| *None* | `pending` | Company Owner | Provider is active; required fields valid |
| `pending` | `negotiating` | Provider / Company | Counter-offer submitted with new amount |
| `negotiating` | `negotiating` | Provider / Company | Subsequent counter-offer |
| `pending` / `negotiating` | `accepted` | Provider | Atomic conditional transition; creates canonical `Contract` |
| `pending` / `negotiating` | `rejected` | Provider | Provider declines offer |
| `pending` / `negotiating` | `withdrawn` | Company Owner | Company revokes offer prior to acceptance |
| `accepted` / `rejected` / `withdrawn` | *None* | - | Terminal states. |

### 3.4 Trip State Transitions
| Current State | Next State | Permitted Role | Conditions / Invariants |
|---|---|---|---|
| *None* | `active` | Assigned Driver | Contract is `active`; no other active trip on contract |
| `active` | `completed` | Assigned Driver / Admin| Trip completed; records final location & timestamp |
| `active` | `cancelled` | Company / Admin | Trip cancelled due to emergency or incident |
| `completed` / `cancelled` | *None* | - | Terminal states. Rejects subsequent GPS updates. |

---

## 4. Prioritized Action Plan for Phase 3 Implementation

1. **Phase 3B — Tender Lifecycle & Validation:**
   - Integrate `marketplace.service.js` with `marketplace.controller.js`.
   - Update `createContractPostSchema` with date/budget validation.
   - Enforce tender state transitions in service/controller.

2. **Phase 3C & 3D — Concurrency & Canonical Contracts:**
   - Add database unique partial compound indexes on `Contract.sourceBidId` and `Contract.sourceRequestId`.
   - Implement conditional atomic updates on `ContractPost` and `ContractRequest` to prevent race conditions during concurrent bid/offer acceptance.
   - Provide atomic fallback handling on non-replica set connections with full rollback recovery.
   - Implement bid withdrawal endpoint (`PATCH /bids/:id/withdraw`).
   - Fill `contracts.service.js` and `contracts.validation.js`.

3. **Phase 3E & 3F — Direct Hiring, Trip & GPS Integrity:**
   - Atomic conditional update on direct offer acceptance.
   - Partial unique index on active trips (`{ contractId: 1 }` with `{ status: 'active' }`).
   - Stale coordinate timestamp guard in `chat.socket.js`.

4. **Phase 3G & 3H — Frontend Consistency & Notifications:**
   - Add loading/disabled states for buttons in `CompanyPostManager.jsx` and `ReceivedOffers.jsx`.
   - Keep carried-forward trackers updated.

5. **Phase 3I — Automated Test Verification:**
   - Build comprehensive `test/workflowBusinessTest.js` and `test/concurrencyTest.js`.
   - Run full regression suites (`npm run test:all`).

---
*End of DRIVAIR Phase 3 Initial Business Workflow Audit.*
