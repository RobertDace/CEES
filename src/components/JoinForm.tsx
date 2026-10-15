"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Loader2,
  Database,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Gamepad2,
  ShieldCheck,
} from "lucide-react";
import { COMMUNITY_INFO, DIVISIONS } from "@/data/community";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  fullName: string;
  gameNickname: string;
  gameId: string;
  division: string;
  city: string;
  whatsapp: string;
  password: string;
  discordTag: string;
  playerType: "Kompetitif" | "Santai Mabar" | "Keduanya";
  motivation: string;
}

export default function JoinForm({ defaultDivision = "pubgm" }: { defaultDivision?: string }) {
  const { setActiveSession } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gameNickname: "",
    gameId: "",
    division: defaultDivision,
    city: "Samarinda",
    whatsapp: "",
    password: "",
    discordTag: "",
    playerType: "Kompetitif",
    motivation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredTimestamp, setRegisteredTimestamp] = useState<string | null>(null);
  const [createdMemberCode, setCreatedMemberCode] = useState<string>("CEES-MEMBER");
  const [submissionDestination, setSubmissionDestination] = useState<string>("local_live_store");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!formData.gameNickname.trim()) newErrors.gameNickname = "Nickname in-game wajib diisi";
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "Nomor WhatsApp aktif wajib diisi";
    } else if (!/^[0-9+-\s]{8,16}$/.test(formData.whatsapp.trim())) {
      newErrors.whatsapp = "Format nomor WhatsApp tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Kata sandi / PIN akun wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter demi keamanan akun";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateWhatsappMessage = () => {
    const text = `Halo Admin CEES AREA! Saya telah mendaftar melalui formulir website resmi CEES GANK:
    
- *Nama Lengkap*: ${formData.fullName}
- *Nickname In-Game*: ${formData.gameNickname}
- *ID Game*: ${formData.gameId || "-"}
- *Divisi Pilihan*: ${formData.division.toUpperCase()}
- *Tipe Player*: ${formData.playerType}
- *Domisili/Kota*: ${formData.city}
- *Nomor WhatsApp*: ${formData.whatsapp}
- *Discord Tag*: ${formData.discordTag || "-"}
- *Motivasi*: ${formData.motivation || "-"}

Data saya telah tersimpan di sistem dan akun saya telah aktif. Mohon verifikasi pendaftaran saya untuk bergabung di grup dan discord. Terima kasih! #InvictusManeo`;

    return encodeURIComponent(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan formulir pendaftaran.");
      }

      // Otomatis aktifkan sesi login di browser
      if (data.user) {
        setActiveSession(data.user);
      }

      const generatedCode = data.record?.id
        ? `CEES-${String(data.record.id).slice(-6).toUpperCase()}`
        : "CEES-MEMBER";

      setCreatedMemberCode(generatedCode);
      setRegisteredTimestamp(data.record?.timestamp || new Date().toLocaleTimeString("id-ID"));
      setSubmissionDestination(data.destination || "local_live_store");
      setSubmitted(true);

      // Trigger instant update to LiveMemberRoster component across the page
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("memberRegistered", { detail: data.record }));
      }
    } catch (err: unknown) {
      console.error("Submission error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kendala koneksi ke database. Anda tetap dapat melanjutkan konfirmasi langsung via WhatsApp.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/6285705035765?text=${generateWhatsappMessage()}`;

  return (
    <div className="relative border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] sm:p-10 dark:border-white dark:bg-dark-surface rounded-none">

      {/* Header Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between border-b-2 border-slate-900 pb-4 text-xs dark:border-white gap-2">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 border border-slate-900 bg-brand-blue animate-pulse rounded-none dark:border-white" />
          <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            FORMULIR PENDAFTARAN RESMI
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 border border-slate-900 bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-brand-blue uppercase dark:border-white dark:bg-dark-base dark:text-brand-cyan rounded-none">
            <Database className="h-3.5 w-3.5" />
            <span>CLOUD DB READY</span>
          </span>
          <span className="border border-slate-900 bg-emerald-400 px-3 py-1 font-mono text-[11px] font-bold text-slate-950 uppercase shadow-[2px_2px_0px_0px_#0030FF] rounded-none">
            STATUS: TERBUKA
          </span>
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Row 1: Nama & Domisili */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Zidan Nata"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`mt-2 w-full border-2 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:outline-none dark:bg-dark-base dark:text-white dark:placeholder-steel-500 ${errors.fullName ? "border-red-500" : "border-slate-900 focus:bg-white dark:border-white"
                  }`}
              />
              {errors.fullName && (
                <p className="mt-1 font-mono text-xs font-bold text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
                Domisili / Kota Asal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Samarinda, Kaltim"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-2 w-full border-2 border-slate-900 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:bg-white focus:outline-none dark:border-white dark:bg-dark-base dark:text-white dark:placeholder-steel-500"
              />
            </div>
          </div>

          {/* Row 2: Divisi Game Pilihan */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200 mb-2">
              Pilih Divisi Game Utama <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DIVISIONS.map((div) => {
                const isSelected = formData.division === div.id;
                return (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, division: div.id })}
                    className={`flex flex-col items-start p-3.5 text-left border-2 transition-all rounded-none ${isSelected
                        ? "border-brand-blue bg-brand-blue text-white shadow-[4px_4px_0px_0px_#0F172A] dark:shadow-[4px_4px_0px_0px_#FFFFFF]"
                        : "border-slate-900 bg-slate-50 text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-white dark:border-white dark:bg-dark-base dark:text-white"
                      }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-display text-sm font-black uppercase">{div.name}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`mt-1 font-mono text-[11px] ${isSelected ? "text-blue-100" : "text-slate-600 dark:text-steel-400"}`}>
                      {div.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Nickname In-Game & Game ID */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
                Nickname In-Game <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Basten#01"
                value={formData.gameNickname}
                onChange={(e) => setFormData({ ...formData, gameNickname: e.target.value })}
                className={`mt-2 w-full border-2 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:outline-none dark:bg-dark-base dark:text-white dark:placeholder-steel-500 ${errors.gameNickname ? "border-red-500" : "border-slate-900 focus:bg-white dark:border-white"
                  }`}
              />
              {errors.gameNickname && (
                <p className="mt-1 font-mono text-xs font-bold text-red-500">{errors.gameNickname}</p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
                Game ID / Tag (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 512398402 (PUBGM) / 12345678 (MLBB)"
                value={formData.gameId}
                onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                className="mt-2 w-full border-2 border-slate-900 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:bg-white focus:outline-none dark:border-white dark:bg-dark-base dark:text-white dark:placeholder-steel-500"
              />
            </div>
          </div>

          {/* Row 4: WhatsApp & Kata Sandi Baru */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
                Nomor WhatsApp Aktif <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className={`mt-2 w-full border-2 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:outline-none dark:bg-dark-base dark:text-white dark:placeholder-steel-500 ${errors.whatsapp ? "border-red-500" : "border-slate-900 focus:bg-white dark:border-white"
                  }`}
              />
              {errors.whatsapp && (
                <p className="mt-1 font-mono text-xs font-bold text-red-500">{errors.whatsapp}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
                  Kata Sandi / PIN Akun Baru <span className="text-red-500">*</span>
                </label>
                <span className="font-mono text-[10px] text-slate-500 dark:text-steel-400">Min. 6 Karakter</span>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password login..."
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full border-2 bg-slate-50 py-3 pr-11 pl-10 text-sm font-mono text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:outline-none dark:bg-dark-base dark:text-white dark:placeholder-steel-500 ${errors.password ? "border-red-500" : "border-slate-900 focus:bg-white dark:border-white"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 font-mono text-xs font-bold text-red-500">{errors.password}</p>
              ) : (
                <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-steel-400">
                  *Untuk login otomatis ke Kartu Digital, forum, dan market.
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Discord & Player Style */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
                Discord Username / Tag (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: username#1234"
                value={formData.discordTag}
                onChange={(e) => setFormData({ ...formData, discordTag: e.target.value })}
                className="mt-2 w-full border-2 border-slate-900 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:bg-white focus:outline-none dark:border-white dark:bg-dark-base dark:text-white dark:placeholder-steel-500"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200 mb-2">
                Tipe Player
              </label>
              <div className="flex flex-wrap gap-4 pt-1.5">
                {(["Kompetitif", "Santai Mabar", "Keduanya"] as const).map((type) => (
                  <label key={type} className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-steel-200 cursor-pointer">
                    <input
                      type="radio"
                      name="playerType"
                      checked={formData.playerType === type}
                      onChange={() => setFormData({ ...formData, playerType: type })}
                      className="accent-brand-blue h-4 w-4"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Row 6: Motivation */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200">
              Alasan Ingin Bergabung
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan motivasi atau harapan kamu bergabung bersama keluarga CEES AREA..."
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              className="mt-2 w-full border-2 border-slate-900 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:bg-white focus:outline-none dark:border-white dark:bg-dark-base dark:text-white dark:placeholder-steel-500"
            />
          </div>

          {/* Submit Error Alert */}
          {submitError && (
            <div className="border-2 border-red-500 bg-red-50 p-4 text-xs font-mono text-red-900 dark:bg-red-950/40 dark:text-red-200 dark:border-red-500 shadow-[3px_3px_0px_0px_#EF4444] rounded-none flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">PERINGATAN SISTEM:</p>
                <p>{submitError}</p>
                <p className="mt-1">
                  Kamu tetap bisa langsung konfirmasi ke admin via{" "}
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="underline font-bold text-brand-blue dark:text-brand-cyan">
                    WhatsApp Resmi
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`brutal-btn flex w-full items-center justify-center space-x-2 py-4 text-base font-bold tracking-wider rounded-none ${isSubmitting ? "opacity-75 cursor-wait" : ""
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>MEMBUAT AKUN & MENYIMPAN DATA...</span>
                </>
              ) : (
                <>
                  <span>DAFTAR SEKARANG & AKTIFKAN AKUN MEMBER</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            <p className="mt-3 text-center font-mono text-xs text-slate-600 dark:text-steel-400">
              *Setelah menekan tombol daftar, akunmu akan langsung aktif, otomatis login, dan Kartu Anggota Digital siap digunakan.
            </p>
          </div>

        </form>
      ) : (
        /* Submission Success */
        <div className="space-y-6 text-center py-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-slate-900 bg-emerald-500 text-white shadow-[4px_4px_0px_0px_#0F172A] rounded-none dark:border-white dark:shadow-[4px_4px_0px_0px_#FFFFFF]">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center space-x-1.5 border border-slate-900 bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800 dark:border-white dark:bg-emerald-950 dark:text-emerald-300 rounded-none">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>AKUN & KARTU MEMBER: AKTIF</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 border border-slate-900 bg-cyan-100 px-3 py-1 font-mono text-xs font-bold text-brand-blue dark:border-white dark:bg-dark-base dark:text-brand-cyan rounded-none">
                <Database className="h-3.5 w-3.5" />
                <span>SESI LOGIN: OTOMATIS AKTIF</span>
              </span>
            </div>
            <h3 className="font-display text-3xl font-black text-slate-900 uppercase dark:text-white">
              PENDAFTARAN BERHASIL!
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-700 dark:text-steel-300">
              Selamat datang di keluarga besar CEES GANK, <strong className="text-slate-900 dark:text-white">{formData.fullName}</strong> ({formData.gameNickname})! Akunmu telah dibuat dan otomatis masuk ke sistem.
            </p>
          </div>

          {/* Submission Summary Card */}
          <div className="mx-auto max-w-md border-2 border-slate-900 bg-slate-50 p-5 text-left font-mono text-xs text-slate-800 dark:border-white dark:bg-dark-base dark:text-steel-200 shadow-[6px_6px_0px_0px_#0030FF] rounded-none space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-1.5 dark:border-dark-border">
              <span className="text-slate-500 dark:text-steel-400">ID KARTU ANGGOTA:</span>
              <strong className="text-brand-blue dark:text-brand-cyan">{createdMemberCode}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5 dark:border-dark-border">
              <span className="text-slate-500 dark:text-steel-400">NICKNAME IN-GAME:</span>
              <strong className="uppercase">{formData.gameNickname}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5 dark:border-dark-border">
              <span className="text-slate-500 dark:text-steel-400">DIVISI GAME:</span>
              <strong className="text-brand-blue dark:text-brand-cyan">{formData.division.toUpperCase()}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5 dark:border-dark-border">
              <span className="text-slate-500 dark:text-steel-400">DOMISILI:</span>
              <strong>{formData.city}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-steel-400">STATUS AKUN:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">LOGIN AKTIF (SIAP DIGUNAKAN)</strong>
            </div>
          </div>

          {/* Action Hub */}
          <div className="mx-auto max-w-md space-y-3">
            {/* Primary Action: Direct Access to Digital Member ID Card */}
            <Link
              href="/member"
              className="flex w-full items-center justify-center space-x-2 border-2 border-slate-900 bg-brand-cyan py-4 font-display text-base font-black text-slate-900 shadow-[4px_4px_0px_0px_#0030FF] rounded-none hover:bg-white transition-all uppercase tracking-wider dark:border-white"
            >
              <CreditCard className="h-5 w-5" />
              <span>LIHAT KARTU MEMBER DIGITAL SAYA</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            {/* Secondary Action: Confirm to WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center space-x-2 border-2 border-slate-900 bg-emerald-600 py-3 font-display text-xs font-bold text-white shadow-[3px_3px_0px_0px_#0F172A] rounded-none hover:bg-emerald-500 transition-colors uppercase tracking-wider dark:border-white dark:shadow-[3px_3px_0px_0px_#FFFFFF]"
            >
              <MessageSquare className="h-4 w-4" />
              <span>KONFIRMASI KE WHATSAPP ADMIN</span>
            </a>

            {/* Register another */}
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  fullName: "",
                  gameNickname: "",
                  gameId: "",
                  division: defaultDivision,
                  city: "Samarinda",
                  whatsapp: "",
                  password: "",
                  discordTag: "",
                  playerType: "Kompetitif",
                  motivation: "",
                });
              }}
              className="brutal-btn-outline flex w-full items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-none"
            >
              <span>DAFTARKAN ANGGOTA LAIN</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* Info Badge */}
          <div className="border-2 border-slate-900 bg-slate-50 p-4 text-left font-mono text-xs text-slate-700 dark:border-white dark:bg-dark-base dark:text-steel-400 rounded-none shadow-[3px_3px_0px_0px_#0030FF]">
            <span className="font-bold text-slate-900 dark:text-white uppercase">LANGKAH SELANJUTNYA:</span>
            <p className="mt-1">
              Kamu bisa langsung menggunakan <strong>Kartu Member Digital</strong> di atas sebagai identitas keanggotaan. Administrator juga akan menghubungimu via WhatsApp untuk memberikan link Discord resmi CEES GANK.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
