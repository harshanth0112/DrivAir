# DRIVAIR — PHASE 5 PRODUCTION DEPLOYMENT GUIDE
## Operational Runbook, Cloud Hosting & Reliability Engineering

**Project:** DRIVAIR  
**Phase:** 5  
**Version:** 1.0.0  
**Status:** STAGING PENDING  

---

## 1. Architecture Overview

DRIVAIR uses a decoupled full-stack architecture:
- **Frontend:** Single Page Application (SPA) built with React 19, Vite, Tailwind CSS, Lucide icons, and Leaflet for maps.
- **Backend:** Node.js Express service serving RESTful JSON APIs and a WebSocket server powered by Socket.IO for real-time tracking and notifications.
- **Database:** MongoDB (utilizing Mongoose ODM) with schemas, compound indexes, and unique partial constraints for tenders, bids, contracts, trips, and location logs.
- **External Services:**
  - **Firebase Admin & Auth:** Identity provider and authentication token verification.
  - **Cloudinary:** Encrypted cloud storage for uploaded driver licenses, identity documents, and vehicle registration papers.

---

## 2. Environment Configuration Matrix

| Variable | Environment | Required | Description |
|---|---|---|---|
| `PORT` | All | Yes | HTTP listening port (defaults to 5000 in dev; assigned by PaaS in prod). |
| `NODE_ENV` | All | Yes | Runtime mode: `development`, `staging`, or `production`. |
| `CLIENT_URL` | All | Yes | Permitted CORS origin URL(s), comma-separated in production (e.g., `https://drivair.onrender.com`). |
| `MONGODB_URI` | All | Yes | MongoDB connection string. Must use standard replica set or Atlas SRV string in production. |
| `FIREBASE_PROJECT_ID` | Production | Yes | Google Cloud / Firebase project identifier. |
| `FIREBASE_CLIENT_EMAIL` | Production | Yes | Firebase service account client email. |
| `FIREBASE_PRIVATE_KEY` | Production | Yes | PEM-encoded RSA private key for server-side token validation. |
| `CLOUDINARY_CLOUD_NAME` | Production | Optional | Cloudinary cloud account name for file uploads. |
| `CLOUDINARY_API_KEY` | Production | Optional | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Production | Optional | Cloudinary API Secret. |
| `VITE_API_URL` | Client | Yes | Base URL for backend REST API (e.g. `https://drivair-api.onrender.com/api/v1`). |
| `VITE_SOCKET_URL` | Client | Yes | WebSocket URL for Socket.IO (e.g. `https://drivair-api.onrender.com`). |

---

## 3. Deployment Environments & Hosting Setup

### 3.1. Local Development
1. Ensure Node.js 20+ or 24+ and MongoDB are running locally.
2. In `server/`: Copy `.env.example` to `.env` and set `MONGODB_URI=mongodb://localhost:27017/drivair`.
3. In `client/`: Copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:5000/api/v1` and `VITE_SOCKET_URL=http://localhost:5000`.
4. Start backend: `npm run dev` in `server/`.
5. Start frontend: `npm run dev` in `client/`.

### 3.2. Staging / Production on Render (Free-Tier Compatible)
DRIVAIR includes a native `render.yaml` specification located in the repository root.

#### Step 1: Render Infrastructure Setup
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints** -> **New Blueprint Instance**.
3. Connect your GitHub repository containing the DRIVAIR project.
4. Render detects `render.yaml` and provisions two services:
   - **`drivair-api`** (Web Service): Node environment, builds with `npm install` and starts with `node src/server.js` in `server/`.
   - **`drivair-client`** (Static Site): Builds with `npm install && npm run build` in `client/`, publishes `client/dist`.

#### Step 2: Environment Variable Population
In Render Web Service settings for `drivair-api`:
- `NODE_ENV`: `production`
- `CLIENT_URL`: `https://drivair-client.onrender.com` (use actual Render static site URL)
- `MONGODB_URI`: Primary Atlas connection string.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: From Firebase service account JSON.

In Render Static Site settings for `drivair-client`:
- `VITE_API_URL`: `https://drivair-api.onrender.com/api/v1`
- `VITE_SOCKET_URL`: `https://drivair-api.onrender.com`

---

## 4. Docker & Container Deployment

