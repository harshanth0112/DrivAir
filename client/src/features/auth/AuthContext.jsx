import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase.js';
import api from '../../lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Flag to prevent onAuthStateChanged from overwriting user state during loginWithToken
  const isSyncing = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem('drivair_token');
        setUser(null);
        setLoading(false);
        return;
      }

      // Skip the /users/me fetch if loginWithToken is currently running
      // (avoids race: auth state fires, DB user doesn't exist yet, 500 error)
      if (isSyncing.current) {
        setLoading(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken(false);
        localStorage.setItem('drivair_token', token);
        // Silently try to restore session — 404 means not synced yet (new user), that's fine
        const res = await api.get('/users/me');
        setUser(res.data.data.user);
      } catch (err) {
        // 404 = new user not yet in DB; 500 = DB down — both are non-fatal here
        const status = err?.response?.status;
        if (status !== 404 && status !== 500) {
          console.warn('[AuthContext] Could not restore session:', err?.message);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Silent token refresh every 50 minutes (Firebase tokens expire after 1 hour)
    const refreshInterval = setInterval(async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('drivair_token', token);
        } catch (err) {
          console.warn('[AuthContext] Token refresh failed:', err?.message);
        }
      }
    }, 50 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const loginWithToken = async (token, role, profileData = {}) => {
    isSyncing.current = true;
    try {
      localStorage.setItem('drivair_token', token);
      // Strip empty strings so Zod optional fields don't trigger min-length errors
      const body = { role };
      if (profileData.fullName && profileData.fullName.trim().length >= 2) {
        body.fullName = profileData.fullName.trim();
      }
      if (profileData.phone && profileData.phone.trim()) {
        body.phone = profileData.phone.trim();
      }
      const syncRes = await api.post('/auth/sync', body);
      setUser(syncRes.data.data.user);
      return syncRes.data.data.user;
    } finally {
      isSyncing.current = false;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (e) { /* ignore */ }
    localStorage.removeItem('drivair_token');
    setUser(null);
  };

  const refetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data.data.user);
    } catch (err) {
      console.error('refetchUser failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
