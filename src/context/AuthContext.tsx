"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type UserRole = "admin" | "member";

export interface UserSession {
  uid: string;
  memberId?: string;
  email: string | null;
  displayName: string;
  gameNickname?: string;
  division?: string;
  role: UserRole;
  authType: "firebase" | "passkey" | "google" | "nickname" | "credentials";
  avatarUrl?: string;
  verified?: boolean;
  authenticatedAt: string;
}

// Backward-compatible alias
export type AdminSession = UserSession;

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  // Admin Methods
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithPasskey: (pin: string, operator?: string) => Promise<{ success: boolean; error?: string }>;
  setActiveSession: (session: UserSession) => void;
  // Member Methods
  loginMemberWithNickname: (
    identifier: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; needsActivation?: boolean; suggestedNickname?: string }>;
  loginMemberWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  registerMemberAccount: (payload: {
    gameNickname: string;
    whatsapp: string;
    password: string;
    fullName?: string;
    division?: string;
    city?: string;
    email?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setActiveSession: () => {},
  loginWithEmail: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  loginWithGoogle: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  loginWithPasskey: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  loginMemberWithNickname: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  loginMemberWithGoogle: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  registerMemberAccount: async () => ({ success: false, error: "Auth belum diinisialisasi" }),
  logout: async () => {},
});

const STORAGE_KEY = "cees_user_session";
const LEGACY_ADMIN_KEY = "cees_admin_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper untuk sinkronisasi cookie HTTP-Only server admin
  const syncAdminServerCookie = async (sessionData: UserSession) => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: sessionData }),
      });
    } catch (err) {
      console.warn("Gagal sinkronisasi cookie sesi server:", err);
    }
  };

  // 1. Sinkronisasi sesi saat reload halaman
  useEffect(() => {
    let unsubFirebase: (() => void) | null = null;

    // Cek apakah ada sesi tersimpan di localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_ADMIN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const expires = parsed.expiresAt ? new Date(parsed.expiresAt).getTime() : 0;
        if (Date.now() < expires) {
          const activeSession: UserSession = {
            uid: parsed.uid || "local-session",
            memberId: parsed.memberId,
            email: parsed.email || null,
            displayName: parsed.displayName || parsed.gameNickname || "Pengguna CEES",
            gameNickname: parsed.gameNickname,
            division: parsed.division || "ALL",
            role: parsed.role || "member",
            authType: parsed.authType || "passkey",
            avatarUrl: parsed.avatarUrl || "/assets/default_avatar.jpg",
            verified: Boolean(parsed.verified),
            authenticatedAt: parsed.authenticatedAt || new Date().toISOString(),
          };
          setUser(activeSession);
          if (activeSession.role === "admin") {
            syncAdminServerCookie(activeSession);
          }
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(LEGACY_ADMIN_KEY);
        }
      }
    } catch (err) {
      console.warn("Gagal membaca cache sesi lokal:", err);
    }

    // Cek sesi Firebase Auth
    if (auth) {
      unsubFirebase = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const session: UserSession = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User Operator",
            gameNickname: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            role: "admin", // default Firebase Auth admin jika terdaftar
            authType: "firebase",
            authenticatedAt: new Date().toISOString(),
          };
          setUser(session);
          syncAdminServerCookie(session);
        } else {
          const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_ADMIN_KEY);
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

  // 2. Admin: Login via Email & Password (Firebase)
  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      return {
        success: false,
        error: "Firebase Auth belum terhubung. Silakan gunakan opsi Passkey Administrator.",
      };
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const session: UserSession = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "Admin Operator",
        gameNickname: cred.user.displayName || "Admin",
        role: "admin",
        authType: "firebase",
        authenticatedAt: new Date().toISOString(),
      };
      setUser(session);
      await syncAdminServerCookie(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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

  // 3. Admin: Login via Google Account
  const loginWithGoogle = async () => {
    if (!auth) {
      return {
        success: false,
        error: "Firebase Auth belum terhubung. Silakan gunakan opsi Passkey Administrator.",
      };
    }
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const session: UserSession = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "Google Admin",
        gameNickname: cred.user.displayName || "Admin",
        role: "admin",
        authType: "firebase",
        authenticatedAt: new Date().toISOString(),
      };
      setUser(session);
      await syncAdminServerCookie(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return { success: true };
    } catch (err: any) {
      let message = "Gagal login dengan akun Google.";
      if (err.code === "auth/popup-closed-by-user") {
        message = "Jendela login Google ditutup sebelum selesai.";
      }
      return { success: false, error: message };
    }
  };

  // 4. Admin: Login via Passkey PIN
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

      const session: UserSession = {
        uid: "passkey-admin",
        email: null,
        displayName: data.user.displayName,
        gameNickname: data.user.displayName,
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

  // 5. Member: Login via Nickname / Email + Password
  const loginMemberWithNickname = async (identifier: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/member-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "credentials",
          identifier,
          password: pass,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Login gagal.",
          needsActivation: data.needsActivation,
          suggestedNickname: data.suggestedNickname,
        };
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Gagal menghubungkan ke server login member." };
    }
  };

  // 6. Member: Login via Google Sign-In
  const loginMemberWithGoogle = async () => {
    if (!auth) {
      return {
        success: false,
        error: "Firebase Auth belum terhubung di lingkungan ini.",
      };
    }
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      const res = await fetch("/api/auth/member-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType: "google",
          googleUser: {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName,
            photoURL: cred.user.photoURL,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Gagal sinkronisasi akun Google member." };
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      let message = "Gagal masuk dengan akun Google.";
      if (err.code === "auth/popup-closed-by-user") {
        message = "Jendela login Google ditutup sebelum selesai.";
      }
      return { success: false, error: message };
    }
  };

  // 7. Member: Register / Klaim Akun
  const registerMemberAccount = async (payload: {
    gameNickname: string;
    whatsapp: string;
    password: string;
    fullName?: string;
    division?: string;
    city?: string;
    email?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/member-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Pendaftaran akun gagal." };
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: "Terjadi kesalahan jaringan saat mendaftar akun." };
    }
  };

  // 8. Logout Universal
  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout cookie clear error:", err);
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_ADMIN_KEY);
    setUser(null);
  };

  // Direct Setter for active session (e.g. from /join instant registration)
  const setActiveSession = (sessionData: UserSession) => {
    setUser(sessionData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (err) {
      console.warn("Gagal menyimpan sesi ke localStorage:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setActiveSession,
        loginWithEmail,
        loginWithGoogle,
        loginWithPasskey,
        loginMemberWithNickname,
        loginMemberWithGoogle,
        registerMemberAccount,
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
