// src/components/forum/CreateThreadModal.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Send,
  Image as ImageIcon,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Swords,
  Crosshair,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ceesAlert } from "@/lib/ceesAlert";
import {
  ForumCategory,
  FORUM_CATEGORIES,
  createForumThread,
  ForumThread,
} from "@/lib/forum/forumHelper";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThreadCreated: (thread: ForumThread) => void;
}

export default function CreateThreadModal({
  isOpen,
  onClose,
  onThreadCreated,
}: CreateThreadModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ForumCategory>("SCRIM_LFT");
  const [gameDivision, setGameDivision] = useState<"PUBGM" | "MLBB" | "ROBLOX" | "GENERAL">("PUBGM");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      ceesAlert.warning({
        title: "LOGIN DIPERLUKAN",
        message: "Kamu harus login sebagai member terverifikasi terlebih dahulu untuk membuat thread baru.",
      });
      return;
    }

    if (!user.verified && user.role !== "admin") {
      ceesAlert.warning({
        title: "AKUN BELUM DIVERIFIKASI",
        message: "Hanya Member Terverifikasi dan Admin HQ yang dapat membuat thread baru di War Room. Silakan verifikasi nomor WhatsApp kamu di Passport Member.",
      });
      return;
    }

    if (!title.trim() || title.length < 5) {
      ceesAlert.warning({
        title: "JUDUL BELUM LENGKAP",
        message: "Judul thread minimal 5 karakter agar topik diskusi jelas.",
      });
      return;
    }

    if (!content.trim() || content.length < 15) {
      ceesAlert.warning({
        title: "ISI DISKUSI TERLALU PENDEK",
        message: "Jelaskan topik diskusimu minimal 15 karakter agar anggota lain bisa merespons.",
      });
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    setSubmitting(true);
    ceesAlert.loading({
      title: "MEMPUBLIKASIKAN THREAD",
      message: "Mengirimkan diskusi ke War Room HQ...",
      showProgress: true,
      progress: 60,
    });

    const res = await createForumThread(
      {
        title,
        category,
        gameDivision,
        content,
        image: imageUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : [gameDivision, category],
      },
      user
    );

    setSubmitting(false);

    if (res.success && res.data) {
      ceesAlert.success(
        "THREAD DIPUBLIKASIKAN!",
        `Diskusi "${title.toUpperCase()}" sekarang sudah tayang di War Room.`
      );
      onThreadCreated(res.data);
      // Reset form
      setTitle("");
      setContent("");
      setImageUrl("");
      setTagsInput("");
      onClose();
    } else {
      ceesAlert.error("GAGAL MEMBUAT THREAD", res.error || "Terjadi kesalahan server.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl border-3 border-slate-900 bg-white p-5 sm:p-7 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base my-auto transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 dark:border-white">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 bg-brand-blue border border-slate-900 dark:bg-brand-cyan animate-pulse" />
            <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              [ WAR ROOM ] // BUAT THREAD DISKUSI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-slate-900 p-1 hover:bg-rose-500 hover:text-white transition-colors dark:border-white dark:hover:bg-rose-600"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-mono text-xs">
          {/* Author Badge Preview */}
          <div className="flex items-center justify-between p-2.5 bg-slate-100 border border-slate-900 dark:bg-dark-surface dark:border-steel-700">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700 dark:text-steel-300">AUTHOR:</span>
              <span className="font-bold uppercase text-slate-950 dark:text-white">
                {user?.gameNickname || user?.displayName || "MEMBER"}
              </span>
              {user?.verified && (
                <span className="inline-flex items-center text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 border border-slate-950">
                  VERIFIED
                </span>
              )}
              {user?.role === "admin" && (
                <span className="inline-flex items-center text-[10px] bg-brand-blue text-white font-black px-1.5 py-0.2">
                  ADMIN HQ
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-steel-400">
              DIVISI: {user?.division || "GENERAL"}
            </span>
          </div>

          {/* Kanal / Kategori Picker */}
          <div>
            <label className="block font-bold uppercase text-slate-900 dark:text-white mb-1.5">
              1. Pilih Kanal Diskusi:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORUM_CATEGORIES.filter((c) => c.id !== "ALL").map((cat) => {
                // Sembunyikan HQ announcement jika bukan admin
                if (cat.id === "HQ_ANNOUNCEMENT" && user?.role !== "admin") return null;

                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`border-2 p-2 text-left font-display text-[11px] font-black uppercase transition-all rounded-none ${
                      isSelected
                        ? "border-slate-900 bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-brand-cyan dark:text-slate-950"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-900 dark:border-steel-700 dark:bg-dark-surface dark:text-steel-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>[{cat.code}]</span>
                      {isSelected && <span className="h-1.5 w-1.5 bg-amber-300 rounded-full" />}
                    </div>
                    <div className="mt-1 leading-tight line-clamp-1">{cat.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Divisi Game */}
          <div>
            <label className="block font-bold uppercase text-slate-900 dark:text-white mb-1.5">
              2. Divisi Game:
            </label>
            <div className="flex flex-wrap gap-2">
              {(["PUBGM", "MLBB", "ROBLOX", "GENERAL"] as const).map((div) => {
                const isSelected = gameDivision === div;
                return (
                  <button
                    key={div}
                    type="button"
                    onClick={() => setGameDivision(div)}
                    className={`border-2 px-3 py-1 font-mono text-xs font-black uppercase rounded-none transition-all ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_#0030FF] dark:border-white dark:bg-white dark:text-slate-950"
                        : "border-slate-300 bg-white text-slate-800 hover:border-slate-900 dark:border-steel-700 dark:bg-dark-surface dark:text-steel-300"
                    }`}
                  >
                    {div === "GENERAL" ? "UMUM / ALL" : div}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Judul Thread */}
          <div>
            <label className="block font-bold uppercase text-slate-900 dark:text-white mb-1">
              3. Judul Diskusi:
            </label>
            <input
              type="text"
              required
              placeholder="CONTOH: [FAST SCRIM] OPEN 4 TIM SLOT MALAM INI TIER 2"
              value={title}
              onChange={(e) => setTitle(e.target.value.toUpperCase())}
              className="w-full border-2 border-slate-900 p-2.5 font-display font-black text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white rounded-none"
            />
          </div>

          {/* Isi Pesan / Konten */}
          <div>
            <label className="block font-bold uppercase text-slate-900 dark:text-white mb-1">
              4. Isi Pesan / Penjelasan Topik:
            </label>
            <textarea
              required
              rows={5}
              placeholder="Tuliskan detail info scrim, taktik, pertanyaan, atau ajakan mabar kamu di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border-2 border-slate-900 p-2.5 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white rounded-none leading-relaxed"
            />
          </div>

          {/* URL Gambar (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase text-slate-900 dark:text-white mb-1 flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Link Foto / Thumbnail (Opsional):</span>
              </label>
              <input
                type="url"
                placeholder="https://... atau /assets/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border-2 border-slate-900 p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white rounded-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-900 dark:text-white mb-1 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                <span>Tagar (Pisahkan koma):</span>
              </label>
              <input
                type="text"
                placeholder="SCRIM, PUBGM, SAMARINDA"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value.toUpperCase())}
                className="w-full border-2 border-slate-900 p-2 text-xs uppercase text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-surface dark:text-white rounded-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 border-t-2 border-slate-900 pt-4 dark:border-white">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border-2 border-slate-900 px-4 py-2.5 font-mono text-xs font-bold uppercase text-slate-800 hover:bg-slate-100 dark:border-white dark:text-steel-200 dark:hover:bg-dark-surface"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="brutal-btn flex items-center space-x-2 px-6 py-2.5 text-xs font-black bg-brand-blue text-white shadow-[3px_3px_0px_0px_#000] hover:bg-blue-600"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? "MEMPUBLIKASIKAN..." : "PUBLIKASIKAN THREAD"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
