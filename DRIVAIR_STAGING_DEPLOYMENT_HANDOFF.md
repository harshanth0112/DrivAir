# DRIVAIR — STAGING DEPLOYMENT HANDOFF MANUAL
**Target:** Staging Deployment to GitHub & Render  
**Phase:** 6.11 Staging Deployment Handoff  
**Application Architecture:** Node.js Express Backend (`drivair-api`) + Vite React SPA Frontend (`drivair-client`) + MongoDB Atlas Replica Set + Firebase Auth + Cloudinary  

---

## 1. Executive Summary & Security Guardrails

This handoff document provides the complete, authoritative operational runbook for transitioning DRIVAIR from local development to a verified staging environment.

### Critical Security Policies:
- **No Secret Commits:** Never add or commit `.env` or credential files to source control.
- **Strict Role Separation:** Frontend environment variables (`VITE_*`) are bundled into client JavaScript. Never put Firebase Admin Private Keys, database credentials, or Cloudinary API Secrets into frontend variables.
- **Production Mode Invariants:** `NODE_ENV=production` on the server mandates verified Firebase Service Account credentials; unverified bypasses are rejected at startup.
- **Database Access:** MongoDB Atlas must restrict network access to Render outbound IP addresses or authorized staging CIDR blocks.

---

## 2. Git & GitHub Repository Initialization

### 2.1 Git Readiness Checklist
- `.git` existence: **Currently absent** (clean working directory).
- `.gitignore`: Audited and verified. Strictly ignores:
  - `node_modules/`
  - `.env`, `.env.*`, `client/.env`, `server/.env` (preserves only `.env.example`)
  - `serviceAccountKey.json`, `*.pem`, `*.key`
  - `dist/`, `build/`
  - `*.log`
- Accidental secret scan: **Zero credential files tracked**.

### 2.2 Commands to Initialize & Push (User to Execute)

Run these commands from the root directory (`c:\Users\acer\Pictures\emc\drivair`):

```bash
# 1. Initialize Git repository
git init

# 2. Verify git status ignores .env files and node_modules
git status

# 3. Stage all source files (excluding ignored files)
git add .

# 4. Review staged files to guarantee no secrets are included
git status

# 5. Commit baseline source
git commit -m "feat(drivair): complete implementation and staging infrastructure configuration"

# 6. Set default branch to main
git branch -M main

# 7. Add your GitHub remote repository
git remote add origin https://github.com/<YOUR_GITHUB_ORGANIZATION_OR_USERNAME>/drivair.git

# 8. Push to GitHub
git push -u origin main
```

---

## 3. GitHub Actions CI Verification

The repository includes a certified GitHub Actions workflow at `.github/workflows/ci.yml`.

### Verification Steps:
1. Navigate to your GitHub repository -> **Actions** tab.
2. Confirm the workflow `DRIVAIR Continuous Integration & Verification` triggers automatically upon push to `main`.
3. Verify both jobs complete successfully:
   - `backend-test`: Installs dependencies (`npm ci`) and runs regression suites (`npm run test:all`).
   - `frontend-build`: Installs dependencies (`npm ci`) and executes the Vite production bundle (`npm run build`).

---

## 4. MongoDB Atlas Staging Configuration

The application requires a MongoDB Atlas replica-set cluster (`mongodb+srv://`) to support multi-document transactions for bid awards.

