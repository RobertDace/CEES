"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  KeyRound,
  Mail,
  Lock,
  User,
  ArrowRight,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Terminal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { COMMUNITY_INFO } from "@/data/community";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithPasskey, loginWithEmail, logout } = useAuth();

  // Mode: "passkey" (default cepat) | "email"
  const [authMode, setAuthMode] = useState<"passkey" | "email">("passkey");

  // Form states
  const [passkey, setPasskey] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (authMode === "passkey") {
        if (!passkey.trim()) {
          setErrorMessage("Passkey wajib diisi.");
          setIsLoading(false);
          return;
        }

        const res = await loginWithPasskey(passkey, operatorName);
        if (res.success) {
          setSuccessMessage("Autentikasi Passkey berhasil! Akses admin diberikan.");
          setTimeout(() => {
            router.push("/");
          }, 1200);
        } else {
          setErrorMessage(res.error || "Passkey salah.");
        }
      } else {
        if (!email.trim() || !password) {
          setErrorMessage("Email dan kata sandi wajib diisi.");
          setIsLoading(false);
          return;
        }

        const res = await loginWithEmail(email, password);
        if (res.success) {
          setSuccessMessage("Login berhasil! Mengalihkan ke markas...");
          setTimeout(() => {
            router.push("/");
          }, 1200);
        } else {
          setErrorMessage(res.error || "Gagal masuk dengan akun Firebase.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi gangguan saat memproses login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
    setSuccessMessage("Sesi admin telah ditutup.");
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Banner Tape */}
      <div className="tape-track w-full max-w-xl border-y-2 border-slate-900 bg-slate-900 py-1.5 text-white dark:border-white dark:bg-dark-void">
        <div className="flex items-center justify-around font-mono text-[10px] font-bold uppercase tracking-widest sm:text-xs">
          <span>[ ACCESS GATEWAY ]</span>
          <span>//</span>
          <span>SAMARINDA SECTOR HQ</span>
          <span>//</span>
          <span className="text-brand-cyan">RESTRICTED: STAFF ONLY</span>
        </div>
      </div>

      {/* Main Terminal Card */}
      <div className="mt-6 w-full max-w-xl border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base sm:p-10">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 dark:border-white">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-blue dark:text-brand-cyan">
              CEES COMMAND TERMINAL
            </span>
          </div>
          <span className="border border-brand-blue bg-brand-blue px-2.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase shadow-[2px_2px_0px_0px_#000000]">
            V.1.0-ADMIN
          </span>
        </div>

        {/* JIKA SUDAH LOGIN: Tampilkan Status Sesi Aktif */}
        {user ? (
          <div className="mt-8 space-y-6">
            <div className="border-2 border-emerald-600 bg-emerald-50 p-5 dark:border-emerald-400 dark:bg-emerald-950/30">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  SESI ADMIN AKTIF
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
                Selamat Datang, {user.displayName}!
              </h2>
              <div className="mt-3 space-y-1 font-mono text-xs text-slate-700 dark:text-steel-300">
                <p>
                  <span className="text-slate-500">Status Otorisasi:</span>{" "}
                  <strong className="text-brand-blue dark:text-brand-cyan uppercase">
                    {user.role} ({user.authType})
                  </strong>
                </p>
                {user.email && (
                  <p>
                    <span className="text-slate-500">Email Akun:</span> {user.email}
                  </p>
                )}
                <p>
                  <span className="text-slate-500">Waktu Masuk:</span>{" "}
                  {new Date(user.authenticatedAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#roster"
                className="brutal-btn flex flex-1 items-center justify-center gap-2 px-5 py-3 text-xs"
              >
                <span>Lihat Data Member Live</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 border-2 border-slate-900 bg-red-600 px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#000000] hover:bg-red-700 dark:border-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Akhiri Sesi (Logout)</span>
              </button>
            </div>
          </div>
        ) : (
          /* JIKA BELUM LOGIN: Form Login Terminal */
          <div className="mt-6">
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-4xl dark:text-white">
                LOGIN PENGURUS
              </h1>
              <p className="mt-1 text-xs text-slate-600 dark:text-steel-300">
                Akses komando untuk verifikasi member, manajemen roster, dan pengaturan komunitas.
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="mt-6 grid grid-cols-2 border-2 border-slate-900 bg-slate-100 p-1 dark:border-white dark:bg-dark-surface">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("passkey");
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                  authMode === "passkey"
                    ? "border-2 border-slate-900 bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000000] dark:border-white"
                    : "text-slate-700 hover:text-slate-900 dark:text-steel-300 dark:hover:text-white"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>Passkey PIN</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("email");
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                  authMode === "email"
                    ? "border-2 border-slate-900 bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000000] dark:border-white"
                    : "text-slate-700 hover:text-slate-900 dark:text-steel-300 dark:hover:text-white"
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email Firebase</span>
              </button>
            </div>

            {/* Notification Alerts */}
            {errorMessage && (
              <div className="mt-5 flex items-start space-x-2.5 border-2 border-red-600 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-400 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-5 flex items-start space-x-2.5 border-2 border-emerald-600 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {authMode === "passkey" ? (
                <>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                      [01] Nama Pengurus / Operator (Opsional)
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        placeholder="Contoh: Zaden, Alvin, atau Resky"
                        className="w-full border-2 border-slate-900 bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                      [02] Master Passkey PIN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <KeyRound className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        placeholder="Masukkan PIN Admin (Default: cees2026)"
                        className="w-full border-2 border-slate-900 bg-white py-2.5 pr-3.5 pl-10 font-mono text-xs font-bold tracking-widest text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-steel-400">
                      *Gunakan PIN rahasia pengurus untuk masuk langsung tanpa akun Firebase.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                      [01] Email Administrator <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@ceesarea.com"
                        className="w-full border-2 border-slate-900 bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                      [02] Kata Sandi Akun <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border-2 border-slate-900 bg-white py-2.5 pr-3.5 pl-10 font-mono text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="brutal-btn mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-wider"
              >
                <span>{isLoading ? "MEMVERIFIKASI AKSES..." : "MASUK TERMINAL KOMANDO"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 border-t-2 border-slate-900 pt-4 dark:border-white">
          <div className="flex items-center justify-between text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-600 hover:text-brand-blue dark:text-steel-400 dark:hover:text-brand-cyan"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>

            <span className="font-mono text-[10px] text-slate-400 dark:text-steel-500">
              {COMMUNITY_INFO.headquarters}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
