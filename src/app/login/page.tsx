"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
  Eye,
  EyeOff,
  Sliders,
  Shield,
  Gamepad2,
  Sparkles,
  Phone,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { COMMUNITY_INFO } from "@/data/community";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRedirect = searchParams.get("redirect");

  const {
    user,
    loginWithPasskey,
    loginWithEmail,
    loginWithGoogle,
    loginMemberWithNickname,
    loginMemberWithGoogle,
    registerMemberAccount,
    logout,
  } = useAuth();

  // Realm: "member" (default) | "admin"
  const [realm, setRealm] = useState<"member" | "admin">("member");

  // Member flow: "login" | "register"
  const [memberFlow, setMemberFlow] = useState<"login" | "register">("login");

  // Admin flow: "passkey" | "email"
  const [adminAuthMode, setAdminAuthMode] = useState<"passkey" | "email">("passkey");

  // Form states - Member Login
  const [memberIdentifier, setMemberIdentifier] = useState("");
  const [memberPassword, setMemberPassword] = useState("");

  // Form states - Member Register / Claim
  const [regNickname, setRegNickname] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");

  // Form states - Admin
  const [adminPasskey, setAdminPasskey] = useState("");
  const [adminOperatorName, setAdminOperatorName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Toggle intip password
  const [showPass, setShowPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Submit Member Login
  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await loginMemberWithNickname(memberIdentifier, memberPassword);
      if (res.success) {
        setSuccessMessage("Login member berhasil! Membuka Dashboard Komunitas...");
        setTimeout(() => {
          router.push(targetRedirect || "/member");
        }, 900);
      } else {
        setErrorMessage(res.error || "Gagal masuk ke akun member.");
        if (res.needsActivation) {
          if (res.suggestedNickname) {
            setRegNickname(res.suggestedNickname);
          }
          setMemberFlow("register");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gangguan jaringan saat login member.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Member Register / Claim
  const handleMemberRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await registerMemberAccount({
        gameNickname: regNickname,
        whatsapp: regWhatsapp,
        password: regPassword,
        fullName: regFullName,
      });

      if (res.success) {
        setSuccessMessage("Akun member berhasil diaktifkan! Mengalihkan ke Kartu Anggota...");
        setTimeout(() => {
          router.push(targetRedirect || "/member");
        }, 900);
      } else {
        setErrorMessage(res.error || "Gagal mengaktifkan akun member.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghubungi server pendaftaran akun.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Member Google Login
  const handleMemberGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await loginMemberWithGoogle();
      if (res.success) {
        setSuccessMessage("Login Google berhasil! Mengalihkan ke Dashboard Member...");
        setTimeout(() => {
          router.push(targetRedirect || "/member");
        }, 900);
      } else {
        setErrorMessage(res.error || "Gagal masuk dengan Google.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gangguan saat otentikasi Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (adminAuthMode === "passkey") {
        if (!adminPasskey.trim()) {
          setErrorMessage("Passkey wajib diisi.");
          setIsLoading(false);
          return;
        }

        const res = await loginWithPasskey(adminPasskey, adminOperatorName);
        if (res.success) {
          setSuccessMessage("Otorisasi staf berhasil! Mengalihkan ke Admin Tools...");
          setTimeout(() => {
            router.push(targetRedirect || "/admin");
          }, 900);
        } else {
          setErrorMessage(res.error || "Passkey salah.");
        }
      } else {
        if (!adminEmail.trim() || !adminPassword) {
          setErrorMessage("Email dan kata sandi wajib diisi.");
          setIsLoading(false);
          return;
        }

        const res = await loginWithEmail(adminEmail, adminPassword);
        if (res.success) {
          setSuccessMessage("Login admin berhasil! Mengalihkan ke Admin Tools...");
          setTimeout(() => {
            router.push(targetRedirect || "/admin");
          }, 900);
        } else {
          setErrorMessage(res.error || "Gagal masuk akun Firebase admin.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses login admin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
    window.location.href = "/";
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Banner Tape */}
      <div className="tape-track w-full max-w-xl border-y-2 border-slate-900 bg-slate-900 py-1.5 text-white dark:border-white dark:bg-dark-void">
        <div className="flex items-center justify-around font-mono text-[10px] font-bold uppercase tracking-widest sm:text-xs">
          <span>[ INVICTUS MANEO ]</span>
          <span>//</span>
          <span>{realm === "member" ? "MEMBER COMMUNITY PORTAL" : "RESTRICTED: STAFF HQ ONLY"}</span>
          <span>//</span>
          <span className="text-brand-cyan">SECTOR 0541</span>
        </div>
      </div>

      {/* Main Terminal Card */}
      <div className="mt-6 w-full max-w-xl border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base sm:p-10">
        {/* Realm Selector Tabs: Member vs Admin */}
        <div className="grid grid-cols-2 border-2 border-slate-900 bg-slate-100 p-1 dark:border-white dark:bg-dark-surface">
          <button
            type="button"
            onClick={() => {
              setRealm("member");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-black uppercase tracking-wider transition-all ${
              realm === "member"
                ? "border-2 border-slate-900 bg-brand-cyan text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] dark:border-white"
                : "text-slate-700 hover:text-slate-900 dark:text-steel-300 dark:hover:text-white"
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>MEMBER GANK</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRealm("admin");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-black uppercase tracking-wider transition-all ${
              realm === "admin"
                ? "border-2 border-slate-900 bg-brand-blue text-white shadow-[3px_3px_0px_0px_#000000] dark:border-white"
                : "text-slate-700 hover:text-slate-900 dark:text-steel-300 dark:hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>STAF PENGURUS</span>
          </button>
        </div>

        {/* JIKA SUDAH LOGIN: Tampilkan Status Sesi Aktif */}
        {user ? (
          <div className="mt-8 space-y-6">
            <div className="border-2 border-emerald-600 bg-emerald-50 p-5 dark:border-emerald-400 dark:bg-emerald-950/30">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  SESI {user.role === "admin" ? "ADMIN" : "MEMBER"} AKTIF
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
                Halo, {user.displayName}!
              </h2>
              <div className="mt-3 space-y-1 font-mono text-xs text-slate-700 dark:text-steel-300">
                <p>
                  <span className="text-slate-500">Nickname:</span>{" "}
                  <strong className="text-brand-blue dark:text-brand-cyan uppercase">
                    {user.gameNickname || user.displayName}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Peran:</span>{" "}
                  <span className="font-bold uppercase">
                    {user.role} ({user.authType})
                  </span>
                </p>
                {user.email && (
                  <p>
                    <span className="text-slate-500">Email:</span> {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="brutal-btn flex flex-1 items-center justify-center gap-2 border-2 border-slate-900 bg-brand-cyan px-5 py-3 text-xs font-bold text-slate-900 shadow-[4px_4px_0px_0px_#0030FF] hover:bg-white"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Buka Admin Tools CMS</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/member"
                  className="brutal-btn flex flex-1 items-center justify-center gap-2 border-2 border-slate-900 bg-brand-cyan px-5 py-3 text-xs font-bold text-slate-900 shadow-[4px_4px_0px_0px_#0030FF] hover:bg-white"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Buka Kartu & Dashboard Member</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 border-2 border-slate-900 bg-red-600 px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#000000] hover:bg-red-700 dark:border-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          /* JIKA BELUM LOGIN */
          <div className="mt-6">
            {/* Notification Alerts */}
            {errorMessage && (
              <div className="mb-5 flex items-start space-x-2.5 border-2 border-red-600 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-400 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 flex items-start space-x-2.5 border-2 border-emerald-600 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* REALM 1: MEMBER PORTAL */}
            {realm === "member" ? (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-4xl dark:text-white">
                      PORTAL MEMBER
                    </h1>
                    <p className="mt-1 text-xs text-slate-600 dark:text-steel-300">
                      Masuk untuk melihat Kartu Tanda Anggota Digital, testimoni market, dan forum komunitas.
                    </p>
                  </div>
                </div>

                {memberFlow === "login" ? (
                  /* Form Member: Login Langsung */
                  <div className="mt-6 space-y-4">
                    {/* Google Sign In 1-Klik */}
                    <button
                      type="button"
                      onClick={handleMemberGoogleLogin}
                      disabled={isLoading}
                      className="flex w-full items-center justify-center gap-3 border-2 border-slate-900 bg-white py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] hover:bg-slate-50 active:translate-x-0.5 active:translate-y-0.5 dark:border-white dark:bg-dark-surface dark:text-white dark:shadow-[3px_3px_0px_0px_#00F0FF]"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Masuk dengan Akun Google</span>
                    </button>

                    <div className="relative my-4 flex items-center justify-center">
                      <div className="w-full border-t border-slate-300 dark:border-dark-border" />
                      <span className="absolute bg-white px-3 font-mono text-[10px] font-bold text-slate-500 uppercase dark:bg-dark-base dark:text-steel-400">
                        atau login pakai nickname / email
                      </span>
                    </div>

                    <form onSubmit={handleMemberLogin} className="space-y-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                          Game Nickname / Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Gamepad2 className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            required
                            value={memberIdentifier}
                            onChange={(e) => setMemberIdentifier(e.target.value)}
                            placeholder="Contoh: Wayy atau 2OB1T."
                            className="w-full border-2 border-slate-900 bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                          Kata Sandi / PIN Akun <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type={showPass ? "text" : "password"}
                            required
                            value={memberPassword}
                            onChange={(e) => setMemberPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border-2 border-slate-900 bg-white py-2.5 pr-11 pl-10 font-mono text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="brutal-btn mt-6 flex w-full items-center justify-center gap-2 border-2 border-slate-900 bg-brand-cyan py-3.5 text-xs font-bold tracking-wider text-slate-900 shadow-[4px_4px_0px_0px_#0030FF]"
                      >
                        <span>{isLoading ? "MEMVERIFIKASI AKUN..." : "MASUK PORTAL MEMBER"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>

                    {/* New Member Registration Card */}
                    <div className="mt-6 border-2 border-slate-900 bg-slate-50 p-4 text-center dark:border-white dark:bg-dark-surface shadow-[3px_3px_0px_0px_#0030FF]">
                      <p className="font-display text-xs font-black uppercase text-slate-900 dark:text-white">
                        Belum Terdaftar Sebagai Anggota?
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-steel-300">
                        Daftar sekarang untuk langsung mendapatkan Kartu Anggota Digital dan akses penuh komunitas.
                      </p>
                      <Link
                        href="/join"
                        className="brutal-btn mt-3 inline-flex items-center justify-center gap-2 border-2 border-slate-900 bg-brand-cyan px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-white transition-all dark:border-white"
                      >
                        <span>Daftar Member Baru di Sini</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Legacy Member Activation Link */}
                    <div className="mt-3 text-center text-xs">
                      <span className="text-slate-500">Member lama belum punya kata sandi? </span>
                      <button
                        type="button"
                        onClick={() => setMemberFlow("register")}
                        className="font-bold text-brand-blue underline dark:text-brand-cyan"
                      >
                        Aktivasi akun di sini
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form Member: Aktivasi Akun Member Lama */
                  <div className="mt-6">
                    <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-dark-border">
                      <span className="font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
                        [ AKTIVASI AKUN MEMBER LAMA ]
                      </span>
                      <button
                        type="button"
                        onClick={() => setMemberFlow("login")}
                        className="font-mono text-xs text-slate-500 hover:text-slate-900 dark:text-steel-400 dark:hover:text-white underline"
                      >
                        ← Kembali ke Login
                      </button>
                    </div>

                    <form onSubmit={handleMemberRegister} className="space-y-4">
                      <div className="border border-brand-cyan bg-brand-cyan/10 p-3 text-xs text-slate-800 dark:text-steel-200">
                        💡 <strong>Khusus Member Terdaftar:</strong> Masukkan <strong>Nickname Game</strong> dan <strong>Nomor WhatsApp</strong> yang pernah kamu daftarkan sebelumnya untuk membuat kata sandi baru.
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                          Nickname In-Game Terdaftar <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Gamepad2 className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            required
                            value={regNickname}
                            onChange={(e) => setRegNickname(e.target.value)}
                            placeholder="Masukkan Nickname kamu..."
                            className="w-full border-2 border-slate-900 bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                          Nomor WhatsApp Terdaftar <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Phone className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="tel"
                            required
                            value={regWhatsapp}
                            onChange={(e) => setRegWhatsapp(e.target.value)}
                            placeholder="0812xxxxxxxx"
                            className="w-full border-2 border-slate-900 bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-800 dark:text-steel-200">
                          Buat Kata Sandi Baru <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type={showPass ? "text" : "password"}
                            required
                            minLength={6}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full border-2 border-slate-900 bg-white py-2.5 pr-11 pl-10 font-mono text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="brutal-btn mt-6 flex w-full items-center justify-center gap-2 border-2 border-slate-900 bg-brand-blue py-3.5 text-xs font-bold tracking-wider text-white shadow-[4px_4px_0px_0px_#000000]"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>{isLoading ? "MENYIMPAN AKUN..." : "AKTIFKAN KATA SANDI"}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              /* REALM 2: ADMIN / STAFF HQ TERMINAL */
              <div>
                <div>
                  <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-4xl dark:text-white">
                    LOGIN PENGURUS
                  </h1>
                  <p className="mt-1 text-xs text-slate-600 dark:text-steel-300">
                    Akses komando khusus pengurus resmi untuk CMS, verifikasi member, dan pengaturan web.
                  </p>
                </div>

                {/* Mode Switch Tabs Admin */}
                <div className="mt-6 grid grid-cols-2 border-2 border-slate-900 bg-slate-100 p-1 dark:border-white dark:bg-dark-surface">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminAuthMode("passkey");
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                      adminAuthMode === "passkey"
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
                      setAdminAuthMode("email");
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                      adminAuthMode === "email"
                        ? "border-2 border-slate-900 bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000000] dark:border-white"
                        : "text-slate-700 hover:text-slate-900 dark:text-steel-300 dark:hover:text-white"
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Staf</span>
                  </button>
                </div>

                <form onSubmit={handleAdminSubmit} className="mt-6 space-y-4">
                  {adminAuthMode === "passkey" ? (
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
                            value={adminOperatorName}
                            onChange={(e) => setAdminOperatorName(e.target.value)}
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
                            type={showPass ? "text" : "password"}
                            required
                            value={adminPasskey}
                            onChange={(e) => setAdminPasskey(e.target.value)}
                            placeholder="Masukkan Master Passkey Admin..."
                            className="w-full border-2 border-slate-900 bg-white py-2.5 pr-11 pl-10 font-mono text-xs font-bold tracking-widest text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-steel-400">
                          *PIN otorisasi rahasia staf pengurus untuk membuka akses sistem.
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
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
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
                            type={showPass ? "text" : "password"}
                            required
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border-2 border-slate-900 bg-white py-2.5 pr-11 pl-10 font-mono text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="border-2 border-slate-900 bg-white p-6 font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface">
            [ MEMUAT PORTAL AUTORISASI... ]
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