### 4.1 Cluster & Network Access
1. Log into [cloud.mongodb.com](https://cloud.mongodb.com).
2. Under **Security** -> **Network Access**:
   - Add Render outbound IP addresses or staging NAT gateway IPs.
   - For temporary initial staging bring-up, you may whitelist `0.0.0.0/0` with an expiration timer (e.g., 6 hours).
3. Under **Security** -> **Database Access**:
   - Create a dedicated staging user (e.g., `drivair_staging_user`) with read/write privileges on the `drivair` database.
   - Restrict privileges: Do not grant cluster admin rights.

### 4.2 Connection String
Obtain the replica-set SRV URI:
```text
mongodb+srv://<username>:<password>@<cluster-host>/drivair?retryWrites=true&w=majority
```
*(Store this securely; do not commit).*

---

## 5. Google Firebase Staging Setup

### 5.1 Web Client Configuration (Frontend)
1. Go to [Firebase Console](https://console.firebase.google.com/) -> Select your DRIVAIR staging project.
2. Under **Project settings** -> **General** -> **Your apps** -> Select your Web App.
3. Collect the public client keys:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (Optional)

### 5.2 Service Account Credentials (Backend)
1. In Firebase Console, navigate to **Project settings** -> **Service accounts**.
2. Click **Generate new private key**. Download the JSON file securely.
3. Extract:
   - `FIREBASE_PROJECT_ID` = `project_id`
   - `FIREBASE_CLIENT_EMAIL` = `client_email`
   - `FIREBASE_PRIVATE_KEY` = `private_key` (Format includes `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`).

---

## 6. Cloudinary Staging Setup

1. Log into your [Cloudinary Console](https://cloudinary.com/console).
2. Collect staging credentials from the Dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Verify upload presets and media folder configurations for document KYC verification.

---

## 7. Render Staging Blueprint Deployment

### 7.1 Setup via Render Dashboard
1. Log into [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository (`drivair`).
4. Render will read `render.yaml` from the root and detect:
   - **Service 1:** `drivair-api` (Web Service, Node runtime, rootDir: `server`)
   - **Service 2:** `drivair-client` (Static Site, rootDir: `client`, publishDir: `dist`)

### 7.2 Configure Backend Environment Variables (`drivair-api`)
Under **drivair-api** -> **Environment**:
| Variable Name | Staging Value / Description |
|---|---|
| `NODE_ENV` | `production` (or `staging`) |
| `PORT` | `10000` |
| `CLIENT_URL` | `https://drivair-client.onrender.com` (Your actual frontend Render URL) |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/drivair?retryWrites=true&w=majority` |
| `FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `FIREBASE_CLIENT_EMAIL`| Your Firebase Service Account Email |
| `FIREBASE_PRIVATE_KEY` | Your Firebase Private Key (with newlines formatted as `\n` or multiline) |
| `CLOUDINARY_CLOUD_NAME`| Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY`   | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| Your Cloudinary API Secret |

### 7.3 Configure Frontend Environment Variables (`drivair-client`)
Under **drivair-client** -> **Environment**:
| Variable Name | Staging Value / Description |
|---|---|
| `VITE_API_URL` | `https://drivair-api.onrender.com/api/v1` |
| `VITE_SOCKET_URL` | `https://drivair-api.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Public Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<project-id>.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Public Sender ID |
| `VITE_FIREBASE_APP_ID` | Public Web App ID |

### 7.4 Trigger Deployment
1. Click **Apply** or trigger **Manual Deploy** -> **Clear build cache & deploy**.
2. Wait for `drivair-api` build and health probe to turn healthy.
3. Wait for `drivair-client` static build to deploy.

---

## 8. Post-Deployment Verification Commands

Once Render indicates both services are live, execute these verification commands:

### 8.1 Backend Liveness Probe
```bash
curl -i https://<YOUR_RENDER_API_URL>/api/v1/health
```
**Expected Response:**
- HTTP Status: `200 OK`
- JSON Body:
  ```json
  {
    "status": "ok",
    "service": "DRIVAIR Backend API",
    "database": {
      "status": "connected",
      "connected": true
    }
  }
  ```

### 8.2 Frontend & SPA Routing Verification
```bash
# 1. Test root page
curl -i https://<YOUR_RENDER_CLIENT_URL>/

# 2. Test SPA fallback routing (deep link)
curl -i https://<YOUR_RENDER_CLIENT_URL>/login
curl -i https://<YOUR_RENDER_CLIENT_URL>/marketplace
```
**Expected Response:** HTTP `200 OK` serving `index.html` on all deep paths.

### 8.3 Two-Account Staging Workflow Acceptance
1. Open `https://<YOUR_RENDER_CLIENT_URL>/` in two separate browser profiles (or incognito windows).
2. **Account A (Company):**
   - Log in / Register with Company profile.
   - Create and publish a new contract post.
3. **Account B (Driver):**
   - Log in / Register with Driver profile.
   - Navigate to Marketplace, locate Company A's tender, and submit a bid.
4. **Award & Contract Creation:**
   - Account A receives a live notification and accepts the bid.
   - Verify canonical contract generation.
5. **GPS Trip Execution:**
   - Driver starts the trip.
   - Observe live GPS updates in Company dashboard.
   - Complete trip and verify final state synchronization.

---

## 9. Rollback & Disaster Recovery Procedures

### 9.1 Application Rollback on Render
1. Open Render Dashboard -> `drivair-api` (or `drivair-client`).
2. Navigate to the **Events** or **Deploys** tab.
3. Find the previous successful deployment commit.
4. Click **Rollback** to instantly restore the earlier stable build artifact.

### 9.2 Database Restoration
In the event of accidental data corruption:
1. Use the certified programmatic restore routine:
   ```bash
   cd server
   node test/stage610BackupRestoreDrill.js
   ```
2. Or use MongoDB Atlas automated Point-in-Time Restore (PITR) via Atlas Dashboard -> **Backups** -> **Restore**.