### 4.1. Server Docker Container (`server/Dockerfile`)
- Base image: `node:24-alpine`
- Multi-stage build isolates dependencies and runs under the unprivileged `node` user (`USER node`).
- Health check: Probes `GET http://localhost:5000/api/v1/health` every 30s.
- Build command:
  ```bash
  docker build -t drivair-api:latest -f server/Dockerfile server
  ```
- Run command:
  ```bash
  docker run -d -p 5000:5000 --env-file server/.env drivair-api:latest
  ```

### 4.2. Client Docker Container (`client/Dockerfile`)
- Multi-stage build: Compiles React app using `node:24-alpine` and serves static files using `nginx:1.27-alpine`.
- Configures Nginx with SPA routing fallback (`try_files $uri $uri/ /index.html;`) and cache control headers.
- Build command:
  ```bash
  docker build -t drivair-client:latest -f client/Dockerfile client
  ```
- Run command:
  ```bash
  docker run -d -p 80:80 drivair-client:latest
  ```

---

## 5. Database Provisioning & Management (MongoDB Atlas)

### 5.1. Cluster Tiering & Sizing
- **Development/PoC:** M0 Free Tier (Shared RAM, 512MB storage).
- **Production Recommended:** M10+ dedicated cluster (2GB RAM, 10GB storage, 3-node replica set). Dedicated clusters support multi-document ACID transactions, continuous backups, and predictable IOPS.

### 5.2. Network Security & Peering
- Go to **Network Access** in MongoDB Atlas.
- Add Render egress IP addresses (or allow access from anywhere `0.0.0.0/0` strictly with strong password authentication if Render static IPs are unavailable on free tier).
- Require TLS 1.3 encryption.

### 5.3. Required Production Indexes
- `Contract`: Unique index on `sourceBidId` with `partialFilterExpression: { sourceBidId: { $type: "objectId" } }`.
- `Contract`: Unique index on `sourceRequestId` with `partialFilterExpression: { sourceRequestId: { $type: "objectId" } }`.
- `Trip`: Partial unique index on `{ contractId: 1 }` with `partialFilterExpression: { status: "active" }`.
- `Bid`: Compound unique index on `{ contractPostId: 1, bidderId: 1 }`.
- `LiveLocation`: Compound index on `{ tripId: 1, timestamp: -1 }`.

---

## 6. Backup, Disaster Recovery & High Availability

### 6.1. Recovery Objectives
- **RPO (Recovery Point Objective):** < 1 hour for critical financial and contract state; < 24 hours for audit trails.
- **RTO (Recovery Time Objective):** < 30 minutes to restore API availability from secondary replica set or snapshot.

### 6.2. Atlas Automated Snapshot Policy
- Enable Continuous Cloud Backups in Atlas with a 7-day retention policy.
- Automated daily snapshots stored in multi-region cloud buckets.

### 6.3. Manual Backup & Restore Procedures
- **Backup command:**
  ```bash
  mongodump --uri="<MONGODB_URI>" --gzip --archive=/backups/drivair-backup-$(date +%F).gz
  ```
- **Restore command:**
  ```bash
  mongorestore --uri="<TARGET_MONGODB_URI>" --gzip --archive=/backups/drivair-backup-<DATE>.gz --drop
  ```

---

## 7. Observability, Health Checks & Monitoring

### 7.1. Health Check Endpoint
- **URL:** `GET /api/v1/health`
- **Response Format:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-23T07:44:00.000Z",
    "uptimeSeconds": 1420.5,
    "database": {
      "status": "connected",
      "readyState": 1
    },
    "memory": {
      "rssMb": 64.2,
      "heapUsedMb": 38.5,
      "heapTotalMb": 51.2
    }
  }
  ```
- In production, if database connectivity is lost (`readyState !== 1`), the endpoint immediately returns HTTP 503 `status: "degraded"` or `"unhealthy"`, causing PaaS load balancers to cease traffic routing to the unhealthy instance.

---

## 8. Horizontal Scaling & Sockets

1. **Current State:** Single-instance Socket.IO in-process adapter. Suitable for single-instance Web Service deployments.
2. **Horizontal Scaling Requirement:**
   - If scaling `drivair-api` to multiple instances behind a load balancer, sticky sessions (session affinity) and `@socket.io/redis-adapter` must be enabled with an active Redis instance (e.g., Upstash or Redis Cloud) to broadcast events across nodes.
