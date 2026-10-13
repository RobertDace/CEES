"use client";

import React, { useState } from "react";
import { ArrowUpRight, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
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
    const text = `Halo Admin CEES AREA! Saya ingin mendaftar menjadi anggota baru CEES GANK:
    
- *Nama Lengkap*: ${formData.fullName}
- *Nickname In-Game*: ${formData.gameNickname}
- *ID Game*: ${formData.gameId || "-"}
- *Divisi Pilihan*: ${formData.division.toUpperCase()}
- *Tipe Player*: ${formData.playerType}
- *Domisili/Kota*: ${formData.city}
- *Nomor WhatsApp*: ${formData.whatsapp}
- *Discord Tag*: ${formData.discordTag || "-"}
- *Motivasi*: ${formData.motivation || "-"}

Mohon verifikasi dan arahan selanjutnya. Terima kasih! #InvictusManeo`;

    return encodeURIComponent(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitted(true);
  };

  const whatsappUrl = `https://wa.me/6285705035765?text=${generateWhatsappMessage()}`;

  return (
    <div className="relative border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] sm:p-10 dark:border-white dark:bg-dark-surface rounded-none">
      
      {/* Header Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between border-b-2 border-slate-900 pb-4 text-xs dark:border-white">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 border border-slate-900 bg-brand-blue animate-pulse rounded-none dark:border-white" />
          <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            FORMULIR PENDAFTARAN RESMI
          </span>
        </div>
        <span className="border border-slate-900 bg-emerald-400 px-3 py-1 font-mono text-[11px] font-bold text-slate-950 uppercase shadow-[2px_2px_0px_0px_#0030FF] rounded-none">
          STATUS: TERBUKA
        </span>
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
                className={`mt-2 w-full border-2 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:outline-none dark:bg-dark-base dark:text-white dark:placeholder-steel-500 ${
                  errors.fullName ? "border-red-500" : "border-slate-900 focus:bg-white dark:border-white"
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
                    className={`flex flex-col items-start p-3.5 text-left border-2 transition-all rounded-none ${
                      isSelected
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
                className={`mt-2 w-full border-2 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:outline-none dark:bg-dark-base dark:text-white dark:placeholder-steel-500 ${
                  errors.gameNickname ? "border-red-500" : "border-slate-900 focus:bg-white dark:border-white"
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
                className={`mt-2 w-full border-2 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-[3px_3px_0px_0px_#0030FF] rounded-none focus:outline-none dark:bg-dark-base dark:text-white dark:placeholder-steel-500 ${
                  errors.whatsapp ? "border-red-500" : "border-slate-900 focus:bg-white dark:border-white"
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="brutal-btn flex w-full items-center justify-center space-x-2 py-4 text-base font-bold tracking-wider rounded-none"
            >
              <span>PROSES DATA & HUBUNGI ADMIN</span>
              <ArrowUpRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-center font-mono text-xs text-slate-600 dark:text-steel-400">
              Data yang kamu masukkan akan diformat otomatis dan diteruskan langsung ke WhatsApp resmi Administrator CEES AREA.
            </p>
          </div>

        </form>
      ) : (
        /* Submission Success */
        <div className="space-y-6 text-center py-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-slate-900 bg-brand-blue text-white shadow-[4px_4px_0px_0px_#0F172A] rounded-none dark:border-white dark:shadow-[4px_4px_0px_0px_#FFFFFF]">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-3xl font-black text-slate-900 uppercase dark:text-white">
              DATA PENDAFTARAN SIAP!
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-700 dark:text-steel-300">
              Terima kasih, <strong className="text-slate-900 dark:text-white">{formData.fullName}</strong> ({formData.gameNickname}). Silakan klik tombol di bawah untuk mengirim data langsung ke WhatsApp Administrator CEES AREA.
            </p>
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
              <span>KIRIM KE WHATSAPP ADMIN SEKARANG</span>
            </a>

            <a
              href={COMMUNITY_INFO.socials.googleForm}
              target="_blank"
              rel="noreferrer"
              className="brutal-btn-outline flex w-full items-center justify-center space-x-2 py-3 text-xs font-bold rounded-none"
            >
              <span>ISI JUGA DI GOOGLE FORM CADANGAN</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <button
              onClick={() => setSubmitted(false)}
              className="font-mono text-xs font-bold text-slate-700 dark:text-steel-300 hover:underline pt-2"
            >
              ← Edit atau isi data ulang
            </button>
          </div>

          {/* Info Badge */}
          <div className="border-2 border-slate-900 bg-slate-50 p-4 text-left font-mono text-xs text-slate-700 dark:border-white dark:bg-dark-base dark:text-steel-400 rounded-none shadow-[3px_3px_0px_0px_#0030FF]">
            <span className="font-bold text-slate-900 dark:text-white uppercase">INFORMASI VERIFIKASI:</span>
            <p className="mt-1">
              Link Discord komunitas akan dikirimkan oleh Administrator setelah verifikasi profil in-game dan nomor WhatsApp kamu aktif.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
