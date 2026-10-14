"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AdminSession {
  uid: string;
  email: string | null;
  displayName: string;
  role: "admin";
  authType: "firebase" | "passkey";
  authenticatedAt: string;
}

interface AuthContextType {
  user: AdminSession | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPasskey: (pin: string, operator?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithEmail: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  loginWithPasskey: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  logout: async () => {},
});

const STORAGE_KEY = "cees_admin_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Sinkronisasi sesi saat reload halaman
  useEffect(() => {
    let unsubFirebase: (() => void) | null = null;

    // Cek apakah ada sesi Passkey lokal yang masih aktif
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const expires = parsed.expiresAt ? new Date(parsed.expiresAt).getTime() : 0;
        if (Date.now() < expires) {
          setUser(parsed);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.warn("Gagal membaca cache sesi lokal:", err);
    }

    // Cek sesi Firebase Auth
    if (auth) {
      unsubFirebase = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const session: AdminSession = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Admin Operator",
            role: "admin",
            authType: "firebase",
            authenticatedAt: new Date().toISOString(),
          };
          setUser(session);
        } else {
          // Hanya null-kan jika bukan passkey session
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) {
            setUser(null);
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubFirebase) unsubFirebase();
    };
  }, []);

  // 2. Login via Email & Password (Firebase)
  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      return {
        success: false,
        error: "Firebase Auth belum terhubung. Silakan gunakan opsi Passkey Administrator.",
      };
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const session: AdminSession = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "Admin Operator",
        role: "admin",
        authType: "firebase",
        authenticatedAt: new Date().toISOString(),
      };
      setUser(session);
      localStorage.removeItem(STORAGE_KEY);
      return { success: true };
    } catch (err: any) {
      let message = "Gagal login dengan email & password.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        message = "Email atau kata sandi tidak cocok.";
      } else if (err.code === "auth/user-not-found") {
        message = "Akun admin tidak terdaftar.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.";
      }
      return { success: false, error: message };
    }
  };

  // 3. Login via Passkey Admin (cees2026 / Master PIN)
  const loginWithPasskey = async (pin: string, operator?: string) => {
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: pin, operator }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Passkey salah." };
      }

      const session: AdminSession = {
        uid: "passkey-admin",
        email: null,
        displayName: data.user.displayName,
        role: "admin",
        authType: "passkey",
        authenticatedAt: data.user.authenticatedAt,
      };

      setUser(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Gagal menghubungkan ke server otentikasi." };
    }
  };

  // 4. Logout
  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        loginWithPasskey,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
