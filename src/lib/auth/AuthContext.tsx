'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbResetEmail,
} from '@/lib/firebase/client';
import { User as FirebaseUser, onAuthStateChanged, updateProfile } from 'firebase/auth';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemoUser: () => void;
  syncUserWithDatabase: (u: AuthUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile to MongoDB
  const syncUserWithDatabase = async (authUser: AuthUser) => {
    try {
      const currentToken = token || (authUser.isDemo ? `demo-${authUser.uid}` : '');
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
          'x-demo-user-id': authUser.uid,
          'x-demo-user-email': authUser.email || '',
        },
        body: JSON.stringify({
          firebaseUid: authUser.uid,
          fullName: authUser.displayName || authUser.email?.split('@')[0] || 'Vehicle Owner',
          email: authUser.email,
          avatar: authUser.photoURL,
        }),
      });
    } catch (err) {
      console.warn('User sync to MongoDB failed (may be offline/in-memory):', err);
    }
  };

  useEffect(() => {
    // Check if demo user was saved in localStorage
    const savedDemo = localStorage.getItem('motocare_demo_user');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setToken(`demo-${parsed.uid}`);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('motocare_demo_user');
      }
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const idToken = await fbUser.getIdToken();
          const mappedUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
          };
          setUser(mappedUser);
          setToken(idToken);
          syncUserWithDatabase(mappedUser);
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase auth initialization note:', e);
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const idToken = await res.user.getIdToken();
      const mapped: AuthUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
      };
      setUser(mapped);
      setToken(idToken);
      await syncUserWithDatabase(mapped);
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await res.user.getIdToken();
    const mapped: AuthUser = {
      uid: res.user.uid,
      email: res.user.email,
      displayName: res.user.displayName,
      photoURL: res.user.photoURL,
    };
    setUser(mapped);
    setToken(idToken);
    await syncUserWithDatabase(mapped);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
    }
    const idToken = await res.user.getIdToken();
    const mapped: AuthUser = {
      uid: res.user.uid,
      email: res.user.email,
      displayName: name,
      photoURL: null,
    };
    setUser(mapped);
    setToken(idToken);
    await syncUserWithDatabase(mapped);
  };

  const logout = async () => {
    localStorage.removeItem('motocare_demo_user');
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
  };

  const resetPassword = async (email: string) => {
    await fbResetEmail(auth, email);
  };

  const loginAsDemoUser = () => {
    const demoUser: AuthUser = {
      uid: 'demo_user_pilot',
      email: 'sajjad.pilot@motocare.app',
      displayName: 'Sajjad Hossain',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isDemo: true,
    };
    localStorage.setItem('motocare_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setToken('demo-demo_user_pilot');
    syncUserWithDatabase(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        resetPassword,
        loginAsDemoUser,
        syncUserWithDatabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
