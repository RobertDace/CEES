"use client";

import React, { useState } from "react";
import { ArrowUpRight, CheckCircle2, MessageSquare, Sparkles, Loader2, Database, AlertCircle } from "lucide-react";
import { COMMUNITY_INFO, DIVISIONS } from "@/data/community";

interface FormData {
  fullName: string;
  gameNickname: string;
  gameId: string;
  division: string;
  city: string;
  whatsapp: string;
  discordTag: string;
  playerType: "Kompetitif" | "Santai Mabar" | "Keduanya";
  motivation: string;
}

export default function JoinForm({ defaultDivision = "pubgm" }: { defaultDivision?: string }) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    gameNickname: "",
    gameId: "",
    division: defaultDivision,
    city: "Samarinda",
    whatsapp: "",
    discordTag: "",
    playerType: "Kompetitif",
    motivation: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredTimestamp, setRegisteredTimestamp] = useState<string | null>(null);
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

Data saya telah tersimpan di sistem. Mohon verifikasi pendaftaran saya untuk bergabung. Terima kasih! #InvictusManeo`;

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

      setRegisteredTimestamp(data.record?.timestamp || new Date().toLocaleTimeString("id-ID"));
      setSubmissionDestination(data.destination || "local_live_store");
      setSubmitted(true);

      // Trigger instant update to LiveMemberRoster component across the page
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("memberRegistered", { detail: data.record }));
      }
    } catch (err: unknown) {
      console.error("Submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "Terjadi kendala koneksi ke database. Anda tetap dapat melanjutkan konfirmasi langsung via WhatsApp.";
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

          {/* Row 4: WhatsApp & Discord */}
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
          </div>

          {/* Row 5: Player Style */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-steel-200 mb-2">
              Tipe Player
            </label>
            <div className="flex flex-wrap gap-4">
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
                  <span>MENYIMPAN DATA KE DATABASE...</span>
                </>
              ) : (
                <>
                  <span>KIRIM PENDAFTARAN & SIMPAN DATA</span>
                  <ArrowUpRight className="h-5 w-5" />
                </>
              )}
            </button>
            <p className="mt-3 text-center font-mono text-xs text-slate-600 dark:text-steel-400">
              Data yang kamu kirimkan akan otomatis dicatat ke database resmi CEES AREA dan siap diverifikasi oleh Administrator.
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
                <Database className="h-3.5 w-3.5" />
                <span>LIVE DATABASE: DATA TERCATAT</span>
              </span>
              {submissionDestination === "firebase_firestore" ? (
                <span className="inline-flex items-center space-x-1.5 border border-slate-900 bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800 dark:border-white dark:bg-emerald-950 dark:text-emerald-300 rounded-none">
                  <span>CLOUD FIRESTORE: TERHUBUNG</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 border border-slate-900 bg-blue-100 px-3 py-1 font-mono text-[11px] font-bold text-brand-blue dark:border-white dark:bg-dark-base dark:text-brand-cyan rounded-none">
                  <span>SISTEM PENDAFTARAN AKTIF</span>
                </span>
              )}
            </div>
            <h3 className="font-display text-3xl font-black text-slate-900 uppercase dark:text-white">
              PENDAFTARAN BERHASIL!
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-700 dark:text-steel-300">
              Terima kasih, <strong className="text-slate-900 dark:text-white">{formData.fullName}</strong> ({formData.gameNickname}). Data kamu telah tersimpan ke sistem pada{" "}
              <span className="font-mono font-bold text-brand-blue dark:text-brand-cyan">{registeredTimestamp || "Hari ini"}</span> dan langsung tampil di daftar anggota live di bawah.
            </p>
          </div>

          {/* Submission Summary Card */}
          <div className="mx-auto max-w-md border-2 border-slate-900 bg-slate-50 p-4 text-left font-mono text-xs text-slate-800 dark:border-white dark:bg-dark-base dark:text-steel-200 shadow-[4px_4px_0px_0px_#0030FF] rounded-none space-y-1.5">
            <div className="flex justify-between border-b border-slate-200 pb-1 dark:border-dark-border">
              <span className="text-slate-500 dark:text-steel-400">DIVISI:</span>
              <strong className="text-brand-blue dark:text-brand-cyan">{formData.division.toUpperCase()}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1 dark:border-dark-border">
              <span className="text-slate-500 dark:text-steel-400">TIPE PLAYER:</span>
              <strong>{formData.playerType}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1 dark:border-dark-border">
              <span className="text-slate-500 dark:text-steel-400">DOMISILI:</span>
              <strong>{formData.city}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-steel-400">WHATSAPP:</span>
              <strong>{formData.whatsapp}</strong>
            </div>
          </div>

          {/* Action Hub */}
          <div className="mx-auto max-w-md space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center space-x-2 border-2 border-slate-900 bg-emerald-600 py-4 font-display text-base font-bold text-white shadow-[4px_4px_0px_0px_#0F172A] rounded-none hover:bg-emerald-500 transition-colors uppercase tracking-wider dark:border-white dark:shadow-[4px_4px_0px_0px_#FFFFFF]"
            >
              <MessageSquare className="h-5 w-5" />
              <span>KONFIRMASI KE WHATSAPP ADMIN</span>
            </a>

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
                  discordTag: "",
                  playerType: "Kompetitif",
                  motivation: "",
                });
              }}
              className="brutal-btn-outline flex w-full items-center justify-center space-x-2 py-3 text-xs font-bold rounded-none"
            >
              <span>DAFTARKAN ANGGOTA LAIN</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* Info Badge */}
          <div className="border-2 border-slate-900 bg-slate-50 p-4 text-left font-mono text-xs text-slate-700 dark:border-white dark:bg-dark-base dark:text-steel-400 rounded-none shadow-[3px_3px_0px_0px_#0030FF]">
            <span className="font-bold text-slate-900 dark:text-white uppercase">LANGKAH SELANJUTNYA:</span>
            <p className="mt-1">
              Administrator CEES AREA akan memverifikasi nomor WhatsApp dan akun game kamu, kemudian mengundangmu masuk ke grup koordinasi serta Discord resmi komunitas.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
