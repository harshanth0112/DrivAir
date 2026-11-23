import admin from 'firebase-admin';
import { env } from './env.js';

let firebaseApp = null;
let initAttempted = false;

export const getFirebaseAdmin = () => {
  if (firebaseApp) return firebaseApp;
  if (initAttempted) return null;
  initAttempted = true;

  const hasFullCredentials =
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY &&
    env.FIREBASE_CLIENT_EMAIL.includes('@') &&
    env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY');

  if (hasFullCredentials) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
      console.log('[Firebase Admin] ✅ Cryptographically initialized with certified Service Account.');
    } catch (error) {
      console.error(`[Firebase Admin Error] Initialization failed: ${error.message}`);
    }
  } else {
    if (env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: Production mode requires verified Firebase Service Account credentials. Unsafe bypasses are disabled.'
      );
    }
    console.warn('[Firebase Admin] ⚠️  Development mode active without service account credentials.');
  }

  return firebaseApp;
};

/**
 * Dev-only fallback token decoder.
 * Strictly disabled in production.
 */
const decodeFirebaseJwtUnsafe = (token) => {
  if (env.NODE_ENV === 'production') {
    return null;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Verifies Firebase ID token.
 * In production: strictly enforces cryptographic verification, expiration check, and revocation verification.
 */
export const verifyIdToken = async (token) => {
  const app = getFirebaseAdmin();

  // 1. Production Path: Strict Cryptographic Verification via Firebase Admin SDK
  if (app) {
    // verifyIdToken(token, checkRevoked = true)
    return await admin.auth().verifyIdToken(token, true);
  }

  // 2. Strict Production Guard: If in production and Admin SDK is not initialized, REJECT
  if (env.NODE_ENV === 'production') {
    throw new Error('Authentication rejected: Firebase Admin SDK cryptographic verification is mandatory in production.');
  }

  // 3. Development Mode Only: Mock tokens for automated test suites
  if (env.NODE_ENV === 'development' && token.startsWith('mock-token-')) {
    const role = token.replace('mock-token-', '') || 'driver';
    return {
      uid: `mock-uid-${role}`,
      email: `${role}@drivair.local`,
      email_verified: true,
      name: `Test ${role.toUpperCase()}`,
    };
  }

  // 4. Development Mode Only: Unsafe decode fallback with explicit warning
  if (env.NODE_ENV === 'development') {
    const payload = decodeFirebaseJwtUnsafe(token);
    if (payload && payload.sub) {
      console.warn('[Firebase Admin Security Warning] DEV ONLY: Token accepted without cryptographic signature check.');
      return {
        uid: payload.sub,
        email: payload.email || '',
        email_verified: payload.email_verified ?? false,
        name: payload.name || '',
        picture: payload.picture || '',
      };
    }
  }

  throw new Error('Authentication failed: Invalid or unverifiable authentication token.');
};
