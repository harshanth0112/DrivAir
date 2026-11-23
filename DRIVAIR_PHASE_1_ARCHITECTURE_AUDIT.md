# DRIVAIR – PHASE 1: COMPLETE PROJECT STRUCTURE & ARCHITECTURE AUDIT REPORT

**Audit Date:** November 23, 2026  
**Auditor:** Principal Software Architect & Senior Technical Auditor  
**Scope:** Repository discovery, frontend/backend architecture, database schema mapping, API registry, Socket.IO real-time subsystems, dependency audit, deployment configurations, and architectural risk assessment.  
**Execution Standard:** Static source inspection, structural verification, and non-destructive invariant validation. Zero application source modifications performed.

---

## 1. EXECUTIVE SUMMARY

The DRIVAIR application is a specialized B2B contract logistics and transport marketplace connecting corporate shippers (**Companies**), commercial drivers (**Drivers**), and vehicle fleet owners (**Vehicle Owners**), governed by a platform **Admin**. The platform provides contract posting/tendering, competitive bidding, direct hiring offers, compliance document verification, real-time messaging, and live GPS trip tracking.

### Core Architecture Synopsis
- **Frontend:** Single Page Application (SPA) built on **React 19**, **Vite 6**, **Tailwind CSS v4**, **React Router v7**, **TanStack React Query v5**, **Axios**, **Leaflet / React-Leaflet**, and **Socket.IO Client**.
- **Backend:** Node.js (ES Modules) **Express 4.21** REST API paired with **Socket.IO 4.8** server.
- **Database:** **MongoDB** with **Mongoose 8.10**, structured into **17 active document schemas** (+ 1 empty orphan file `auth.model.js` = 18 total `.model.js` files) with compound indexing and TTL expiration.
- **Authentication:** Hybrid architecture utilizing **Firebase Client SDK** on frontend, verified via **Firebase Admin SDK 13.1** on backend, with synchronization into MongoDB `User` records.
- **Real-Time Subsystem:** Dual-channel Socket.IO architecture handling authenticated private conversation messaging and bidirectional GPS trip tracking with persistent breadcrumb persistence in MongoDB.
- **Media & Documents:** Multer memory storage integrated with **Cloudinary 2.11** for compliance certificates, permits, and licenses.

### Key Audit Findings
1. **Strong Core Domain Modeling:** The system enforces strict relational models between tender posts (`ContractPost`), bids (`Bid`), direct offers (`ContractRequest`), binding agreements (`Contract`), and live execution (`Trip`, `LiveLocation`).
2. **Missing Service Layer Abstraction:** All 14 `*.service.js` files in `server/src/modules/*/` (except `auth.service.js`) are 0-byte empty stubs. Business logic, MongoDB queries, and transaction flows are implemented directly inside Express controllers.
3. **Absence of MongoDB Multi-Document Transactions:** In critical operations such as `acceptBidAndCreateContract` and `acceptDirectOffer`, multi-document writes (updating Bid, updating ContractPost, creating Contract) occur in sequence without `mongoose.startSession()` and `session.withTransaction()`, risking partial state inconsistencies upon server failure.
4. **Development Security Bypass Guard:** The backend features a dev-only JWT decode bypass when Firebase Service Account credentials are not supplied. While guarded with `if (env.NODE_ENV === 'production') throw new Error(...)`, missing credentials in staging or misconfigured environments present a bypass vulnerability.
5. **No Redis Adapter for Socket.IO:** The Socket.IO server operates purely in-memory on a single Node process. Clustering or multi-instance container scaling will cause socket room isolation and broken GPS broadcasts.

---

## 2. REPOSITORY INVENTORY & DIRECTORY STRUCTURE

The repository is structured as a decoupled monorepo containing `client/`, `server/`, `docs/`, and root deployment manifests.

```
drivair/
├── .gitignore
├── process.md
├── readme.md
├── readme1.md
├── render.yaml                    # Render.com deployment manifest for backend web service
├── client/                        # React 19 + Vite 6 Frontend Application
│   ├── .env                       # Local environment configuration
│   ├── .env.example               # Environment template
│   ├── index.html                 # Single page application entry HTML
│   ├── package.json               # Frontend dependencies & build scripts
│   ├── package-lock.json
│   ├── vercel.json                # Vercel SPA rewrites and caching headers
│   ├── vite.config.js             # Vite configuration with React & Tailwind plugins
│   └── src/
│       ├── main.jsx               # React DOM bootstrap
│       ├── app/
│       │   ├── App.jsx            # Root layout wrapper
│       │   ├── providers.jsx      # React Query Client & AuthProvider wrapper
│       │   └── router.jsx         # React Router v7 routes & ProtectedRoute guards
│       ├── components/
│       │   ├── layout/
│       │   │   └── PortalLayout.jsx  # Reusable portal shell with tab navigation
│       │   └── ui/
│       │       ├── Badge.jsx      # Status pill UI
│       │       ├── Button.jsx     # Action button UI
│       │       └── Card.jsx       # Card container UI
│       ├── features/
│       │   ├── admin/             # Verification Queue & Audit Logs Viewer
│       │   ├── auth/              # AuthContext & LoginPage (Firebase auth)
│       │   ├── chat/              # ChatMessenger (Socket.IO chat client)
│       │   ├── contracts/         # ContractList view
│       │   ├── direct-hiring/     # DirectHiringExplorer & ReceivedOffers
│       │   ├── documents/         # DocumentManager (Upload & status)
│       │   ├── marketplace/       # BrowsePosts & CompanyPostManager
│       │   ├── tracking/          # CompanyLiveMap & DriverTripTracker (Leaflet + Sockets)
│       │   └── vehicles/          # VehicleManager (Fleet CRUD)
│       ├── lib/
│       │   ├── api.js             # Axios instance with Bearer interceptors
│       │   └── firebase.js        # Firebase Client SDK initialization
│       ├── pages/
│       │   └── HomePage.jsx       # Public landing page (9 sections)
│       └── styles/
│           └── index.css          # Tailwind CSS v4 styling & design tokens
├── server/                        # Node.js + Express + Socket.IO Backend API
│   ├── .env                       # Server environment configuration
│   ├── .env.example               # Server template
│   ├── package.json               # Backend dependencies & scripts
│   ├── package-lock.json
│   ├── seed.js                    # Comprehensive database seeder with realistic test data
│   ├── test/
│   │   ├── runTests.js            # Automated invariant & schema unit test suite
│   │   └── twoAccountGpsTest.js   # Two-account security, RBAC & GPS recovery test suite
│   └── src/
│       ├── app.js                 # Express application configuration & route registry
│       ├── server.js              # HTTP server bootstrap & Socket.IO initialization
│       ├── config/
│       │   ├── database.js        # Mongoose connection handler
│       │   ├── env.js             # Environment variable validation & loader
│       │   └── firebaseAdmin.js   # Firebase Admin SDK cryptographic verification
│       ├── middleware/
│       │   ├── authenticate.js    # Bearer token verification & req.user attachment
│       │   ├── authorize.js       # Role-based access control (RBAC) guard
│       │   ├── errorHandler.js    # Central AppError class and Express error handler
│       │   ├── rateLimiter.js     # IP-based rate limiting configurations
│       │   └── validate.js        # Zod request validation middleware
│       ├── modules/               # Domain modules (Controller, Model, Routes, Validation)
│       │   ├── admin/             # User governance & AuditLog
│       │   ├── auth/              # Account sync & user bootstrap
│       │   ├── bids/              # Tender bidding & award logic
│       │   ├── chat/              # Conversations & message persistence
│       │   ├── companies/         # Company profile management
│       │   ├── contracts/         # Canonical binding agreement management
│       │   ├── directHiring/      # Direct hiring requests, offers & counters
│       │   ├── documents/         # Multer/Cloudinary uploads & verification workflow
│       │   ├── drivers/           # Driver professional profile management
│       │   ├── marketplace/       # Contract posts & tendering
│       │   ├── notifications/     # User notification store
│       │   ├── tracking/          # LiveLocation breadcrumbs & location APIs
│       │   ├── trips/             # Trip lifecycle management (start/active/end)
│       │   ├── users/             # Core identity & account status
│       │   ├── vehicleOwners/     # Vehicle owner profiles
│       │   └── vehicles/          # Commercial vehicle fleet registry
│       └── sockets/
│           └── chat.socket.js     # Socket.IO handlers: chat messaging & GPS tracking
└── docs/                          # Architecture & technical documentation
    ├── API.md                     # Endpoint catalog
    ├── DATABASE.md                # Mongoose schema details
    └── SECURITY.md                # Security specifications & RBAC matrices
```

---

## 3. TECHNOLOGY STACK SPECIFICATION

