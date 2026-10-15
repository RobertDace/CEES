"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  ShieldCheck,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  LogOut,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  QrCode,
  User,
  ArrowRight,
  ShieldAlert,
  Camera,
  UploadCloud,
  Loader2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { COMMUNITY_INFO } from "@/data/community";

export default function MemberDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, setActiveSession } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Avatar Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Editable form fields
  const [formData, setFormData] = useState({
    gameId: "",
    discordTag: "",
    city: "Samarinda",
    playerType: "Santai Mabar",
    motivation: "",
    avatarUrl: "/assets/default_avatar.jpg",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle Logout Member dan redirect ke Beranda (Home)
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      window.location.href = "/";
    }
  };

  // Load member profile from API
  const fetchProfile = async (silent = false) => {
    try {
      if (!silent) setLoadingProfile(true);
      else setIsRefreshing(true);

      const res = await fetch(`/api/member/profile?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.success && data.profile) {
        setProfile(data.profile);
        setFormData({
          gameId: data.profile.gameId || "",
          discordTag: data.profile.discordTag || "",
          city: data.profile.city || "Samarinda",
          playerType: data.profile.playerType || "Santai Mabar",
          motivation: data.profile.motivation || "",
          avatarUrl: data.profile.avatarUrl || "/assets/default_avatar.jpg",
        });

        // Selaraskan status di AuthContext jika terjadi perubahan verifikasi / ID
        if (
          user &&
          (user.verified !== Boolean(data.profile.verified) ||
            user.memberId !== data.profile.id ||
            user.gameNickname !== data.profile.gameNickname)
        ) {
          setActiveSession({
            ...user,
            memberId: data.profile.id,
            gameNickname: data.profile.gameNickname,
            displayName: data.profile.gameNickname,
            verified: Boolean(data.profile.verified),
          });
        }
      }
    } catch (err) {
      console.error("Gagal memuat profil member:", err);
    } finally {
      setLoadingProfile(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user?.uid, user?.memberId]);

  // Polling otomatis setiap 12 detik jika kartu masih menunggu verifikasi admin
  useEffect(() => {
    if (!profile || profile.verified || user?.role === "admin") return;
    const interval = setInterval(() => {
      fetchProfile(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [profile?.verified, user?.role]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProfile(data.profile);
        setIsEditing(false);
        setSaveStatus("Profil member berhasil diperbarui!");
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        alert(data.error || "Gagal memperbarui profil.");
      }
    } catch (err) {
      alert("Terjadi gangguan jaringan saat menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Member ID
  const handleCopyId = () => {
    const idToCopy = profile?.id ? `CEES-${profile.id.slice(-6).toUpperCase()}` : "CEES-MEMBER";
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // Kompresi foto secara cerdas di sisi browser untuk menjaga kualitas tinggi & upload super cepat
  const compressImage = async (file: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/") || file.type.includes("svg")) {
        return resolve(file);
      }

      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDimension = 1080;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.88
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  // Handle Avatar Upload
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // Validasi Ekstensi & MIME
    const fileName = rawFile.name.toLowerCase();
    const isImage =
      rawFile.type.startsWith("image/") ||
      [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".jfif", ".bmp"].some((ext) =>
        fileName.endsWith(ext)
      );

    if (!isImage) {
      setAvatarError("Format file harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }

    if (rawFile.size > 20 * 1024 * 1024) {
      setAvatarError("Ukuran file foto maksimal 20 MB.");
      return;
    }

    setAvatarError(null);
    setIsUploadingAvatar(true);

    try {
      // Kompres otomatis jika foto kamera beresolusi sangat besar
      const processedBlob = await compressImage(rawFile);
      const uploadFile =
        processedBlob instanceof File
          ? processedBlob
          : new File([processedBlob], rawFile.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
            });

      const uploadData = new FormData();
      uploadData.append("avatar", uploadFile);
      if (user?.memberId) uploadData.append("memberId", user.memberId);
      if (user?.gameNickname) uploadData.append("nickname", user.gameNickname);

      const res = await fetch("/api/member/avatar", {
        method: "POST",
        body: uploadData,
        credentials: "include",
      });
      const result = await res.json();

      if (res.ok && result.success && result.avatarUrl) {
        setProfile((prev: any) => ({ ...prev, avatarUrl: result.avatarUrl }));
        setFormData((prev) => ({ ...prev, avatarUrl: result.avatarUrl }));
        if (user) {
          setActiveSession({ ...user, avatarUrl: result.avatarUrl });
        }
        setSaveStatus("Foto profil kartu member berhasil diperbarui!");
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setAvatarError(result.error || "Gagal mengunggah foto profil.");
      }
    } catch (err) {
      setAvatarError("Terjadi gangguan jaringan saat mengunggah foto.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center p-6">
        <div className="border-2 border-slate-900 bg-white p-8 font-mono text-xs font-bold uppercase shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base dark:text-white">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-ping bg-brand-blue dark:bg-brand-cyan" />
            <span>MEMUAT KARTU & IDENTITAS MEMBER...</span>
          </div>
        </div>
      </div>
    );
  }

  // Jika tidak ada user login atau sesi tidak ditemukan
  if (!user) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center p-6">
        <div className="max-w-md border-2 border-slate-900 bg-white p-8 text-center shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" />
          <h2 className="mt-4 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
            Akses Terkunci
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-steel-300">
            Halaman ini khusus member resmi CEES AREA. Silakan masuk terlebih dahulu melalui Portal Member.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="w-full flex-1 brutal-btn flex items-center justify-center gap-2 py-3 text-xs border-2 border-slate-900 bg-white dark:bg-dark-surface dark:border-white text-slate-900 dark:text-white"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/login"
              className="w-full flex-1 brutal-btn flex items-center justify-center gap-2 py-3 text-xs bg-brand-cyan text-slate-900"
            >
              <span>Buka Portal Login</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const memberCode = profile?.id ? `CEES-${profile.id.slice(-6).toUpperCase()}` : "CEES-MEMBER";
  const displayNick = profile?.gameNickname || user.gameNickname || user.displayName;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-200 dark:bg-dark-void">
      {/* Top Banner Strip */}
      <div className="border-b-2 border-slate-900 bg-brand-blue py-2 text-white dark:border-white dark:bg-dark-base">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 font-mono text-[11px] font-bold uppercase tracking-wider sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-brand-cyan">[ CEES AREA // MEMBER COMMAND HUB ]</span>
            <span className="hidden opacity-60 sm:inline">// DIGITAL ID & COMMUNITY PASSPORT</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`uppercase font-bold ${profile?.verified ? "text-emerald-300 dark:text-emerald-400" : "text-brand-cyan"}`}>
              {profile?.verified ? "✓ TERVERIFIKASI WA" : "MENUNGGU KONFIRMASI WA"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="underline hover:text-brand-cyan cursor-pointer transition-colors disabled:opacity-50"
              title="Keluar Akun dan Kembali ke Beranda"
            >
              {isLoggingOut ? "[ KELUAR... ]" : "[ LOGOUT ]"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Admin Shortcut Banner */}
        {user?.role === "admin" && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-slate-900 bg-brand-cyan p-4 shadow-[5px_5px_0px_0px_#0030FF] dark:border-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-slate-900 bg-white dark:border-white">
                <ShieldCheck className="h-6 w-6 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-black uppercase text-slate-900">
                  SESI AKSES: ADMINISTRATOR / PENGURUS RESMI CEES AREA
                </h3>
                <p className="text-[11px] text-slate-800">
                  Anda memiliki otoritas penuh untuk mengelola konten web, berita, market store, dan daftar anggota di Admin Tools CMS.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="brutal-btn flex shrink-0 items-center gap-2 border-2 border-slate-900 bg-white px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-50 transition-all dark:border-white"
            >
              <span>Buka Admin Tools CMS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Pending Verification Notice for regular members */}
        {!profile?.verified && user?.role !== "admin" && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-amber-500 bg-amber-50 p-4 font-mono text-xs text-amber-900 shadow-[4px_4px_0px_0px_#D97706] dark:border-amber-400 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-amber-600 animate-pulse" />
              <div>
                <p className="font-bold uppercase">Status Pendaftaran: Menunggu Konfirmasi WhatsApp Admin</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Data pendaftaran Anda telah tercatat. Hubungi admin via WhatsApp untuk mempercepat verifikasi kartu member resmi Anda.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fetchProfile(true)}
                disabled={isRefreshing}
                className="brutal-btn flex items-center gap-1.5 border-2 border-slate-900 bg-white px-3 py-1.5 font-display text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-50 transition-colors disabled:opacity-60"
                title="Cek apakah admin sudah memverifikasi akun Anda"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Mengecek..." : "Cek Status Terkini"}</span>
              </button>
              <a
                href="https://wa.me/6285705035765?text=Halo%20Admin%20CEES%20GANK,%20saya%20sudah%20mendaftar%20di%20website%20dan%20ingin%20mengonfirmasi%20akun%20member%20saya."
                target="_blank"
                rel="noreferrer"
                className="brutal-btn shrink-0 border-2 border-slate-900 bg-emerald-500 px-3.5 py-1.5 font-display text-xs font-bold text-white shadow-[2px_2px_0px_0px_#000000] hover:bg-emerald-600 transition-colors"
              >
                Hubungi Admin via WA
              </a>
            </div>
          </div>
        )}

        {/* Verified Notice for verified members */}
        {profile?.verified && user?.role !== "admin" && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-emerald-600 bg-emerald-50 p-4 font-mono text-xs text-emerald-900 shadow-[4px_4px_0px_0px_#059669] dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold uppercase">Status Anggota: Resmi & Terverifikasi Admin ✓</p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Selamat! Kartu tanda anggota resmi CEES AREA Anda telah aktif penuh dan tercatat di Roster Komunitas.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="border-2 border-emerald-700 bg-white dark:bg-dark-surface px-3 py-1 font-mono text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-300 shadow-[2px_2px_0px_0px_#059669]">
                ✓ VERIFIED MEMBER
              </span>
            </div>
          </div>
        )}

        {/* Save notification */}
        {saveStatus && (
          <div className="mb-6 flex items-center gap-2 border-2 border-emerald-600 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* KOLOM KIRI: KARTU MEMBER DIGITAL (5 Col) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="flex items-center justify-between pb-2">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-steel-400">
                  // KARTU TANDA ANGGOTA RESMI
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-brand-blue hover:underline dark:text-brand-cyan"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedId ? "ID TERSALIN!" : "SALIN ID"}</span>
                </button>
              </div>

              {/* THE NEO-BRUTALIST DIGITAL MEMBER CARD */}
              <div className="relative overflow-hidden border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base sm:p-7">
                {/* Holographic Top Bar */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 dark:border-white">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-brand-cyan shadow-[1px_1px_0px_0px_#000000]" />
                    <span className="font-mono text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white">
                      CEES AREA GANK
                    </span>
                  </div>
                  <span className="border border-brand-blue bg-brand-blue px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white uppercase">
                    {memberCode}
                  </span>
                </div>

                {/* Card Body */}
                <div className="mt-6 flex items-start gap-4 sm:gap-5">
                  {/* Avatar / Photo with Direct Upload Trigger */}
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                      className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden border-2 border-slate-900 bg-slate-100 shadow-[3px_3px_0px_0px_#000000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface sm:h-24 sm:w-24"
                      title="Klik untuk upload / ganti foto profil kartu member"
                    >
                      <Image
                        src={profile?.avatarUrl || "/assets/default_avatar.jpg"}
                        alt={displayNick}
                        fill
                        className="object-cover transition-opacity duration-150 group-hover:opacity-50"
                        unoptimized
                      />

                      {/* Hover Overlay or Upload Spinner */}
                      {isUploadingAvatar ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-1 text-center font-mono text-[9px] font-bold text-white">
                          <Loader2 className="mb-1 h-5 w-5 animate-spin text-brand-cyan" />
                          <span>UPLOADING</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 p-1 font-mono text-[9px] font-bold text-white opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100">
                          <Camera className="mb-1 h-5 w-5 text-brand-cyan" />
                          <span className="leading-tight text-center">GANTI FOTO</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Button Below Avatar for Mobile/Direct click */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="mt-2 flex w-full items-center justify-center gap-1 border border-slate-900 bg-white py-1 px-1 font-mono text-[9px] font-black uppercase text-slate-900 shadow-[1px_1px_0px_0px_#000000] hover:bg-brand-cyan hover:text-slate-900 disabled:opacity-50 dark:border-white dark:bg-dark-base dark:text-white"
                      title="Upload foto profil dari galeri / file"
                    >
                      <Camera className="h-2.5 w-2.5 text-brand-blue dark:text-brand-cyan" />
                      <span>{isUploadingAvatar ? "MENGUNGGAH..." : "GANTI FOTO"}</span>
                    </button>
                  </div>

                  {/* Nickname & Division Details */}
                  <div className="min-w-0 flex-1">
                    <span className="border border-slate-900 bg-brand-cyan px-2 py-0.5 font-mono text-[10px] font-extrabold text-slate-900 uppercase">
                      DIVISI {profile?.division || "ALL DIVISI"}
                    </span>
                    <h2 className="mt-1.5 truncate font-display text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      {displayNick}
                    </h2>
                    <p className="font-mono text-xs font-semibold text-slate-500 dark:text-steel-400">
                      ID: {profile?.gameId || "Belum diisi"}
                    </p>
                  </div>
                </div>

                {/* Card Info Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t-2 border-slate-900 pt-4 font-mono text-xs dark:border-white">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase dark:text-steel-400">Status Anggota</span>
                    <p className={`font-bold uppercase ${profile?.verified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {profile?.verified ? "✓ TERVERIFIKASI WA" : "MENUNGGU KONFIRMASI WA"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase dark:text-steel-400">Tipe Player</span>
                    <p className="font-bold text-slate-900 uppercase dark:text-white">
                      {profile?.playerType || "Santai Mabar"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase dark:text-steel-400">Domisili</span>
                    <p className="font-bold text-slate-900 uppercase dark:text-white">
                      {profile?.city || "Samarinda"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase dark:text-steel-400">Bergabung</span>
                    <p className="font-bold text-slate-900 uppercase dark:text-white">
                      {profile?.joinedAt ? String(profile.joinedAt).slice(0, 11) : "2024"}
                    </p>
                  </div>
                </div>

                {/* Card Footer Barcode Effect */}
                <div className="mt-6 border-t-2 border-dashed border-slate-300 pt-4 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-slate-400 dark:text-steel-500">
                      <span>|||||</span>
                      <span>|||||||</span>
                      <span>||||</span>
                      <span>|||||||||</span>
                      <span>|||</span>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase">
                      INVICTUS MANEO
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Action Shortcuts */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/market"
                  className="brutal-btn flex items-center justify-center gap-2 border-2 border-slate-900 bg-white py-3 text-center text-xs font-bold text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] hover:bg-slate-50 dark:border-white dark:bg-dark-surface dark:text-white"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Market CEES</span>
                </Link>
                <Link
                  href="/#roster"
                  className="brutal-btn flex items-center justify-center gap-2 border-2 border-slate-900 bg-white py-3 text-center text-xs font-bold text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] hover:bg-slate-50 dark:border-white dark:bg-dark-surface dark:text-white"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Live Roster</span>
                </Link>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: PENGATURAN BIODATA & DATA GAME (7 Col) */}
          <div className="lg:col-span-7">
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base sm:p-8">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 dark:border-white">
                <div>
                  <h3 className="font-display text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Pengaturan Profil Member
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-steel-400">
                    Perbarui ID Game, akun Discord, atau domisili kompetisimu.
                  </p>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 border-2 border-slate-900 bg-brand-cyan px-3.5 py-1.5 font-mono text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-white"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>EDIT DATA</span>
                  </button>
                )}
              </div>

              {/* Photo Upload Section */}
              <div className="mt-6 border-2 border-dashed border-slate-300 bg-slate-50 p-4 dark:border-dark-border dark:bg-dark-surface/50">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-dark-base overflow-hidden">
                    <Image
                      src={profile?.avatarUrl || "/assets/default_avatar.jpg"}
                      alt={displayNick}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-mono text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                      <span>Foto Profil Kartu Member</span>
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-steel-400">
                      Gunakan foto terbaikmu (JPG, PNG, WebP maks. 5MB). Foto akan langsung tampil di Kartu Tanda Anggota Digital dan daftar Live Roster.
                    </p>
                    {avatarError && (
                      <p className="mt-1.5 font-mono text-[10px] font-bold text-red-600 dark:text-red-400">
                        ⚠️ {avatarError}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="flex shrink-0 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-mono text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-brand-cyan hover:text-slate-900 disabled:opacity-50 dark:border-white dark:bg-dark-base dark:text-white"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-blue dark:text-brand-cyan" />
                        <span>MENGUNGGAH...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                        <span>UNGGAH FOTO</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Profil */}
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      Game Nickname (Permanen)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile?.gameNickname || displayNick}
                      className="mt-1.5 w-full border-2 border-slate-300 bg-slate-100 py-2.5 px-3.5 font-mono text-xs font-bold text-slate-600 dark:border-dark-border dark:bg-dark-surface dark:text-steel-400"
                    />
                    <span className="text-[10px] text-slate-400">*Hubungi pengurus untuk ganti nickname</span>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      ID In-Game
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.gameId}
                      onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                      placeholder="Contoh: 171745064 (Role)"
                      className="mt-1.5 w-full border-2 border-slate-900 bg-white py-2.5 px-3.5 font-mono text-xs font-medium text-slate-900 focus:border-brand-blue focus:outline-none disabled:border-slate-300 disabled:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:disabled:bg-dark-void"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      Discord Tag
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.discordTag}
                      onChange={(e) => setFormData({ ...formData, discordTag: e.target.value })}
                      placeholder="username#1234 atau username"
                      className="mt-1.5 w-full border-2 border-slate-900 bg-white py-2.5 px-3.5 font-sans text-xs font-medium text-slate-900 focus:border-brand-blue focus:outline-none disabled:border-slate-300 disabled:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:disabled:bg-dark-void"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      Domisili / Kota
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Samarinda, Balikpapan, dll."
                      className="mt-1.5 w-full border-2 border-slate-900 bg-white py-2.5 px-3.5 font-sans text-xs font-medium text-slate-900 focus:border-brand-blue focus:outline-none disabled:border-slate-300 disabled:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:disabled:bg-dark-void"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Tipe Player
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.playerType}
                    onChange={(e) => setFormData({ ...formData, playerType: e.target.value })}
                    className="mt-1.5 w-full border-2 border-slate-900 bg-white py-2.5 px-3.5 font-sans text-xs font-medium text-slate-900 focus:border-brand-blue focus:outline-none disabled:border-slate-300 disabled:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:disabled:bg-dark-void"
                  >
                    <option value="Kompetitif">Kompetitif (Tournament & Scrim Grinder)</option>
                    <option value="Santai Mabar">Santai Mabar (Casual & Hangout)</option>
                    <option value="Keduanya">Keduanya (All-Rounder)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Motto / Motivasi di CEES GANK
                  </label>
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Tuliskan motto atau motivasimu bersama keluarga CEES AREA..."
                    className="mt-1.5 w-full border-2 border-slate-900 bg-white py-2.5 px-3.5 font-sans text-xs font-medium text-slate-900 focus:border-brand-blue focus:outline-none disabled:border-slate-300 disabled:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:disabled:bg-dark-void"
                  />
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="border-2 border-slate-900 bg-slate-100 px-5 py-2.5 font-mono text-xs font-bold uppercase text-slate-800 hover:bg-slate-200 dark:border-white dark:bg-dark-surface dark:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="brutal-btn flex items-center gap-2 border-2 border-slate-900 bg-brand-cyan px-6 py-2.5 text-xs font-bold text-slate-900 shadow-[3px_3px_0px_0px_#0030FF]"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}</span>
                    </button>
                  </div>
                )}
              </form>

              {/* Data Privasi Note */}
              <div className="mt-8 border-t border-slate-200 pt-4 text-[11px] text-slate-500 dark:border-dark-border dark:text-steel-400">
                🔒 <strong>Keamanan Data:</strong> Nomor WhatsApp dan nama lengkap asli kamu dilindungi dan tidak ditampilkan ke publik di forum atau profil luar. Hanya Nickname dan divisi yang terlihat oleh member lain.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
