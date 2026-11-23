# DRIVAIR API Documentation

All endpoints are prefixed with `/api/v1`. Protected routes require a Bearer token in the `Authorization` header: `Authorization: Bearer <firebase_id_token>`.

---

## 1. System Health
- **`GET /health`**
  - Public
  - Returns backend operational status and environment.

---

## 2. Authentication & User Sync
- **`POST /auth/sync`**
  - Body: `{ role?: "company" | "driver" | "vehicleOwner", fullName?: string, phone?: string, profileImage?: string }`
  - Verifies Firebase ID token and provisions/synchronizes MongoDB user account.
- **`GET /users/me`**
  - Returns current user record, permissions, and status.
- **`PATCH /users/me`**
  - Updates profile fields (`fullName`, `phone`, `profileImage`).
- **`GET /users/:id/public-profile`**
  - Returns public-safe provider information.

---

## 3. Profiles & Fleets
- **`GET /companies/me`** / **`PUT /companies/me`** (Company)
- **`GET /drivers/me`** / **`PUT /drivers/me`** (Driver)
- **`GET /vehicle-owners/me`** / **`PUT /vehicle-owners/me`** (Vehicle Owner)
- **`POST /vehicles`** (Vehicle Owner)
- **`GET /vehicles/mine`** (Vehicle Owner)
- **`PATCH /vehicles/:id`** / **`DELETE /vehicles/:id`** (Vehicle Owner)
- **`GET /vehicles/search`** (Company / Admin)

---

## 4. Compliance Documents & Verification
- **`POST /documents/upload`** (All users)
  - Records uploaded document metadata referencing secure private storage.
- **`GET /documents/mine`** (All users)
- **`GET /documents/:id/access`** (Owner or Admin)
- **`GET /documents/admin/queue`** (Admin only)
- **`PATCH /documents/admin/:id/verify`** (Admin only)
  - Body: `{ status: "verified" | "rejected" | "resubmissionRequired", rejectionReason?: string }`

---

## 5. Contract Marketplace & Bidding
- **`POST /contract-posts`** (Company)
- **`POST /contract-posts/:id/publish`** (Company)
- **`POST /contract-posts/:id/close`** (Company)
- **`GET /contract-posts`** (Open marketplace feed)
- **`GET /contract-posts/mine`** (Company's posts)
- **`POST /contract-posts/:id/bids`** (Driver / Vehicle Owner)
- **`GET /contract-posts/:id/bids`** (Owning Company)
- **`GET /bids/mine`** (Provider)
- **`POST /bids/:id/accept`** (Owning Company)
  - Atomically accepts bid, updates post award status, and creates canonical `Contract`.

---

## 6. Direct Hiring
- **`GET /direct-hiring/providers/search`** (Company)
- **`POST /direct-hiring/offers`** (Company)
- **`GET /direct-hiring/offers/sent`** (Company)
- **`GET /direct-hiring/offers/received`** (Provider)
- **`POST /direct-hiring/offers/:id/accept`** (Provider)
  - Accepts direct offer and creates canonical `Contract`.
- **`POST /direct-hiring/offers/:id/reject`** (Provider)
- **`POST /direct-hiring/offers/:id/counter`** (Provider or Company)

---

## 7. Real-Time Chat & Messaging
- **`POST /chat/conversations`**
- **`GET /chat/conversations`**
- **`GET /chat/conversations/:id/messages`**
- **`POST /chat/conversations/:id/messages`**
- **Socket.IO Events**:
  - `join_conversation` (`{ conversationId }`)
  - `send_message` (`{ conversationId, messageText }`)
  - `new_message` (broadcast to room)

---

## 8. Contracts & Admin Moderation
- **`GET /contracts/mine`**
- **`GET /contracts/:id`**
- **`PATCH /contracts/:id/status`**
- **`GET /admin/users`**
- **`PATCH /admin/users/:id/status`**
- **`GET /admin/audit-logs`**