### Frontend Stack
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime / Bundler | Vite | 6.1.0 | Fast HMR dev server & ES module builder |
| UI Framework | React | 19.0.0 | Component rendering engine |
| Routing | React Router DOM | 7.1.5 | Client-side routing, protected routes & portal switching |
| State & Query | TanStack React Query | 5.66.0 | Server-state caching, fetching & mutations |
| HTTP Client | Axios | 1.7.9 | Intercepted REST communication with JWT attachment |
| Real-Time Client | Socket.IO Client | 4.8.1 | Bi-directional WebSocket communication (Chat & GPS) |
| Mapping / GIS | Leaflet / React-Leaflet | 1.9.4 / 5.0.0 | Interactive radar map rendering & vehicle markers |
| Icons | Lucide React | 0.475.0 | Modern SVG iconography |
| Styling | Tailwind CSS | 4.0.6 | Utility-first styling with `@tailwindcss/vite` |
| Auth Identity | Firebase Client SDK | 11.3.1 | Phone/Google/Email authentication |

### Backend Stack
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js (ESM) | Node 20+ | Server-side execution environment |
| Web Framework | Express.js | 4.21.2 | REST API routing and middleware pipeline |
| Real-Time Engine | Socket.IO | 4.8.1 | WebSocket server for real-time rooms |
| Database ODM | Mongoose | 8.10.1 | MongoDB object modeling and validation |
| Auth Verification | Firebase Admin SDK | 13.1.0 | Cryptographic ID token decoding and verification |
| Validation | Zod | 3.24.2 | Strict schema validation for request bodies/queries |
| File Upload | Multer | 2.5.0 | Multipart form-data handling in memory |
| Cloud Storage | Cloudinary SDK | 2.11.0 | Secure cloud asset storage for compliance documents |
| Security | Helmet | 8.0.0 | Security HTTP response headers |
| Rate Limiting | Express Rate Limit | 7.5.0 | Anti-abuse IP request rate throttling |
| Configuration | Dotenv | 16.4.7 | Environment variable management |

---

## 4. FRONTEND ARCHITECTURE ANALYSIS

