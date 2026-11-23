# DRIVAIR Security & Access Control

---

## 1. Authentication & Session Security
- **Firebase Token Verification**: Every protected API route enforces token verification via Firebase Admin SDK.
- **Account Status Guard**: Accounts marked `suspended` or `blocked` are denied access by the authentication middleware.
- **Role Isolation**:
  - `company`: Can only modify own posts, view received bids, send direct offers, and view their contracts.
  - `driver` / `vehicleOwner`: Can only view open posts, bid on open requirements, respond to direct offers addressed to them, and access their own fleet and documents.
  - `admin`: Provisioned securely; client registration prevents selecting `admin`.

---

## 2. Marketplace & Transaction Integrity
- **Single Contract Award Rule**: Bids and direct offers can only be accepted once, atomically generating one canonical contract.
- **Capacity Limits**: Posts cannot award more bids than the configured quantity of drivers/vehicles.
- **Private Data Protection**: License numbers and document IDs are masked or excluded from default queries (`select: false`).

---

## 3. Real-Time Chat Security
- **Socket Handshake Auth**: Socket connections must supply valid Firebase tokens.
- **Room Joining**: Only confirmed conversation participants can join room `conversation_<id>`.
- **Eavesdropping Prevention**: Socket and REST endpoints enforce participant validation before reading or writing messages.

---

## 4. Audit & Operational Safety
- **Audit Logging**: Any user status modification by an administrator is logged with timestamp, actor ID, and IP address into `AuditLog`.
- **Headers & Rate Limiting**: Helmet security headers and express-rate-limiters protect all routes against abuse.