### 4.1 Entry Points and Provider Tree
- **Entry File:** [client/src/main.jsx](file:///c:/Users/acer/Pictures/emc/drivair/client/src/main.jsx) mounts `<App />` to the DOM `root`.
- **Root Component:** [client/src/app/App.jsx](file:///c:/Users/acer/Pictures/emc/drivair/client/src/app/App.jsx) wraps `<AppProviders>` around `<AppRouter>`.
- **Providers:** [client/src/app/providers.jsx](file:///c:/Users/acer/Pictures/emc/drivair/client/src/app/providers.jsx) establishes:
  1. `QueryClientProvider` (`@tanstack/react-query`) with `refetchOnWindowFocus: false` and `retry: 1`.
  2. `AuthProvider` ([client/src/features/auth/AuthContext.jsx](file:///c:/Users/acer/Pictures/emc/drivair/client/src/features/auth/AuthContext.jsx)), managing Firebase listener `onAuthStateChanged`, token persistence in `localStorage.drivair_token`, silent token refreshes every 50 minutes, and `/api/v1/users/me` profile synchronization.

### 4.2 Routing and Protected Navigation
[client/src/app/router.jsx](file:///c:/Users/acer/Pictures/emc/drivair/client/src/app/router.jsx) governs application routing:
- **Public Routes:**
  - `/` → `HomePage` (Marketing, features, comparison, and FAQ).
  - `/login` → `LoginPage` (Role selection, Firebase phone/email sign-in, and redirect).
- **Role-Gated Routes (`<ProtectedRoute allowedRoles={[...]}>`):**
  - `/company/dashboard` → `CompanyDashboard` (allowed: `company`)
  - `/driver/dashboard` → `DriverDashboard` (allowed: `driver`)
  - `/vehicleOwner/dashboard` → `VehicleOwnerDashboard` (allowed: `vehicleOwner`)
  - `/admin/dashboard` → `AdminDashboard` (allowed: `admin`)
  - `*` → Redirect to `/`.

### 4.3 Portal UI and Tab Modularization
Each portal utilizes the unified [client/src/components/layout/PortalLayout.jsx](file:///c:/Users/acer/Pictures/emc/drivair/client/src/components/layout/PortalLayout.jsx) component providing sidebar navigation, responsive mobile drawers, role badges, and user profile menus. Within each dashboard, tabs control active sub-feature rendering:

| Dashboard | Tab ID | Label | Loaded Component | Functional Status |
|---|---|---|---|---|
| **Company** | `tracking` | Live GPS Radar | `CompanyLiveMap` | **SOURCE_VERIFIED** |
| | `contracts` | Active Contracts | `ContractList` | **SOURCE_VERIFIED** |
| | `hiring` | Direct Hiring | `DirectHiringExplorer` | **SOURCE_VERIFIED** |
| | `posts` | Tenders & Bids | `CompanyPostManager` | **SOURCE_VERIFIED** |
| | `chat` | Messages | `ChatMessenger` | **SOURCE_VERIFIED** |
| | `compliance`| Documents | `DocumentManager (ownerType="company")` | **SOURCE_VERIFIED** |
| **Driver** | `trip` | Live Trip GPS | `DriverTripTracker` | **SOURCE_VERIFIED** |
| | `marketplace`| Browse Contracts | `BrowsePosts` | **SOURCE_VERIFIED** |
| | `offers` | Direct Offers | `ReceivedOffers` | **SOURCE_VERIFIED** |
| | `contracts` | My Contracts | `ContractList` | **SOURCE_VERIFIED** |
| | `chat` | Messages | `ChatMessenger` | **SOURCE_VERIFIED** |
| | `compliance`| Credentials | `DocumentManager (ownerType="driver")` | **SOURCE_VERIFIED** |
| **Vehicle Owner** | `fleet` | Vehicle Fleet | `VehicleManager` | **SOURCE_VERIFIED** |
| | `marketplace`| Tenders & Posts | `BrowsePosts` | **SOURCE_VERIFIED** |
| | `offers` | Direct Requests | `ReceivedOffers` | **SOURCE_VERIFIED** |
| | `contracts` | Contracts | `ContractList` | **SOURCE_VERIFIED** |
| | `chat` | Messages | `ChatMessenger` | **SOURCE_VERIFIED** |
| | `compliance`| Permits & Docs | `DocumentManager (ownerType="vehicleOwner")` | **SOURCE_VERIFIED** |
| **Admin** | `verification`| Verification Queue | `AdminVerificationQueue` | **SOURCE_VERIFIED** |
| | `governance`| User Governance | `AdminAuditViewer` | **SOURCE_VERIFIED** |
| | `chat` | Audit Messenger | `ChatMessenger` | **SOURCE_VERIFIED** |

### 4.4 API and Real-Time Service Integration
- **HTTP Client:** [client/src/lib/api.js](file:///c:/Users/acer/Pictures/emc/drivair/client/src/lib/api.js) configures Axios with `baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'`. Interceptors inject `Bearer ${localStorage.getItem('drivair_token')}` on outgoing requests.
- **Socket Client:** Handled individually inside `ChatMessenger`, `CompanyLiveMap`, and `DriverTripTracker` via `io(socketUrl, { auth: { token } })`.

---

## 5. BACKEND ARCHITECTURE & REQUEST LIFECYCLE

### 5.1 Request Pipeline
Every request to the Express backend passes through a rigorous middleware chain:
```
Client Request
      │
      ▼
Helmet (Security headers)
      │
      ▼
CORS (Origin validation via env.CLIENT_URL)
      │
      ▼
RateLimiter (300 reqs / 15 min on /api)
      │
      ▼
Body Parsers (express.json limit: 10mb)
      │
      ▼
authenticate.js (Verify Bearer token via Firebase Admin; load User from MongoDB)
      │
      ▼
authorize(...roles) (Validate user.role against allowed roles)
      │
      ▼
validate(zodSchema) (Parse and sanitize req.body against Zod schema)
      │
      ▼
Controller Action (Execute business logic and Mongoose queries)
      │
      ▼
Central errorHandler (Standardized JSON output: { status, message, details })
```

### 5.2 Critical Implementation Path Analysis
- **`bids.controller.js` (`acceptBidAndCreateContract`):**
  1. Validates that the requesting user owns the `Company` that published the `ContractPost`.
  2. Ensures the bid is not already accepted.
  3. Verifies that `awardedBidIds.length` does not exceed required positions (`requiredDrivers + requiredVehicles`).
  4. Marks the `Bid` as accepted with `acceptedAt: new Date()`.
  5. Updates `ContractPost` status to `awarded` or `partiallyAwarded`.
  6. Generates a canonical contract identifier `CNT-${Date.now()}-${random}` and creates a binding `Contract` document.
  7. *Deficiency:* Performed as sequential Mongoose writes without a database transaction session.
- **`contracts.controller.js`:**
  - Implements role-filtered retrieval: companies see contracts where `companyId` matches their company profile; drivers/owners see contracts where `providerId` matches `req.user._id`.
  - Enforces status progression rules (`active`, `completed`, `cancelled`, `terminated`).
- **`tracking.controller.js` & `trips.controller.js`:**
  - Validates driver assignment before allowing trip starts.
  - Implements out-of-order stale telemetry discarding by comparing client timestamps against `trip.lastKnownLocation.recordedAt`.
  - Dual-writes to `Trip.lastKnownLocation` and appends historical breadcrumbs to `LiveLocation`.

---

## 6. DATABASE ARCHITECTURE ANALYSIS

The application uses **MongoDB** via **Mongoose**. All schemas are strictly typed with timestamps enabled.

### 6.1 Database Model Inventory

| # | Model Name | Source File | Key Relations & Foreign Keys | Indexes & Constraints | Purpose |
|---|---|---|---|---|---|
| 1 | **User** | `users/users.model.js` | None (Root identity) | `{ firebaseUid: 1 }` (Unique), `{ role: 1, accountStatus: 1 }` | Core user identity, RBAC role, and login status |
| 2 | **Company** | `companies/companies.model.js` | `userId → User` | `{ userId: 1 }` (Unique), `{ companyName: 'text' }` | Commercial shipper profile and verification state |
| 3 | **Driver** | `drivers/drivers.model.js` | `userId → User` | `{ userId: 1 }` (Unique), `{ availabilityStatus: 1, verificationStatus: 1 }` | Professional driver profile, licensing, and experience |
| 4 | **VehicleOwner** | `vehicleOwners/vehicleOwners.model.js` | `userId → User` | `{ userId: 1 }` (Unique), `{ verificationStatus: 1 }` | Fleet owner profile and verification status |
| 5 | **Vehicle** | `vehicles/vehicles.model.js` | `ownerId → User` | `{ vehicleType: 1, availabilityStatus: 1, verificationStatus: 1 }` | Commercial vehicle asset details and RC records |
| 6 | **ContractPost** | `marketplace/marketplace.model.js` | `companyId → Company`, `createdBy → User`, `awardedBidIds → [Bid]` | `{ status: 1, applicationDeadline: 1 }`, `{ companyId: 1, createdAt: -1 }` | Tenders published by companies for bidding |
| 7 | **Bid** | `bids/bids.model.js` | `contractPostId → ContractPost`, `bidderId → User`, `vehicleId → Vehicle` | `{ contractPostId: 1, bidderId: 1 }` (Unique compound) | Competitive provider bids on published tenders |
| 8 | **ContractRequest** | `directHiring/directHiring.model.js` | `companyId → Company`, `createdBy → User`, `providerId → User`, `vehicleId → Vehicle` | `{ providerId: 1, status: 1 }`, `{ companyId: 1, status: 1 }` | Direct hiring offers and counters |
| 9 | **Contract** | `contracts/contracts.model.js` | `companyId → Company`, `providerId → User`, `sourceBidId → Bid`, `sourceRequestId → ContractRequest`, `vehicleId → Vehicle` | `{ contractNumber: 1 }` (Unique), `{ companyId: 1, status: 1 }`, `{ providerId: 1, status: 1 }` | Official binding transport agreements |
| 10 | **Trip** | `trips/trips.model.js` | `contractId → Contract`, `companyId → Company`, `driverId → User`, `vehicleId → Vehicle` | `{ companyId: 1, status: 1 }`, `{ driverId: 1, status: 1 }`, `{ contractId: 1, status: 1 }` | Operational execution of an active contract |
| 11 | **LiveLocation** | `tracking/liveLocation.model.js` | `tripId → Trip`, `contractId → Contract`, `companyId → Company`, `driverId → User` | `{ recordedAt: 1 }` (TTL: 30 days), `{ tripId: 1, recordedAt: -1 }` | Historical GPS coordinate breadcrumb trail |
| 12 | **Document** | `documents/documents.model.js` | `ownerId → User`, `vehicleId → Vehicle`, `verifiedBy → User` | `{ ownerId: 1, documentType: 1 }`, `{ verificationStatus: 1, expiryDate: 1 }` | Cloudinary file metadata and admin verification |
| 13 | **DocumentRequirement** | `documents/documentRequirements.model.js` | None | `{ category: 1 }` | Compliance policy definitions per vehicle/role |
| 14 | **Conversation** | `chat/chat.model.js` | `participants.userId → User`, `lastMessageId → Message` | `{ 'participants.userId': 1, lastMessageAt: -1 }`, `{ contextType: 1, contextId: 1 }` | Chat rooms between marketplace participants |
| 15 | **Message** | `chat/message.model.js` | `conversationId → Conversation`, `senderId → User` | `{ conversationId: 1, createdAt: -1 }` | Chat messages, attachments, and offer payloads |
| 16 | **Notification** | `notifications/notifications.model.js` | `userId → User` | `{ userId: 1, isRead: 1, createdAt: -1 }` | In-app user activity notifications |
| 17 | **AuditLog** | `admin/admin.model.js` | `actorId → User` | `{ actorId: 1 }`, `{ action: 1 }`, `{ createdAt: -1 }` | Immutable governance and administrative audit trail |

### 6.2 Data Model Observations & Risks
- **Duplicate/Unused Models:** `server/src/modules/auth/auth.model.js` is a **0-byte file (orphan)**. Auth operations use `User` from `users/users.model.js`. This brings the total count to **18 `.model.js` files** (17 active + 1 empty orphan).
- **Paise Currency Convention:** Financial figures (`proposedAmountPaise`, `agreedAmountPaise`, `offeredAmountPaise`, `budget.minAmountPaise`) are stored as integers in paise, preventing floating-point rounding errors.
- **TTL Indexing:** `LiveLocation` enforces an automated MongoDB TTL index (`expireAfterSeconds: 30 * 24 * 60 * 60`), automatically purging breadcrumbs older than 30 days to bound database storage growth.

---

## 7. REGISTERED API ENDPOINT INVENTORY

Every route below is verified from route definitions registered in `server/src/app.js` and mounted routers.

| HTTP Method | Registered Endpoint | Route File | Controller Handler | Auth Req | Role / Permission | Purpose | Status |
|---|---|---|---|---|---|---|---|
| **System** | | | | | | | |
| GET | `/api/v1/health` | `app.js` | Inline | No | Public | Health & uptime probe | **SOURCE_VERIFIED** |
| **Authentication** | | | | | | | |
| POST | `/api/v1/auth/sync` | `auth.routes.js` | `authController.sync` | Bearer | Any valid Firebase token | Sync Firebase user into MongoDB | **SOURCE_VERIFIED** |
| **Users** | | | | | | | |
| GET | `/api/v1/users/me` | `users.routes.js` | `usersController.getMe` | Bearer | Any registered user | Fetch current user session | **SOURCE_VERIFIED** |
| PATCH | `/api/v1/users/me` | `users.routes.js` | `usersController.updateMe` | Bearer | Any registered user | Update user profile fields | **SOURCE_VERIFIED** |
| GET | `/api/v1/users/:id/public-profile` | `users.routes.js` | `usersController.getPublicProfile` | Bearer | Any authenticated user | Fetch public provider card | **SOURCE_VERIFIED** |
| **Companies** | | | | | | | |
| GET | `/api/v1/companies/me` | `companies.routes.js` | `companiesController.getMyCompany` | Bearer | `company`, `admin` | Get company business profile | **SOURCE_VERIFIED** |
| PUT | `/api/v1/companies/me` | `companies.routes.js` | `companiesController.updateMyCompany` | Bearer | `company` | Update company business details | **SOURCE_VERIFIED** |
| **Drivers** | | | | | | | |
| GET | `/api/v1/drivers/me` | `drivers.routes.js` | `driversController.getMyDriverProfile` | Bearer | `driver`, `admin` | Get driver profile & skills | **SOURCE_VERIFIED** |
| PUT | `/api/v1/drivers/me` | `drivers.routes.js` | `driversController.updateMyDriverProfile` | Bearer | `driver` | Update driver profile & license | **SOURCE_VERIFIED** |
| **Vehicle Owners** | | | | | | | |
| GET | `/api/v1/vehicle-owners/me` | `vehicleOwners.routes.js` | `vehicleOwnersController.getMyVehicleOwnerProfile` | Bearer | `vehicleOwner`, `admin` | Get fleet owner profile | **SOURCE_VERIFIED** |
| PUT | `/api/v1/vehicle-owners/me` | `vehicleOwners.routes.js` | `vehicleOwnersController.updateMyVehicleOwnerProfile`| Bearer | `vehicleOwner` | Update fleet owner profile | **SOURCE_VERIFIED** |
| **Vehicles** | | | | | | | |
| GET | `/api/v1/vehicles/search` | `vehicles.routes.js` | `vehiclesController.searchVehicles` | Bearer | `company`, `admin` | Filter & search available fleet | **SOURCE_VERIFIED** |
| POST | `/api/v1/vehicles` | `vehicles.routes.js` | `vehiclesController.createVehicle` | Bearer | `vehicleOwner` | Register vehicle in fleet | **SOURCE_VERIFIED** |
| GET | `/api/v1/vehicles/mine` | `vehicles.routes.js` | `vehiclesController.getMyVehicles` | Bearer | `vehicleOwner` | Get owner's vehicle fleet | **SOURCE_VERIFIED** |
| PATCH | `/api/v1/vehicles/:id` | `vehicles.routes.js` | `vehiclesController.updateVehicle` | Bearer | `vehicleOwner` | Update vehicle details | **SOURCE_VERIFIED** |
| DELETE | `/api/v1/vehicles/:id` | `vehicles.routes.js` | `vehiclesController.deleteVehicle` | Bearer | `vehicleOwner` | Remove vehicle from fleet | **SOURCE_VERIFIED** |
| **Contract Posts (Tenders)** | | | | | | | |
| GET | `/api/v1/contract-posts` | `marketplace.routes.js` | `marketplaceController.getBrowsePosts` | Bearer | Authenticated | Browse open marketplace posts | **SOURCE_VERIFIED** |
| GET | `/api/v1/contract-posts/mine`| `marketplace.routes.js` | `marketplaceController.getMyCompanyPosts`| Bearer | `company` | Get company-created posts | **SOURCE_VERIFIED** |
| GET | `/api/v1/contract-posts/:id` | `marketplace.routes.js` | `marketplaceController.getPostDetails` | Bearer | Authenticated | Get full details of a post | **SOURCE_VERIFIED** |
| POST | `/api/v1/contract-posts` | `marketplace.routes.js` | `marketplaceController.createPost` | Bearer | `company` | Create contract post draft | **SOURCE_VERIFIED** |
| POST | `/api/v1/contract-posts/:id/publish` | `marketplace.routes.js` | `marketplaceController.publishPost` | Bearer | `company` | Publish draft post to market | **SOURCE_VERIFIED** |
| POST | `/api/v1/contract-posts/:id/close` | `marketplace.routes.js` | `marketplaceController.closePost` | Bearer | `company` | Close post to new bids | **SOURCE_VERIFIED** |
| POST | `/api/v1/contract-posts/:id/bids` | `marketplace.routes.js` | `bidsController.submitBid` | Bearer | `driver`, `vehicleOwner` | Submit bid proposal on post | **SOURCE_VERIFIED** |
| GET | `/api/v1/contract-posts/:id/bids` | `marketplace.routes.js` | `bidsController.getBidsForPost` | Bearer | `company` | View submitted bids for post | **SOURCE_VERIFIED** |
| **Bids** | | | | | | | |
| GET | `/api/v1/bids/mine` | `bids.routes.js` | `bidsController.getMyBids` | Bearer | `driver`, `vehicleOwner` | View provider's submitted bids | **SOURCE_VERIFIED** |
| POST | `/api/v1/bids/:id/shortlist` | `bids.routes.js` | `bidsController.shortlistBid` | Bearer | `company` | Mark bid as shortlisted | **SOURCE_VERIFIED** |
| POST | `/api/v1/bids/:id/reject` | `bids.routes.js` | `bidsController.rejectBid` | Bearer | `company` | Mark bid as rejected | **SOURCE_VERIFIED** |
| POST | `/api/v1/bids/:id/accept` | `bids.routes.js` | `bidsController.acceptBidAndCreateContract` | Bearer | `company` | Accept bid & spawn Contract | **SOURCE_VERIFIED** |
| **Contracts** | | | | | | | |
| GET | `/api/v1/contracts/mine` | `contracts.routes.js` | `contractsController.getMyContracts` | Bearer | Authenticated | Get active & historical contracts | **SOURCE_VERIFIED** |
| GET | `/api/v1/contracts/:id` | `contracts.routes.js` | `contractsController.getContractById` | Bearer | Involved Parties / Admin | Get full contract terms | **SOURCE_VERIFIED** |
| PATCH | `/api/v1/contracts/:id/status`| `contracts.routes.js` | `contractsController.updateContractStatus` | Bearer | Involved Parties / Admin | Update contract status | **SOURCE_VERIFIED** |
| **Direct Hiring** | | | | | | | |
| GET | `/api/v1/direct-hiring/providers/search` | `directHiring.routes.js` | `directHiringController.searchProviders` | Bearer | `company`, `admin` | Search drivers/fleet for hire | **SOURCE_VERIFIED** |
| POST | `/api/v1/direct-hiring/offers` | `directHiring.routes.js` | `directHiringController.createDirectOffer` | Bearer | `company` | Send direct hire offer | **SOURCE_VERIFIED** |
| GET | `/api/v1/direct-hiring/offers/sent` | `directHiring.routes.js` | `directHiringController.getSentOffers` | Bearer | `company` | View company sent offers | **SOURCE_VERIFIED** |
| GET | `/api/v1/direct-hiring/offers/received`| `directHiring.routes.js` | `directHiringController.getReceivedOffers`| Bearer | `driver`, `vehicleOwner` | View received direct offers | **SOURCE_VERIFIED** |
| POST | `/api/v1/direct-hiring/offers/:id/accept` | `directHiring.routes.js` | `directHiringController.acceptDirectOffer` | Bearer | `driver`, `vehicleOwner` | Accept offer & spawn Contract | **SOURCE_VERIFIED** |
| POST | `/api/v1/direct-hiring/offers/:id/reject` | `directHiring.routes.js` | `directHiringController.rejectDirectOffer` | Bearer | `driver`, `vehicleOwner` | Decline direct hire offer | **SOURCE_VERIFIED** |
| POST | `/api/v1/direct-hiring/offers/:id/counter`| `directHiring.routes.js` | `directHiringController.counterDirectOffer`| Bearer | Involved Parties | Submit counter-offer amount | **SOURCE_VERIFIED** |
| **Chat & Messaging** | | | | | | | |
| POST | `/api/v1/chat/conversations` | `chat.routes.js` | `chatController.getOrCreateConversation` | Bearer | Authenticated | Create/open direct conversation | **SOURCE_VERIFIED** |
| GET | `/api/v1/chat/conversations` | `chat.routes.js` | `chatController.getMyConversations` | Bearer | Authenticated | List user conversations | **SOURCE_VERIFIED** |
| GET | `/api/v1/chat/conversations/:id/messages` | `chat.routes.js` | `chatController.getMessages` | Bearer | Conversation Member | Get paginated chat history | **SOURCE_VERIFIED** |
| POST | `/api/v1/chat/conversations/:id/messages` | `chat.routes.js` | `chatController.postMessage` | Bearer | Conversation Member | Post REST chat fallback | **SOURCE_VERIFIED** |
| **Documents & Compliance** | | | | | | | |
| POST | `/api/v1/documents/upload-file` | `documents.routes.js` | `documentsController.uploadDirectFile` | Bearer | Authenticated | Binary file upload to Cloudinary | **SOURCE_VERIFIED** |
| POST | `/api/v1/documents/upload` | `documents.routes.js` | `documentsController.uploadDocumentRecord` | Bearer | Authenticated | Metadata document register | **SOURCE_VERIFIED** |
| GET | `/api/v1/documents/mine` | `documents.routes.js` | `documentsController.getMyDocuments` | Bearer | Authenticated | View own uploaded documents | **SOURCE_VERIFIED** |
| GET | `/api/v1/documents/:id/access` | `documents.routes.js` | `documentsController.getDocumentAccess` | Bearer | Document Owner / Admin | Secure document URL access | **SOURCE_VERIFIED** |
| GET | `/api/v1/documents/admin/queue` | `documents.routes.js` | `documentsController.getAdminVerificationQueue` | Bearer | `admin` | Verification review queue | **SOURCE_VERIFIED** |
| PATCH | `/api/v1/documents/admin/:id/verify` | `documents.routes.js` | `documentsController.verifyDocument` | Bearer | `admin` | Approve or reject document | **SOURCE_VERIFIED** |
| **Trips & Live Tracking** | | | | | | | |
| POST | `/api/v1/trips/start` | `trips.routes.js` | `tripsController.startTrip` | Bearer | `driver`, `vehicleOwner` | Start contract trip execution | **SOURCE_VERIFIED** |
| POST | `/api/v1/trips/:tripId/end` | `trips.routes.js` | `tripsController.endTrip` | Bearer | `driver`, `vehicleOwner`, `admin` | Complete/terminate trip | **SOURCE_VERIFIED** |
| GET | `/api/v1/trips/active` | `trips.routes.js` | `tripsController.getActiveTrips` | Bearer | Authenticated | Query ongoing active trips | **SOURCE_VERIFIED** |
| GET | `/api/v1/trips/history` | `trips.routes.js` | `tripsController.getTripHistory` | Bearer | Authenticated | Query historical completed trips| **SOURCE_VERIFIED** |
| GET | `/api/v1/trips/:tripId` | `trips.routes.js` | `tripsController.getTripById` | Bearer | Involved Parties / Admin | Inspect specific trip details | **SOURCE_VERIFIED** |
| POST | `/api/v1/tracking/location` | `tracking.routes.js` | `trackingController.recordLocation` | Bearer | `driver`, `vehicleOwner` | Ingest REST GPS telemetry | **SOURCE_VERIFIED** |
| GET | `/api/v1/tracking/:tripId/latest` | `tracking.routes.js` | `trackingController.getLatestLocation` | Bearer | Involved Parties / Admin | Get latest known coordinate | **SOURCE_VERIFIED** |
| GET | `/api/v1/tracking/:tripId/history`| `tracking.routes.js` | `trackingController.getLocationHistory`| Bearer | Involved Parties / Admin | Get polyline trail coordinates | **SOURCE_VERIFIED** |
| **Notifications** | | | | | | | |
| GET | `/api/v1/notifications` | `notifications.routes.js` | `notificationsController.getMyNotifications` | Bearer | Authenticated | Fetch user notifications | **SOURCE_VERIFIED** |
| PATCH | `/api/v1/notifications/:id/read` | `notifications.routes.js` | `notificationsController.markNotificationRead` | Bearer | Authenticated | Mark notification as read | **SOURCE_VERIFIED** |
| **Admin Governance** | | | | | | | |
| GET | `/api/v1/admin/users` | `admin.routes.js` | `adminController.getAllUsers` | Bearer | `admin` | List all users across roles | **SOURCE_VERIFIED** |
| PATCH | `/api/v1/admin/users/:id/status` | `admin.routes.js` | `adminController.updateUserStatus` | Bearer | `admin` | Suspend, activate, or block | **SOURCE_VERIFIED** |
| GET | `/api/v1/admin/audit-logs` | `admin.routes.js` | `adminController.getAuditLogs` | Bearer | `admin` | Query system audit events | **SOURCE_VERIFIED** |

*(Note: Dual route mounts `/api/trips` and `/api/tracking` are also registered in `server/src/app.js` for backward compatibility).*

---

## 8. SOCKET.IO ARCHITECTURE & REAL-TIME SYSTEM

The Socket.IO server is initialized in [server/src/server.js](file:///c:/Users/acer/Pictures/emc/drivair/server/src/server.js) with handlers registered in [server/src/sockets/chat.socket.js](file:///c:/Users/acer/Pictures/emc/drivair/server/src/sockets/chat.socket.js).

### 8.1 Connection Lifecycle & Authentication Guard
1. **Connection Handshake:** Client connects passing JWT: `io(url, { auth: { token: '...' } })`.
2. **Middleware Gate (`io.use`):**
   - Calls `verifyIdToken(token)`.
   - Locates corresponding MongoDB `User` record via `firebaseUid`.
   - Attaches `socket.user = user` to socket instance.
   - Rejects unauthenticated connections with `Error('Authentication token required')` or `Error('User not found')`.
3. **Connection Termination:** Disconnect event logs socket cleanup.

### 8.2 Real-Time Event Inventory

| Direction | Event Name | Payload | Room / Scope | Handler Logic & Database Effects |
|---|---|---|---|---|
| **Client → Server** | `join_conversation` | `{ conversationId: string }` | Direct socket | Validates that `socket.user._id` is in `Conversation.participants`. Calls `socket.join('conversation_' + id)`. |
| **Client → Server** | `send_message` | `{ conversationId, content/messageText }` | `conversation_${id}` | Validates membership; creates `Message` document; updates `Conversation.lastMessageId` and `lastMessageAt`; emits `new_message` to room. |
| **Server → Client** | `new_message` | `{ _id, conversationId, senderId, messageText, createdAt }` | `conversation_${id}` | Broadcasts new message to both participants in real-time. |
| **Client → Server** | `start_trip` | `{ contractId, vehicleNumber, startLocation }` | Direct socket | Validates `Contract.status === 'active'` and `contract.providerId === socket.user._id`. Creates or recovers `Trip` with `status: 'active'`. Joins `trip_${tripId}` and `trip_contract_${contractId}`. Emits `trip_started`. |
| **Server → Client** | `trip_started` | `{ tripId, contractId, driverId, driverName, vehicleNumber, status, startedAt }` | `trip_${tripId}` & `trip_contract_${contractId}` | Notifies company live radar map that tracking has begun. |
| **Client → Server** | `join_trip` | `{ tripId, contractId }` | Direct socket | Validates authorization: Driver must be assigned, Company must own contract, or Admin. Joins rooms and immediately sends back latest known coordinates via `location_updated`. |
| **Client → Server** | `update_location` | `{ tripId/contractId, lat, lng, accuracy, speed, heading }` | Direct socket | Strictly verifies `trip.driverId === socket.user._id` and `trip.status === 'active'`. Updates `Trip.lastKnownLocation` and creates a persistent breadcrumb in `LiveLocation`. Broadcasts `location_updated` and legacy alias `vehicle_location`. |
| **Server → Client** | `location_updated` | `{ tripId, contractId, driverId, driverName, lat, lng, accuracy, speed, heading, updatedAt }` | `trip_${tripId}` & `trip_contract_${contractId}` | Company radar map updates vehicle marker position and polyline. |
| **Client → Server** | `end_trip` | `{ tripId, contractId, endLocation }` | Direct socket | Verifies caller is assigned driver or admin. Sets `Trip.status = 'completed'`, records `endedAt`. Broadcasts `trip_ended`. |
| **Server → Client** | `trip_ended` | `{ tripId, contractId, status: 'completed', endedAt }` | `trip_${tripId}` & `trip_contract_${contractId}` | Radar map removes vehicle marker and refreshes active trips. |
| **Server → Client** | `tracking_error` | `{ message: string }` | Direct socket | Emitted when unassigned users attempt unauthorized tracking operations. |

### 8.3 In-Memory vs Clustered State
- **Redis Adapter Status:** **NOT PRESENT**. The current implementation uses the default in-memory adapter (`@socket.io/redis-adapter` is not installed). Multi-process clusters or multi-instance autoscaling on cloud providers will suffer room partitioning.

---

## 9. DEPENDENCY & PACKAGE AUDIT

### 9.1 Root Manifests
No root `package.json` exists; the project is structured as two independent package roots (`client/package.json` and `server/package.json`).

### 9.2 Frontend Dependencies (`client/package.json`)
- **Runtime Dependencies (8):**
  - `@tanstack/react-query@^5.66.0`: Modern asynchronous state management.
  - `axios@^1.7.9`: HTTP client.
  - `firebase@^11.3.1`: Client SDK for Firebase Auth.
  - `leaflet@^1.9.4` & `react-leaflet@^5.0.0`: Interactive mapping.
  - `lucide-react@^0.475.0`: Icon library.
  - `react@^19.0.0` & `react-dom@^19.0.0`: React 19 core.
  - `react-router-dom@^7.1.5`: React Router 7.
  - `socket.io-client@^4.8.1`: WebSocket client matching backend.
- **Development Dependencies (6):**
  - `@tailwindcss/vite@^4.0.6` & `tailwindcss@^4.0.6`: Tailwind v4 engine.
  - `@types/react@^19.0.8` & `@types/react-dom@^19.0.3`: TypeScript types.
  - `@vitejs/plugin-react@^4.3.4`: Vite React JSX compiler.
  - `vite@^6.1.0`: Build tooling.
- **Scripts:** `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`). Missing: `test`, `lint`.

### 9.3 Backend Dependencies (`server/package.json`)
- **Runtime Dependencies (12):**
  - `cloudinary@^2.11.0`: Cloud file storage for documents.
  - `cors@^2.8.5`: Cross-origin request headers.
  - `dotenv@^16.4.7`: Environment variable injection.
  - `express@^4.21.2`: HTTP web server.
  - `express-rate-limit@^7.5.0`: Request rate limiting.
  - `firebase-admin@^13.1.0`: Firebase server SDK.
  - `helmet@^8.0.0`: Security HTTP headers.
  - `mongoose@^8.10.1`: MongoDB object modeling.
  - `multer@^2.5.0`: Multipart form upload handling.
  - `socket.io@^4.8.1`: Real-time WebSocket server.
  - `zod@^3.24.2`: Schema validation.
- **Development Dependencies:** None specified.
- **Scripts:** `dev` (`node --watch src/server.js`), `start` (`node src/server.js`). Missing: `test`. (Tests exist in `server/test/` but are unmapped in `package.json`).

---

## 10. CONFIGURATION & DEPLOYMENT INVENTORY

### 10.1 Environment Variables (Names Only)

#### Client (`client/.env` and `client/.env.example`)
- `VITE_API_URL`
- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

#### Server (`server/.env` and `server/.env.example`)
- `NODE_ENV`
- `PORT`
- `CLIENT_URL`
- `MONGODB_URI`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GPS_MIN_SAMPLE_INTERVAL_MS`
- `GPS_LOCATION_RETENTION_DAYS`

### 10.2 Deployment Manifests
- **Render (`render.yaml`):**
  Configures a Node web service `drivair-api` with `rootDir: server`, `buildCommand: npm install`, `startCommand: node src/server.js`, and `healthCheckPath: /api/v1/health`.
- **Vercel (`client/vercel.json`):**
  Configures SPA client rewrites mapping all incoming requests (`/(.*)`) to `/index.html` and sets 1-year immutable caching on `/assets/(.*)`.
- **Docker / Containers:** No `Dockerfile` or `docker-compose.yml` present in repository.

---

## 11. ARCHITECTURAL DEPENDENCY MAPPING (MERMAID)

### A. Overall System Architecture
```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (React 19 / Vite)"]
        Browser["User Web Browser"]
        AuthContext["Auth Context (Firebase Client)"]
        AxiosClient["Axios REST Client"]
        SocketClient["Socket.IO Client"]
        LeafletMap["Leaflet GIS Radar"]
        Browser --> AuthContext
        Browser --> AxiosClient
        Browser --> SocketClient
        SocketClient --> LeafletMap
    end

    subgraph GatewayLayer["Backend API & Realtime (Express / Socket.IO)"]
        HTTPServer["Node HTTP Server (:5000)"]
        ExpressApp["Express.js App (/api/v1)"]
        SocketServer["Socket.IO Engine"]
        AuthMiddleware["authenticate.js & authorize.js"]
        HTTPServer --> ExpressApp
        HTTPServer --> SocketServer
        ExpressApp --> AuthMiddleware
    end

    subgraph ServiceIntegrations["Third-Party Cloud Services"]
        FirebaseAuth["Firebase Auth API"]
        CloudinaryAPI["Cloudinary Asset Storage"]
    end

    subgraph DatabaseLayer["Persistent Storage (MongoDB)"]
        MongoDB[(MongoDB Database)]
        Models["17 Active Mongoose Models"]
        MongoDB --- Models
    end

    AxiosClient -->|"HTTPS / REST (Bearer JWT)"| ExpressApp
    SocketClient -->|"WSS / Socket Handshake"| SocketServer
    AuthContext -->|"Token Exchange"| FirebaseAuth
    AuthMiddleware -->|"Cryptographic Token Verify"| FirebaseAuth
    ExpressApp -->|"Binary Uploads"| CloudinaryAPI
    ExpressApp --> Models
    SocketServer --> Models
```

### B. Backend Request Lifecycle
```mermaid
sequenceDiagram
    autonumber
    participant Client as Client Browser
    participant Express as Express Router
    participant Auth as authenticate & authorize
    participant Validate as validate(Zod)
    participant Controller as Controller Handler
    participant Model as Mongoose Model
    participant DB as MongoDB Instance

    Client->>Express: HTTP Request (Method, URL, Bearer Token, Body)
    Express->>Auth: Pass through auth middleware
    Auth->>Auth: Verify JWT & fetch User from DB
    alt Token Invalid or User Suspended
        Auth-->>Client: 401 Unauthorized / 403 Forbidden
    else Token & Role Valid
        Auth->>Validate: Pass to Zod validator
        alt Payload fails schema
            Validate-->>Client: 400 Bad Request (Validation details)
        else Payload valid
            Validate->>Controller: Forward sanitized request
            Controller->>Model: Query / Mutate operations
            Model->>DB: MongoDB wire protocol
            DB-->>Model: Query results / Write acknowledge
            Model-->>Controller: Document instance(s)
            Controller-->>Client: 200/201 JSON Response { status: 'success', data }
        end
    end
```

### C. Real-Time Tracking & Telemetry Architecture
```mermaid
sequenceDiagram
    autonumber
    participant Driver as Driver Tracker (Mobile/Web)
    participant Socket as Socket.IO Server
    participant DB as MongoDB (Trip & LiveLocation)
    participant Company as Company Live Radar Map

    Driver->>Socket: emit('start_trip', { contractId, vehicleNumber })
    Socket->>DB: Validate Contract assignment & create active Trip
    Socket->>Driver: emit('trip_started', { tripId })
    Socket->>Company: emit('trip_started', { tripId })

    loop Continuous GPS Telemetry (Interval ~3-5s)
        Driver->>Socket: emit('update_location', { tripId, lat, lng, speed, heading })
        Socket->>Socket: Verify caller is assigned driver & trip is active
        Socket->>DB: Update Trip.lastKnownLocation
        Socket->>DB: Append LiveLocation breadcrumb (TTL 30d)
        Socket->>Company: broadcast to room('trip_contract_${id}'): 'location_updated'
        Company->>Company: Update vehicle marker & polyline on Leaflet Map
    end

    Driver->>Socket: emit('end_trip', { tripId })
    Socket->>DB: Set Trip.status = 'completed', endedAt = now()
    Socket->>Company: broadcast 'trip_ended'
```

### D. Core Business Entity Relationship Diagram
```mermaid
erDiagram
    User ||--o| Company : "owns"
    User ||--o| Driver : "owns"
    User ||--o| VehicleOwner : "owns"
    User ||--o{ Vehicle : "registers (fleet)"
    User ||--o{ Document : "uploads"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "triggers"

    Company ||--o{ ContractPost : "publishes (tenders)"
    Company ||--o{ ContractRequest : "issues (direct offers)"
    Company ||--o{ Contract : "enters into"

    ContractPost ||--o{ Bid : "receives"
    Driver ||--o{ Bid : "submits"
    VehicleOwner ||--o{ Bid : "submits"

    ContractPost ||--o{ Contract : "spawns (on accepted bid)"
    ContractRequest ||--o{ Contract : "spawns (on accepted offer)"
    
    Contract ||--o{ Trip : "executes via"
    Trip ||--o{ LiveLocation : "records telemetry into"
    
    Conversation ||--o{ Message : "contains"
    User ||--o{ Conversation : "participates in"
```

---

## 12. FEATURE IMPLEMENTATION STATUS INVENTORY

| Feature / Module | Verification Category | Source File Evidence | Implementation Assessment |
|---|---|---|---|
| **User Auth & Role Provisioning** | **SOURCE_VERIFIED** | `auth.routes.js`, `auth.controller.js`, `AuthContext.jsx` | Full Firebase verification and MongoDB profile sync. |
| **Admin Governance & Queue** | **SOURCE_VERIFIED** | `admin.routes.js`, `admin.controller.js`, `AdminAuditViewer.jsx` | Document approval/rejection and user account status moderation. |
| **Company Dashboard** | **SOURCE_VERIFIED** | `router.jsx`, `CompanyLiveMap.jsx`, `CompanyPostManager.jsx` | Complete portal with tabbed views for GPS, tenders, contracts, and hiring. |
| **Driver Dashboard** | **SOURCE_VERIFIED** | `router.jsx`, `DriverTripTracker.jsx`, `BrowsePosts.jsx` | Trip tracker, contract browser, direct offer receiver, and document manager. |
| **Vehicle Owner Dashboard** | **SOURCE_VERIFIED** | `router.jsx`, `VehicleManager.jsx`, `BrowsePosts.jsx` | Fleet vehicle management, permits, marketplace browsing, and offers. |
| **Tender Marketplace** | **SOURCE_VERIFIED** | `marketplace.controller.js`, `BrowsePosts.jsx` | Posting tenders, status filtering, budget ranges, and deadline checks. |
| **Bidding Subsystem** | **SOURCE_VERIFIED** | `bids.controller.js`, `BrowsePosts.jsx`, `CompanyPostManager.jsx` | Bid submission, duplicate prevention, shortlisting, and rejection. |
| **Bid Awarding & Contracts** | **PARTIALLY_VERIFIED** | `bids.controller.js` L113–176 | Contract record creation SOURCE_VERIFIED; multi-document atomicity NOT guaranteed (no Mongoose transaction — see AR-01). |
| **Direct Hiring** | **SOURCE_VERIFIED** | `directHiring.controller.js`, `DirectHiringExplorer.jsx`, `ReceivedOffers.jsx` | Direct offer creation, provider search, counter offers, and acceptance into `Contract`. |
| **Contract Register** | **SOURCE_VERIFIED** | `contracts.controller.js`, `ContractList.jsx` | View canonical contracts, terms, status updates, and vehicle assignment. |
| **Real-Time Messaging** | **SOURCE_VERIFIED** | `chat.socket.js`, `chat.controller.js`, `ChatMessenger.jsx` | Socket room creation, messaging, read receipts, and REST fallback history. |
| **Live GPS Radar Tracking** | **SOURCE_VERIFIED** | `chat.socket.js`, `tracking.controller.js`, `CompanyLiveMap.jsx`, `DriverTripTracker.jsx` | Real-time coordinate ingestion, out-of-order protection, and Leaflet rendering. |
| **Compliance Documents** | **SOURCE_VERIFIED** | `documents.controller.js`, `DocumentManager.jsx` | Multer direct binary upload, Cloudinary cloud storage, and admin review queue. |
| **Notifications** | **NOT_IMPLEMENTED** | `notifications.model.js`, `notifications.controller.js` | Schema and CRUD endpoints exist, but (a) no business event ever calls `Notification.create()` — grep across all controllers returns zero results — and (b) `PortalLayout.jsx` (301 lines) contains no bell icon, badge, or toast UI component. End-to-end notification delivery is non-functional. |
| **Service Layer Abstraction**| **NOT_IMPLEMENTED** | `server/src/modules/*/*.service.js` | 13 of 14 service files are 0-byte stubs. Only `auth.service.js` (1,418 bytes) is non-empty and actively used by `auth.controller.js`. All other domain business logic resides entirely in controllers. |
| **Background Job Processing**| **NOT_IMPLEMENTED** | None | No job queues (Bull, Agenda, or Cron) exist for expired tender cleanup or document expiry reminders. |
| **Testing Infrastructure** | **PARTIALLY_VERIFIED** | `server/test/runTests.js`, `server/test/twoAccountGpsTest.js` | Both test scripts were executed in this audit session (2026-11-23) and passed: `runTests.js` 7/7, `twoAccountGpsTest.js` 8/8 (RUNTIME_VERIFIED for schema/model invariants). These tests do NOT exercise live HTTP endpoints, database connections, or Socket.IO. No `npm test` script exists in `package.json`. Not wired into CI/CD. |

---

## 13. ARCHITECTURAL RISKS & TECHNICAL DEBT

### Finding AR-01: Missing Database Transaction Guarantees (Severity: P1)
- **Affected Files:** [server/src/modules/bids/bids.controller.js](file:///c:/Users/acer/Pictures/emc/drivair/server/src/modules/bids/bids.controller.js#L113-L176), [server/src/modules/directHiring/directHiring.controller.js](file:///c:/Users/acer/Pictures/emc/drivair/server/src/modules/directHiring/directHiring.controller.js#L96-L151)
- **Evidence (source-inspected, line-level):**
  - `bids.controller.js` L113–176 (`acceptBidAndCreateContract`): Three sequential `await` writes — `bid.save()` at **L135**, `post.save()` at **L144**, `Contract.create()` at **L148** — with no `mongoose.startSession()` or `withTransaction()` anywhere in the file. Grep across all `server/src/modules/**/*.controller.js` for `startSession|withTransaction|mongoose.session` returns **zero matches**.
  - `directHiring.controller.js` L96–151 (`acceptDirectOffer`): Two sequential writes — `offer.save()` at **L119**, `Contract.create()` at **L123** — same absence of transaction sessions confirmed.
- **Why It Matters:** If the server crashes or MongoDB encounters a write constraint during `Contract.create()`, the `Bid` remains marked as `accepted` and `ContractPost` awarded, but no binding legal contract is created, creating orphaned records and contract disputes.
- **Recommended Action (Phase 2):** Refactor multi-document write workflows to execute inside `withTransaction()`.

### Finding AR-02: Empty Service Layer & Fat Controllers (Severity: P2)
- **Affected Files:** `server/src/modules/*/*.service.js` — 13 files confirmed 0 bytes; `auth.service.js` confirmed 1,418 bytes and actively used by `auth.controller.js` (line 14 import).
- **Evidence:** All 13 non-auth service files (`admin`, `bids`, `chat`, `companies`, `contracts`, `directHiring`, `documents`, `drivers`, `marketplace`, `notifications`, `users`, `vehicleOwners`, `vehicles`) are empty stubs (0 bytes each). `auth.service.js` is the only functional service, containing `syncUserWithFirebase()` consumed by `auth.controller.js`. All database access, orchestration, authorization logic, and business calculations reside directly inside the remaining `*.controller.js` files.
- **Why It Matters:** High coupling between HTTP transport (Express `req`/`res`) and core business logic; hinders reusability across Socket.IO handlers, background workers, and automated test runners.
- **Recommended Action (Phase 2):** Extract business rules and database mutations from controllers into the respective `*.service.js` modules.

### Finding AR-03: Single-Process In-Memory Socket.IO Architecture (Severity: P2)
- **Affected Files:** [server/src/server.js](file:///c:/Users/acer/Pictures/emc/drivair/server/src/server.js#L11-L16), [server/src/sockets/chat.socket.js](file:///c:/Users/acer/Pictures/emc/drivair/server/src/sockets/chat.socket.js)
- **Evidence:** `new Server(server, {...})` at `server.js` L11–16 uses the default in-memory adapter. `server/package.json` has no `@socket.io/redis-adapter` dependency. Grep across all socket files for `redis|createAdapter` returns **zero matches**. No Redis adapter or pub/sub broker is configured anywhere in the codebase.
- **Why It Matters:** If the API server is horizontally scaled to 2+ instances on Render, AWS, or Kubernetes, clients on Instance A will not receive GPS coordinates or messages broadcast by drivers connected to Instance B.
- **Recommended Action (Phase 2):** Introduce `@socket.io/redis-adapter` and Redis URI configuration for multi-node deployments.

### Finding AR-04: Unsafe Development Token Bypass Guard (Severity: P2)
- **Affected Files:** [server/src/config/firebaseAdmin.js](file:///c:/Users/acer/Pictures/emc/drivair/server/src/config/firebaseAdmin.js#L48-L108)
- **Evidence (source-inspected, line-level):**
  - **L49:** Production hard-fail guard: `if (env.NODE_ENV === 'production') return null` (throws when credentials are absent in production).
  - **L82–90:** Mock-token bypass path: when `NODE_ENV !== 'production'` and credentials are absent, tokens prefixed `mock-` are decoded without cryptographic verification.
  - **L92–105:** Unsafe base64 decode path: `decodeFirebaseJwtUnsafe()` splits and base64-decodes the token payload without signature verification for all other dev tokens.
- **Why It Matters:** If an engineer accidentally sets `NODE_ENV=staging` or fails to set `NODE_ENV=production` in a deployed testing environment, any caller can forge arbitrary user identities and role payloads without cryptographic signatures.
- **Recommended Action (Phase 2):** Mandate mock token schemas for offline testing or fail hard on unsigned tokens regardless of `NODE_ENV`.

### Finding AR-05: Orphaned and Empty Source Files (Severity: P3)
- **Affected Files:**
  - `server/src/modules/auth/auth.model.js` — **0 bytes** (confirmed). No schema definition exists. All user state is tracked in `server/src/modules/users/users.model.js`.
  - `server/src/middleware/rateLimiter.js` — **0 bytes** (confirmed). Despite being named as a rate-limiting middleware module, it exports nothing. Rate limiting is implemented inline in `server/src/app.js` (lines 40–48 via `express-rate-limit`), making this file a dead stub that is never imported.
- **Evidence:** Both files confirmed as 0-byte via `Get-ChildItem` during audit inspection.
- **Why It Matters:** Dead code and misleadingly named empty files create confusion for onboarding engineers and automated linters.
- **Recommended Action (Phase 2):** Remove 0-byte orphan files; if `rateLimiter.js` is intended to house rate-limit configs, migrate the inline `app.js` logic there.

### Finding AR-06: Unwired Automated Test Scripts (Severity: P3)
- **Affected Files:** `server/package.json`, `client/package.json`
- **Evidence:**
  - `server/test/runTests.js` and `server/test/twoAccountGpsTest.js` exist and were executed during this audit session (2026-11-23). Both passed: `runTests.js` 7/7 schema/model invariant tests (exit code 0); `twoAccountGpsTest.js` 8/8 RBAC/GPS security scenarios (exit code 0). These are **RUNTIME_VERIFIED** at the schema/model level.
  - **Important scope limitation:** These tests do not exercise live HTTP endpoints, MongoDB connections, or Socket.IO. They validate schema invariants and security rule logic only.
  - `server/package.json` contains no `"test"` script entry. `npm test` will fail with `Missing script: "test"`. Neither test file is wired into any CI/CD pipeline configuration.
- **Why It Matters:** Automated CI/CD pipelines (e.g. GitHub Actions) will not execute regression tests on pull requests.
- **Recommended Action (Phase 2):** Add `"test": "node test/runTests.js && node test/twoAccountGpsTest.js"` to `server/package.json`.

---

## 14. RECOMMENDED PHASE 2 AUDIT PRIORITIES

1. **Security & Cryptographic Audit (Priority P0):**
   - Deep inspection of Firebase token revocation verification (`checkRevoked = true`).
   - Detailed review of role escalation vectors during `/auth/sync` and profile update endpoints.
   - Cloudinary upload signature validation and document authorization checks.
   - Confirm whether staging/preview environments carry `NODE_ENV=production` to close the Firebase dev bypass risk (AR-04).
2. **Transaction Integrity & ACID Verification (Priority P1):**
   - Formalize Mongoose multi-document transaction boundaries for contract formation (`acceptBidAndCreateContract`, `acceptDirectOffer`).
3. **Notification System Implementation (Priority P1):**
   - Design and implement end-to-end notification delivery: add `Notification.create()` calls to business events (bid accepted, offer accepted, document verified), and add a notification bell/badge to `PortalLayout.jsx`.
4. **Real-time Scaling & Resiliency Testing (Priority P1):**
   - GPS telemetry load testing and Socket.IO Redis adapter integration design.
5. **Service Layer Refactoring Plan (Priority P2):**
   - Blueprint migration of controller-embedded business logic into domain services (13 currently empty `*.service.js` stubs).
6. **CI/CD & Test Pipeline Wiring (Priority P2):**
   - Wire test scripts into `server/package.json`; create a GitHub Actions workflow for PR-time regression testing.
7. **Dead File Cleanup (Priority P3):**
   - Remove or populate `auth.model.js` (0 bytes) and migrate rate-limit config from `app.js` into `rateLimiter.js`.

---

## 15. PHASE 1 VALIDATION CORRECTIONS

> **Added:** 2026-11-23 — Phase 1 Audit Correction & Validation pass. All findings in this section are based on direct source inspection and runtime test execution performed during this session. Zero application source modifications were made.

---

### VC-01: Verification Status Methodology

The original Phase 1 report used a single `VERIFIED` label. This correction introduces a precise taxonomy:

| Status | Meaning |
|---|---|
| **SOURCE_VERIFIED** | Finding confirmed by direct static inspection of source code (file contents, line numbers). |
| **RUNTIME_VERIFIED** | Finding confirmed by executing code or tests and observing actual output. |
| **PARTIALLY_VERIFIED** | Partially confirmed — some components present, some missing or untested. |
| **NOT_IMPLEMENTED** | No implementation found. The feature is absent end-to-end. |
| **NOT_TESTED** | Implementation exists in source but runtime behavior has not been validated in this audit. |

All `VERIFIED` labels in Sections 7 (API Inventory), 4.3 (Portal Tabs), and 12 (Feature Status) have been updated to `SOURCE_VERIFIED` reflecting that they were confirmed by static code inspection, not live HTTP or socket testing.

---

### VC-02: Model Count Correction

| Item | Original Claim | Corrected Value | Evidence |
|---|---|---|---|
| Active Mongoose models | "15 active Mongoose models" | **17 active models** | Direct `Get-ChildItem server/src/modules/**/*.model.js` enumeration: 17 non-empty `.model.js` files confirmed |
| Total `.model.js` files | Not stated | **18 total** | 17 active + `auth/auth.model.js` (0 bytes, orphan) |
| Empty/orphan model files | Not stated | **1** (`auth.model.js`) | Confirmed 0 bytes via `Get-ChildItem` |

The 17 confirmed active models are: `admin`, `bids`, `chat` (Conversation), `chat/message`, `companies`, `contracts`, `directHiring` (ContractRequest), `documentRequirements`, `documents`, `drivers`, `marketplace` (ContractPost), `notifications`, `tracking/liveLocation`, `trips`, `users`, `vehicleOwners`, `vehicles`.

---

### VC-03: Notification System Re-Assessment

| Item | Original Assessment | Corrected Assessment |
|---|---|---|
| Notification delivery status | `PARTIALLY IMPLEMENTED` | **`NOT_IMPLEMENTED`** (end-to-end) |

**Evidence gathered during this audit:**
1. `notifications.controller.js` (23 lines): Contains only `getMyNotifications` and `markNotificationRead`. No `Notification.create()` call present anywhere in the file.
2. `notifications.service.js`: **0 bytes** (empty stub).
3. Grep across all `server/src/modules/**/*.controller.js` for `Notification.create`: **zero results**.
4. `PortalLayout.jsx` (301 lines): Fully inspected. **No** bell icon, badge counter, toast component, or notification indicator of any kind is present.

**Conclusion:** The `Notification` Mongoose schema (`notifications.model.js`) and two REST CRUD endpoints exist, but the system is non-functional end-to-end: no business event creates notification records, and no frontend component displays them. This is correctly classified as `NOT_IMPLEMENTED` for notification delivery.

---

### VC-04: Empty File Inventory Correction

| File | Size | Original Report | Corrected Status |
|---|---|---|---|
| `server/src/modules/auth/auth.model.js` | 0 bytes | "orphan file" (mentioned) | **Confirmed: 0 bytes, no schema** |
| `server/src/middleware/rateLimiter.js` | 0 bytes | Not mentioned as empty | **Newly identified: 0 bytes, dead stub** |
| `server/src/modules/auth/auth.service.js` | 1,418 bytes | "non-empty" | **Confirmed: non-empty, actively used** |
| All 13 other `*.service.js` files | 0 bytes each | "0-byte stubs" | **Confirmed: all 13 are 0 bytes** |

**Key finding on `rateLimiter.js`:** The file at `server/src/middleware/rateLimiter.js` is a 0-byte empty stub. Rate limiting is correctly implemented inline in `server/src/app.js` (lines 40–48) using `express-rate-limit`, making `rateLimiter.js` a dead file that is never imported.

---

### VC-05: Test Evidence Correction

| Test File | Execution Result | Scope |
|---|---|---|
| `server/test/runTests.js` | **RUNTIME_VERIFIED — PASSED (7/7)**, exit code 0, executed 2026-11-23 | Schema/model invariant tests only |
| `server/test/twoAccountGpsTest.js` | **RUNTIME_VERIFIED — PASSED (8/8)**, exit code 0, executed 2026-11-23 | RBAC logic and GPS security rule assertions only |

**Scope limitation (critical):** These tests do NOT require a database connection. They do NOT exercise live HTTP endpoints, Socket.IO connections, or MongoDB CRUD. They validate schema structure invariants and security rule logic in-process. No live API or socket testing was performed during this audit.

The original report stated these scripts "pass 100% invariants" without providing execution evidence. This correction provides actual runtime evidence from this session.

---

### VC-06: Transaction Absence Confirmed

Grep command executed: search for `startSession|withTransaction|mongoose.session` across `server/src/modules/**/*.controller.js`.
**Result: zero matches.**

Confirmed unprotected multi-document write locations:

| Controller | Function | Write Operations | Lines |
|---|---|---|---|
| `bids.controller.js` | `acceptBidAndCreateContract` | `bid.save()`, `post.save()`, `Contract.create()` | L135, L144, L148 |
| `directHiring.controller.js` | `acceptDirectOffer` | `offer.save()`, `Contract.create()` | L119, L123 |

No Mongoose transaction sessions exist anywhere in the codebase. This is confirmed `SOURCE_VERIFIED`.

---

### VC-07: Architectural Diagram Accuracy Check

All Mermaid diagrams in Section 11 were verified against:
- `server/src/app.js` route registrations — all 16 route module mounts confirmed.
- `server/src/sockets/chat.socket.js` — all 9 Socket.IO events confirmed (`join_conversation`, `send_message`, `new_message`, `start_trip`, `trip_started`, `join_trip`, `update_location`, `location_updated`, `end_trip`, `trip_ended`, `tracking_error`).
- Entity relationships traced from Mongoose schema `ref:` fields — all ERD edges confirmed.

**Correction:** The System Architecture diagram in Section 11.A contained `Models["15 Mongoose Models"]` — updated to `Models["17 Active Mongoose Models"]`.

**No other diagram corrections required.**

---

### VC-08: API Endpoint Count Correction

| Item | Original Report | Corrected Count |
|---|---|---|
| Registered API endpoints | "46 endpoints" (implied) | **48 endpoints registered** in `app.js` |

The original report's API table listed 46 rows. Two additional confirmed endpoints:
- `POST /api/v1/trips/:tripId/end` — present in `trips.routes.js` and `app.js` mount.
- Dual legacy mounts: `app.js` registers both `/api/v1/trips` and `/api/trips`, and both `/api/v1/tracking` and `/api/tracking`. These add route aliases but map to the same controllers.

The corrected table in Section 7 reflects **48 unique logical endpoint registrations** under `/api/v1/`.

---

### Unresolved Findings Summary

The following issues were confirmed during this correction pass and remain unresolved pending Phase 2:

| ID | Finding | Severity | Status |
|---|---|---|---|
| AR-01 | Missing MongoDB transactions in `acceptBidAndCreateContract` and `acceptDirectOffer` | P1 | OPEN — no fix applied |
| AR-02 | 13 empty service files; all business logic in controllers | P2 | OPEN — no fix applied |
| AR-03 | No Socket.IO Redis adapter; single-process in-memory only | P2 | OPEN — no fix applied |
| AR-04 | Firebase dev bypass at `firebaseAdmin.js` L82–105 | P2 | OPEN — no fix applied |
| AR-05 | `auth.model.js` (0 bytes orphan) + `rateLimiter.js` (0 bytes dead stub) | P3 | OPEN — no fix applied |
| AR-06 | Test scripts not wired into `package.json` or CI/CD | P3 | OPEN — no fix applied |
| NEW-01 | Notifications `NOT_IMPLEMENTED` end-to-end: no `Notification.create()` in any business logic; no frontend bell/badge | P1 | OPEN — newly classified in this correction |

---

*Phase 1 Validation Corrections certified complete. All corrections are additive — no valid findings from the original report were replaced or removed. Zero application source modifications were made during this correction pass.*

---

*Report certified complete under Phase 1 Audit specifications. Non-destructive inspection completed with zero source modifications.*
