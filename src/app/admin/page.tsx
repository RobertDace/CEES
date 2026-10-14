"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Save,
  Users,
  Calendar,
  Home,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Quote,
  ArrowLeft,
  X,
  Eye,
  RefreshCw,
  Terminal,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type TabType = "home" | "quotes" | "staff" | "activities" | "members" | "market";

export default function AdminToolsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Content state
  const [community, setCommunity] = useState<any>({
    name: "CEES AREA",
    memberTerm: "CEES GANK",
    tagline: "INVICTUS MANEO",
    taglineMeaning: "Tetap Tak Terkalahkan",
    establishedDate: "4 Oktober 2024",
    headquarters: "Samarinda, Kalimantan Timur",
    totalMembers: 90,
    socials: {
      whatsapp: "http://wa.me/6285705035765",
      instagram: "http://instagram.com/cees.area",
      tiktok: "http://tiktok.com/ceesgankk",
      googleForm: "",
    },
  });

  const [homeSections, setHomeSections] = useState<any>({
    filosofiTitle: '"INVICTUS MANEO"',
    filosofiText:
      'Diambil dari bahasa Latin yang bermakna "Tetap Tak Terkalahkan". Sebuah ikrar mentalitas bahwa apapun hasil di dalam game, semangat persaudaraan dan daya juang CEES GANK tidak akan pernah padam.',
    regionalTitle: "SAMARINDA & KALTIM",
    regionalText:
      "Berpusat di ibukota Kalimantan Timur dengan anggota aktif tersebar di Kutai Kartanegara, Kutai Timur, Sangatta, Berau, hingga perwakilan di pulau Jawa.",
    solidaritasTitle: "LEBIH DARI SEKADAR MABAR",
    solidaritasText:
      "Tidak hanya bertanding di turnamen dan scrim, kami rutin mengadakan agenda silaturahmi buka bersama, gathering pantai, dan turnamen offline untuk memajukan komunitas lokal.",
  });

  const [quotes, setQuotes] = useState<any>({
    founderQuote:
      "Saya mantan atlet PUBGM lokal yang pengin e-sport Samarinda punya wadah sendiri. Awalnya cuma grup kecil yang sering main bareng. Sekarang kami berdiri bareng.",
    founderHighlight: "berdiri bareng",
    founderVision:
      "Membangun ekosistem e-sport yang sehat dan berkelanjutan, jadi tempat menyalurkan hobi dan bakat, dan membawa nama Samarinda serta Kalimantan Timur ke level nasional.",
    founderTrackRecord:
      "Menggelar Offline Tournament S1 di Mall Robinson Samarinda bareng PAWPAW Samarinda, dua bulan setelah komunitas dideklarasikan.",
    communityQuotes: [
      {
        id: "q1",
        quote: "Bukan sekadar klan mabar biasa, ini rumah bagi talenta kompetitif Samarinda.",
        author: "CEES GANK Community",
      },
      {
        id: "q2",
        quote: "Apapun hasil di dalam turnamen dan scrim, persaudaraan kami tetap tak terkalahkan.",
        author: "Invictus Maneo Spirit",
      },
    ],
  });

  const [staffList, setStaffList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [liveMembers, setLiveMembers] = useState<any[]>([]);
  const [market, setMarket] = useState<any>({
    badge: "OFFICIAL STORE // COMING SOON",
    statusLabel: "FASE 1: PRODUKSI & KURASI",
    estimatedLaunch: "Kuartal 3 - 2026",
    headline: "COMING SOON",
    title: "CEES AREA MARKET",
    subtitle: "Official Merchandise & Community Store CEES GANK Samarinda",
    description:
      "Kami sedang meracik lini merchandise eksklusif dan platform store terpercaya khusus gamers Samarinda dan Kalimantan Timur. Dari jersey resmi bertuliskan nickname impianmu hingga streetwear khas Invictus Maneo.",
    noticeText:
      "Pemberitahuan: Seluruh member terverifikasi CEES GANK berhak mendapatkan potongan harga khusus pada masa peluncuran perdana nanti.",
    contactWhatsapp: "http://wa.me/6285705035765",
    contactButtonText: "Tanya Merchandise / Kemitraan Vendor",
    features: [
      {
        id: "item-1",
        title: "Official Pro Team Jersey",
        category: "JERSEY DIVISI",
        desc: "Jersey dry-fit grade kompetisi resmi divisi PUBGM, MLBB, dan Roblox dengan custom nickname & nomor punggung.",
        badge: "Tahap Sampel Kain",
      },
      {
        id: "item-2",
        title: "Invictus Maneo Streetwear",
        category: "APPAREL & MERCH",
        desc: "T-shirt oversize, zipper hoodie, dan snapback bertema Invictus Maneo untuk outfit mabar maupun daily hangout.",
        badge: "Proses Desain Visual",
      },
      {
        id: "item-3",
        title: "Community Store & Game Top-Up",
        category: "SERVICES & VOUCHER",
        desc: "Layanan top-up diamond MLBB, UC PUBG Mobile, Robux, serta tiket turnamen komunitas yang cepat dan terpercaya.",
        badge: "Integrasi Sistem",
      },
    ],
  });

  // 1. Fetch content from /api/admin/content
  useEffect(() => {
    async function loadContent() {
      try {
        setDataLoading(true);
        const res = await fetch("/api/admin/content");
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.community) setCommunity(json.data.community);
          if (json.data.home) setHomeSections(json.data.home);
          if (json.data.quotes) setQuotes(json.data.quotes);
          if (json.data.staff) setStaffList(json.data.staff);
          if (json.data.activities) setActivitiesList(json.data.activities);
          if (json.data.market) setMarket(json.data.market);
        }
      } catch (err) {
        console.error("Gagal memuat konten situs:", err);
      } finally {
        setDataLoading(false);
      }
    }

    async function loadMembers() {
      try {
        const res = await fetch("/api/join");
        const members = await res.json();
        if (Array.isArray(members)) {
          setLiveMembers(members);
        }
      } catch (err) {
        console.error("Gagal memuat pendaftaran member:", err);
      }
    }

    loadContent();
    loadMembers();
  }, []);

  // Save changes to server
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus(null);
    setErrorStatus(null);
    try {
      const payload = {
        community,
        home: homeSections,
        quotes,
        staff: staffList,
        activities: activitiesList,
        market,
      };

      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSaveStatus("Semua perubahan konten, foto, dan quotes berhasil disimpan secara permanen!");
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setErrorStatus(json.error || "Gagal menyimpan perubahan ke server.");
      }
    } catch (err) {
      setErrorStatus("Terjadi kegagalan jaringan saat menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  // Upload file helper
  const uploadImage = async (file: File, category: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.url;
      } else {
        alert(data.error || "Gagal mengunggah foto.");
        return null;
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat mengunggah foto.");
      return null;
    }
  };

  // Staff helpers
  const handleAddStaff = () => {
    const newStaff = {
      id: "staff-" + Date.now(),
      name: "Nama Pengurus Baru",
      nickname: "Panggilan",
      role: "Administrator",
      division: "Divisi PUBGM",
      image: "/assets/staff/zaden_nata.png",
      bio: "Deskripsi tugas dan tanggung jawab di komunitas CEES AREA.",
      isFounder: false,
    };
    setStaffList([...staffList, newStaff]);
  };

  const handleRemoveStaff = (index: number) => {
    if (confirm("Hapus pengurus ini dari daftar?")) {
      setStaffList(staffList.filter((_, i) => i !== index));
    }
  };

  const handleUpdateStaff = (index: number, field: string, value: any) => {
    const updated = [...staffList];
    updated[index] = { ...updated[index], [field]: value };
    setStaffList(updated);
  };

  const handleStaffPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingField(`staff-${index}`);
    const uploadedUrl = await uploadImage(file, "staff");
    if (uploadedUrl) {
      handleUpdateStaff(index, "image", uploadedUrl);
    }
    setUploadingField(null);
  };

  // Activity helpers
  const handleAddActivity = () => {
    const newAct = {
      id: "act-" + Date.now(),
      title: "JUDUL EVENT BARU",
      subtitle: "Deskripsi singkat event",
      date: "Bulan / Tahun",
      location: "Lokasi Acara",
      partner: "Partner / Sponsor",
      description: "Rincian penjelasan agenda, target peserta, dan dokumentasi kegiatan.",
      image: "/assets/activities/tourney_s1.png",
      gallery: [],
      tag: "TURNAMEN",
      status: "MENDATANG",
    };
    setActivitiesList([newAct, ...activitiesList]);
  };

  const handleRemoveActivity = (index: number) => {
    if (confirm("Hapus agenda kegiatan ini?")) {
      setActivitiesList(activitiesList.filter((_, i) => i !== index));
    }
  };

  const handleUpdateActivity = (index: number, field: string, value: any) => {
    const updated = [...activitiesList];
    updated[index] = { ...updated[index], [field]: value };
    setActivitiesList(updated);
  };

  const handleActivityCoverUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingField(`act-cover-${index}`);
    const uploadedUrl = await uploadImage(file, "event_cover");
    if (uploadedUrl) {
      handleUpdateActivity(index, "image", uploadedUrl);
    }
    setUploadingField(null);
  };

  const handleActivityGalleryUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingField(`act-gallery-${index}`);

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], "gallery");
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      const currentGallery = activitiesList[index].gallery || [];
      handleUpdateActivity(index, "gallery", [...currentGallery, ...newUrls]);
    }
    setUploadingField(null);
  };

  const handleRemoveGalleryPhoto = (actIndex: number, photoIndex: number) => {
    const currentGallery = [...(activitiesList[actIndex].gallery || [])];
    currentGallery.splice(photoIndex, 1);
    handleUpdateActivity(actIndex, "gallery", currentGallery);
  };

  // Quotes helpers
  const handleAddCommunityQuote = () => {
    const newQ = {
      id: "q-" + Date.now(),
      quote: "Tuliskan quotes inspiratif atau motto baru di sini...",
      author: "CEES GANK Member",
    };
    setQuotes({
      ...quotes,
      communityQuotes: [...(quotes.communityQuotes || []), newQ],
    });
  };

  const handleUpdateCommunityQuote = (index: number, field: string, value: string) => {
    const updated = [...(quotes.communityQuotes || [])];
    updated[index] = { ...updated[index], [field]: value };
    setQuotes({ ...quotes, communityQuotes: updated });
  };

  const handleRemoveCommunityQuote = (index: number) => {
    const updated = (quotes.communityQuotes || []).filter((_: any, i: number) => i !== index);
    setQuotes({ ...quotes, communityQuotes: updated });
  };

  // Market helpers
  const handleAddMarketFeature = () => {
    const newFeature = {
      id: "item-" + Date.now(),
      title: "Nama Produk / Layanan Baru",
      category: "KATEGORI PRODUK",
      desc: "Deskripsi material, rincian keunggulan, atau varian produk merchandise.",
      badge: "Segera Hadir",
    };
    setMarket({
      ...market,
      features: [...(market.features || []), newFeature],
    });
  };

  const handleUpdateMarketFeature = (index: number, field: string, value: string) => {
    const updated = [...(market.features || [])];
    updated[index] = { ...updated[index], [field]: value };
    setMarket({ ...market, features: updated });
  };

  const handleRemoveMarketFeature = (index: number) => {
    if (confirm("Hapus item teaser produk ini?")) {
      const updated = (market.features || []).filter((_: any, i: number) => i !== index);
      setMarket({ ...market, features: updated });
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="border-2 border-slate-900 bg-white p-8 font-mono text-sm font-bold uppercase shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base dark:text-white">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-ping bg-brand-blue dark:bg-brand-cyan" />
            <span>MEMVERIFIKASI OTORITAS ADMIN...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in gate
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="border-2 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base sm:p-12">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-3 font-mono text-xs font-bold text-red-600 dark:border-white dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>[ RESTRICTED AREA // AKSES DITOLAK ]</span>
          </div>
          <h1 className="mt-6 font-display text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Sektor Admin Tools Terkunci
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-steel-300">
            Halaman ini khusus pengurus dan staf resmi CEES AREA untuk mengedit teks Home, foto kegiatan, foto pengurus, quotes, dan data komunitas. Silakan login terlebih dahulu.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="brutal-btn flex items-center justify-center gap-2 px-6 py-3 text-xs"
            >
              <Terminal className="h-4 w-4" />
              <span>Buka Terminal Login Admin</span>
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 border-2 border-slate-900 bg-slate-100 px-6 py-3 font-mono text-xs font-bold uppercase text-slate-900 hover:bg-slate-200 dark:border-white dark:bg-dark-surface dark:text-white dark:hover:bg-dark-void"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-200 dark:bg-dark-void">
      {/* 1. Header Banner Strip */}
      <div className="border-b-2 border-slate-900 bg-brand-blue py-2 text-white dark:border-white dark:bg-dark-base">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 font-mono text-[11px] font-bold uppercase tracking-wider sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-brand-cyan">[ CEES AREA // CMS COMMAND CENTER ]</span>
            <span className="hidden opacity-60 sm:inline">// PHOTO UPLOAD & CONTENT SUITE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-brand-cyan">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>OPERATOR: {user.displayName}</span>
            </span>
            <Link href="/login" className="underline hover:text-brand-cyan" title="Keluar / Logout">
              [ LOGOUT ]
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 2. Top Title Bar & Actions */}
        <div className="flex flex-col justify-between gap-4 border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
              <Sliders className="h-4 w-4" />
              <span>ADMIN TOOLS // VISUAL & PHOTO CMS</span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Editor Konten & Foto Web
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-steel-400">
              Upload foto kegiatan, ganti foto pengurus, kelola quotes founder, ubah tulisan home, dan tinjau pendaftar baru.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 border-2 border-slate-900 bg-slate-100 px-4 py-2.5 font-mono text-xs font-bold uppercase text-slate-900 transition-colors hover:bg-slate-200 dark:border-white dark:bg-dark-surface dark:text-white dark:hover:bg-dark-void"
            >
              <span>Preview Web</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="brutal-btn flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "MENYIMPAN..." : "SIMPAN SEMUA PERUBAHAN"}</span>
            </button>
          </div>
        </div>

        {/* 3. Feedback Alert */}
        {saveStatus && (
          <div className="mt-4 flex items-center justify-between border-2 border-emerald-600 bg-emerald-50 p-4 font-mono text-xs font-bold uppercase text-emerald-800 shadow-[4px_4px_0px_0px_#059669] dark:bg-emerald-950/40 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{saveStatus}</span>
            </div>
            <span className="text-[10px] opacity-75">AUTO-SYNCED</span>
          </div>
        )}

        {errorStatus && (
          <div className="mt-4 flex items-center gap-2 border-2 border-red-600 bg-red-50 p-4 font-mono text-xs font-bold uppercase text-red-800 shadow-[4px_4px_0px_0px_#DC2626] dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* 4. Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-b-2 border-slate-900 pb-2 dark:border-white">
          {[
            { id: "home", label: "01. Home & Info", icon: Home },
            { id: "quotes", label: "02. Quotes & Visi", icon: Quote },
            { id: "staff", label: `03. Pengurus & Foto (${staffList.length})`, icon: Users },
            { id: "activities", label: `04. Events & Galeri (${activitiesList.length})`, icon: Calendar },
            { id: "market", label: `05. Market Store (${(market.features || []).length})`, icon: ShoppingBag },
            { id: "members", label: `06. Member Join (${liveMembers.length})`, icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabType)}
                className={`flex items-center gap-2 border-2 border-slate-900 px-4 py-2.5 font-display text-sm font-bold uppercase transition-all dark:border-white ${
                  active
                    ? "bg-brand-blue text-white shadow-[4px_4px_0px_0px_#00F0FF] dark:bg-brand-cyan dark:text-slate-900 dark:shadow-[4px_4px_0px_0px_#0030FF]"
                    : "bg-white text-slate-800 hover:bg-slate-100 dark:bg-dark-base dark:text-steel-200 dark:hover:bg-dark-surface"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: HOME & IDENTITAS */}
        {/* ============================================================== */}
        {activeTab === "home" && (
          <div className="mt-6 space-y-6">
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                Identitas Utama & Slogan Komunitas
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-steel-400">
                Data ini muncul pada Header, Hero Section, dan Footer seluruh halaman website.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Nama Komunitas
                  </label>
                  <input
                    type="text"
                    value={community.name || ""}
                    onChange={(e) => setCommunity({ ...community, name: e.target.value })}
                    className="mt-1 w-full border-2 border-slate-900 p-2.5 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Sebutan Anggota (Member Term)
                  </label>
                  <input
                    type="text"
                    value={community.memberTerm || ""}
                    onChange={(e) => setCommunity({ ...community, memberTerm: e.target.value })}
                    className="mt-1 w-full border-2 border-slate-900 p-2.5 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Tagline Utama (Motto Latin)
                  </label>
                  <input
                    type="text"
                    value={community.tagline || ""}
                    onChange={(e) => setCommunity({ ...community, tagline: e.target.value })}
                    className="mt-1 w-full border-2 border-slate-900 p-2.5 font-display text-base font-bold text-brand-blue dark:border-white dark:bg-dark-surface dark:text-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Arti Tagline (Makna)
                  </label>
                  <input
                    type="text"
                    value={community.taglineMeaning || ""}
                    onChange={(e) => setCommunity({ ...community, taglineMeaning: e.target.value })}
                    className="mt-1 w-full border-2 border-slate-900 p-2.5 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Counter Total Member
                  </label>
                  <input
                    type="number"
                    value={community.totalMembers || 90}
                    onChange={(e) => setCommunity({ ...community, totalMembers: Number(e.target.value) })}
                    className="mt-1 w-full border-2 border-slate-900 p-2.5 font-mono text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Markas / Kota Asal
                  </label>
                  <input
                    type="text"
                    value={community.headquarters || ""}
                    onChange={(e) => setCommunity({ ...community, headquarters: e.target.value })}
                    className="mt-1 w-full border-2 border-slate-900 p-2.5 font-mono text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3 Pilar Kartu Utama */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                3 Pilar Kartu Utama Beranda (Home)
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-steel-400">
                Teks yang muncul pada 3 kotak di bawah Hero Banner (Filosofi, Regional, Solidaritas).
              </p>

              <div className="mt-6 space-y-5">
                <div className="border-2 border-slate-900 p-4 bg-slate-50 dark:border-white dark:bg-dark-surface">
                  <span className="font-mono text-xs font-bold text-brand-blue uppercase dark:text-brand-cyan">
                    [ KARTU 1: FILOSOFI KAMI ]
                  </span>
                  <input
                    type="text"
                    value={homeSections.filosofiTitle || ""}
                    onChange={(e) => setHomeSections({ ...homeSections, filosofiTitle: e.target.value })}
                    className="mt-2 w-full border-2 border-slate-900 p-2 font-display text-base font-bold dark:border-white dark:bg-dark-base dark:text-white"
                  />
                  <textarea
                    rows={3}
                    value={homeSections.filosofiText || ""}
                    onChange={(e) => setHomeSections({ ...homeSections, filosofiText: e.target.value })}
                    className="mt-2 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-base dark:text-steel-200"
                  />
                </div>

                <div className="border-2 border-slate-900 p-4 bg-slate-50 dark:border-white dark:bg-dark-surface">
                  <span className="font-mono text-xs font-bold text-brand-blue uppercase dark:text-brand-cyan">
                    [ KARTU 2: AKAR REGIONAL ]
                  </span>
                  <input
                    type="text"
                    value={homeSections.regionalTitle || ""}
                    onChange={(e) => setHomeSections({ ...homeSections, regionalTitle: e.target.value })}
                    className="mt-2 w-full border-2 border-slate-900 p-2 font-display text-base font-bold dark:border-white dark:bg-dark-base dark:text-white"
                  />
                  <textarea
                    rows={3}
                    value={homeSections.regionalText || ""}
                    onChange={(e) => setHomeSections({ ...homeSections, regionalText: e.target.value })}
                    className="mt-2 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-base dark:text-steel-200"
                  />
                </div>

                <div className="border-2 border-slate-900 p-4 bg-slate-50 dark:border-white dark:bg-dark-surface">
                  <span className="font-mono text-xs font-bold text-amber-500 uppercase">
                    [ KARTU 3: SOLIDARITAS KOMUNITAS ]
                  </span>
                  <input
                    type="text"
                    value={homeSections.solidaritasTitle || ""}
                    onChange={(e) => setHomeSections({ ...homeSections, solidaritasTitle: e.target.value })}
                    className="mt-2 w-full border-2 border-slate-900 p-2 font-display text-base font-bold dark:border-white dark:bg-dark-base dark:text-white"
                  />
                  <textarea
                    rows={3}
                    value={homeSections.solidaritasText || ""}
                    onChange={(e) => setHomeSections({ ...homeSections, solidaritasText: e.target.value })}
                    className="mt-2 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-base dark:text-steel-200"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                Tautan Media Sosial & WhatsApp
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    WhatsApp Link
                  </label>
                  <input
                    type="text"
                    value={community.socials?.whatsapp || ""}
                    onChange={(e) =>
                      setCommunity({
                        ...community,
                        socials: { ...community.socials, whatsapp: e.target.value },
                      })
                    }
                    className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Instagram Link
                  </label>
                  <input
                    type="text"
                    value={community.socials?.instagram || ""}
                    onChange={(e) =>
                      setCommunity({
                        ...community,
                        socials: { ...community.socials, instagram: e.target.value },
                      })
                    }
                    className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    TikTok Link
                  </label>
                  <input
                    type="text"
                    value={community.socials?.tiktok || ""}
                    onChange={(e) =>
                      setCommunity({
                        ...community,
                        socials: { ...community.socials, tiktok: e.target.value },
                      })
                    }
                    className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: QUOTES & VISI */}
        {/* ============================================================== */}
        {activeTab === "quotes" && (
          <div className="mt-6 space-y-6">
            {/* Founder Quote Card */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-3 dark:border-white">
                <Quote className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
                <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                  Quote Utama Founder di Beranda (Section [03])
                </h3>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-steel-400">
                Kalimat motivasi besar Zaden yang tampil menonjol dengan tanda kutip raksasa di halaman Home.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Isi Quotes Founder
                  </label>
                  <textarea
                    rows={4}
                    value={quotes.founderQuote || ""}
                    onChange={(e) => setQuotes({ ...quotes, founderQuote: e.target.value })}
                    className="mt-1 w-full border-2 border-slate-900 p-3 font-display text-lg uppercase leading-snug text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      Teks Visi Komunitas
                    </label>
                    <textarea
                      rows={3}
                      value={quotes.founderVision || ""}
                      onChange={(e) => setQuotes({ ...quotes, founderVision: e.target.value })}
                      className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-surface dark:text-steel-200"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      Teks Rekam Jejak Founder
                    </label>
                    <textarea
                      rows={3}
                      value={quotes.founderTrackRecord || ""}
                      onChange={(e) => setQuotes({ ...quotes, founderTrackRecord: e.target.value })}
                      className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-surface dark:text-steel-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Community Quotes Collection */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 dark:border-white">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                    Quotes & Slogan Tambahan Komunitas ({quotes.communityQuotes?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-steel-400">
                    Dapat digunakan untuk ticker, banner, maupun kutipan member.
                  </p>
                </div>
                <button
                  onClick={handleAddCommunityQuote}
                  className="brutal-btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Quote</span>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {(quotes.communityQuotes || []).map((q: any, i: number) => (
                  <div
                    key={q.id || i}
                    className="flex flex-col gap-3 border-2 border-slate-900 bg-slate-50 p-4 shadow-[3px_3px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.quote || ""}
                        onChange={(e) => handleUpdateCommunityQuote(i, "quote", e.target.value)}
                        placeholder="Quotes atau semboyan..."
                        className="w-full border-2 border-slate-900 p-2 font-display text-sm font-bold dark:border-white dark:bg-dark-base dark:text-white"
                      />
                      <input
                        type="text"
                        value={q.author || ""}
                        onChange={(e) => handleUpdateCommunityQuote(i, "author", e.target.value)}
                        placeholder="Penulis / Label / Divisi..."
                        className="w-full border-2 border-slate-900 p-1.5 font-mono text-xs dark:border-white dark:bg-dark-base dark:text-steel-200"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveCommunityQuote(i)}
                      className="self-end text-red-600 hover:text-red-800 dark:text-red-400 sm:self-center"
                      title="Hapus Quote"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PENGURUS & ROSTER (LITERALLY GANTI & UPLOAD FOTO) */}
        {/* ============================================================== */}
        {activeTab === "staff" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                  Daftar Pengurus & Staff ({staffList.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-steel-400">
                  Kamu bisa langsung <strong>mengunggah foto baru dari galeri/perangkatmu</strong> untuk mengganti foto profil pengurus!
                </p>
              </div>
              <button onClick={handleAddStaff} className="brutal-btn flex items-center gap-1.5 px-4 py-2 text-xs">
                <Plus className="h-4 w-4" />
                <span>Tambah Pengurus</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {staffList.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className={`border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base ${
                    member.isFounder ? "border-l-8 border-l-brand-blue dark:border-l-brand-cyan" : ""
                  }`}
                >
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 dark:border-white">
                    <span className="font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
                      {member.isFounder ? "★ FOUNDER & LEADER" : `STAF #[0${idx + 1}]`}
                    </span>
                    {!member.isFounder && (
                      <button
                        onClick={() => handleRemoveStaff(idx)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                        title="Hapus Pengurus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Foto Profil & Upload Zone */}
                  <div className="mt-4 flex items-center gap-4 border-2 border-slate-900 bg-slate-50 p-3 dark:border-white dark:bg-dark-surface">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden border-2 border-slate-900 bg-slate-200 dark:border-white">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-mono text-[9px] text-slate-400">
                          NO PHOTO
                        </div>
                      )}
                      {uploadingField === `staff-${idx}` && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[8px] text-white">
                          UPLOADING...
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <span className="font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-steel-400">
                        Foto Profil
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="brutal-btn inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-[11px]">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{uploadingField === `staff-${idx}` ? "Mengunggah..." : "Upload Foto Baru"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleStaffPhotoUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                        {member.image && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStaff(idx, "image", "")}
                            className="border-2 border-slate-900 bg-white px-2 py-1 font-mono text-[10px] font-bold text-red-600 hover:bg-red-50 dark:border-white dark:bg-dark-base dark:text-red-400"
                            title="Hapus Foto Profil"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <p className="font-mono text-[9px] text-slate-400 truncate max-w-[240px]">
                        Path: {member.image}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={member.name || ""}
                          onChange={(e) => handleUpdateStaff(idx, "name", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-sm font-bold dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Nickname / Panggilan
                        </label>
                        <input
                          type="text"
                          value={member.nickname || ""}
                          onChange={(e) => handleUpdateStaff(idx, "nickname", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Jabatan / Role
                        </label>
                        <input
                          type="text"
                          value={member.role || ""}
                          onChange={(e) => handleUpdateStaff(idx, "role", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Divisi
                        </label>
                        <input
                          type="text"
                          value={member.division || ""}
                          onChange={(e) => handleUpdateStaff(idx, "division", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                        Biografi / Tanggung Jawab
                      </label>
                      <textarea
                        rows={3}
                        value={member.bio || ""}
                        onChange={(e) => handleUpdateStaff(idx, "bio", e.target.value)}
                        className="mt-1 w-full border-2 border-slate-900 p-2 text-xs dark:border-white dark:bg-dark-surface dark:text-steel-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AGENDA ACTIVITIES & LITERALLY UPLOAD/HAPUS FOTO EVENT */}
        {/* ============================================================== */}
        {activeTab === "activities" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                  Agenda & Galeri Dokumentasi Kegiatan ({activitiesList.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-steel-400">
                  Kamu bisa <strong>upload cover banner event</strong> dan <strong>upload foto galeri kegiatan</strong> langsung dari laptop/HP!
                </p>
              </div>
              <button onClick={handleAddActivity} className="brutal-btn flex items-center gap-1.5 px-4 py-2 text-xs">
                <Plus className="h-4 w-4" />
                <span>Tambah Event Baru</span>
              </button>
            </div>

            <div className="space-y-6">
              {activitiesList.map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3 dark:border-white">
                    <div className="flex items-center gap-2">
                      <span className="border border-slate-900 bg-brand-cyan/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-slate-900 dark:bg-brand-cyan/10 dark:text-brand-cyan">
                        TAG: {act.tag}
                      </span>
                      <span
                        className={`px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${
                          act.status === "SELESAI"
                            ? "bg-slate-200 text-slate-800 dark:bg-dark-surface dark:text-steel-300"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        STATUS: {act.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveActivity(idx)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                      title="Hapus Agenda"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 1. Cover Foto Event Upload */}
                  <div className="mt-4 border-2 border-slate-900 bg-slate-50 p-4 dark:border-white dark:bg-dark-surface">
                    <span className="font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
                      [ COVER BANNER UTAMA EVENT ]
                    </span>
                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative h-28 w-44 shrink-0 overflow-hidden border-2 border-slate-900 bg-slate-200 dark:border-white">
                        {act.image ? (
                          <img src={act.image} alt={act.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-slate-400">
                            NO COVER
                          </div>
                        )}
                        {uploadingField === `act-cover-${idx}` && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[9px] text-white">
                            UPLOADING...
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="brutal-btn inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs">
                          <Upload className="h-4 w-4" />
                          <span>
                            {uploadingField === `act-cover-${idx}` ? "Mengunggah Cover..." : "Upload / Ganti Cover Banner"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleActivityCoverUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                        <p className="font-mono text-[10px] text-slate-500 dark:text-steel-400">
                          Path Cover: <span className="text-slate-800 dark:text-steel-200">{act.image}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Galeri Foto Dokumentasi Event */}
                  <div className="mt-4 border-2 border-slate-900 bg-slate-50 p-4 dark:border-white dark:bg-dark-surface">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
                        [ DOKUMENTASI & GALERI FOTO ({act.gallery?.length || 0} FOTO) ]
                      </span>
                      <label className="brutal-btn inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Upload Foto Galeri</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleActivityGalleryUpload(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Galeri Thumbnails Grid */}
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {(act.gallery || []).map((photoUrl: string, pIdx: number) => (
                        <div
                          key={pIdx}
                          className="group relative aspect-video overflow-hidden border-2 border-slate-900 bg-slate-200 dark:border-white"
                        >
                          <img src={photoUrl} alt="Dokumentasi" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryPhoto(idx, pIdx)}
                            className="absolute top-1 right-1 border border-slate-900 bg-red-600 p-1 text-white opacity-90 transition-opacity hover:opacity-100 dark:border-white"
                            title="Hapus foto ini dari galeri"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {(!act.gallery || act.gallery.length === 0) && (
                        <div className="col-span-full border-2 border-dashed border-slate-300 p-4 text-center font-mono text-xs text-slate-400 dark:border-dark-border">
                          Belum ada foto galeri untuk event ini. Klik &quot;Upload Foto Galeri&quot; di atas untuk menambahkan.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Detail Teks Event */}
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                        Judul Kegiatan
                      </label>
                      <input
                        type="text"
                        value={act.title || ""}
                        onChange={(e) => handleUpdateActivity(idx, "title", e.target.value)}
                        className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold dark:border-white dark:bg-dark-surface dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                        Sub Judul / Keterangan Singkat
                      </label>
                      <input
                        type="text"
                        value={act.subtitle || ""}
                        onChange={(e) => handleUpdateActivity(idx, "subtitle", e.target.value)}
                        className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Tanggal / Waktu
                        </label>
                        <input
                          type="text"
                          value={act.date || ""}
                          onChange={(e) => handleUpdateActivity(idx, "date", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Lokasi Acara
                        </label>
                        <input
                          type="text"
                          value={act.location || ""}
                          onChange={(e) => handleUpdateActivity(idx, "location", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Kategori Tag
                        </label>
                        <select
                          value={act.tag || "TURNAMEN"}
                          onChange={(e) => handleUpdateActivity(idx, "tag", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold dark:border-white dark:bg-dark-surface dark:text-white"
                        >
                          <option value="TURNAMEN">TURNAMEN</option>
                          <option value="GATHERING">GATHERING</option>
                          <option value="BUKBER">BUKBER</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Status Pelaksanaan
                        </label>
                        <select
                          value={act.status || "MENDATANG"}
                          onChange={(e) => handleUpdateActivity(idx, "status", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold dark:border-white dark:bg-dark-surface dark:text-white"
                        >
                          <option value="MENDATANG">MENDATANG</option>
                          <option value="SELESAI">SELESAI</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                        Deskripsi Lengkap
                      </label>
                      <textarea
                        rows={3}
                        value={act.description || ""}
                        onChange={(e) => handleUpdateActivity(idx, "description", e.target.value)}
                        className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-surface dark:text-steel-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: MARKET & MERCHANDISE */}
        {/* ============================================================== */}
        {activeTab === "market" && (
          <div className="mt-6 space-y-6">
            {/* 1. Header Banner */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
                    <ShoppingBag className="h-4 w-4" />
                    <span>MANAJEMEN TOKO & MERCHANDISE (COMING SOON)</span>
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
                    Editor Halaman Market
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-steel-400">
                    Atur teks pengumuman Coming Soon, estimasi peluncuran, benefit member, dan daftar teaser produk yang akan rilis di halaman <strong>/market</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/market"
                    target="_blank"
                    className="flex items-center gap-1.5 border-2 border-slate-900 bg-brand-cyan px-4 py-2 font-mono text-xs font-bold uppercase text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] transition-all hover:bg-white dark:border-white"
                  >
                    <span>Buka Halaman Market</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Headline & Status Settings */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base space-y-6">
              <h4 className="font-display text-lg font-bold uppercase text-slate-900 dark:text-white border-b-2 border-slate-900 pb-2 dark:border-white">
                1. Pengaturan Header & Banner Coming Soon
              </h4>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Badge / Kicker Atas
                  </label>
                  <input
                    type="text"
                    value={market.badge || ""}
                    onChange={(e) => setMarket({ ...market, badge: e.target.value })}
                    placeholder="OFFICIAL STORE // COMING SOON"
                    className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                  <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                    Badge kecil di bagian paling atas halaman.
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Status Fase Rilis
                  </label>
                  <input
                    type="text"
                    value={market.statusLabel || ""}
                    onChange={(e) => setMarket({ ...market, statusLabel: e.target.value })}
                    placeholder="FASE 1: PRODUKSI & KURASI"
                    className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                  <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                    Indikator progress persiapan merchandise.
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Estimasi Waktu Peluncuran
                  </label>
                  <input
                    type="text"
                    value={market.estimatedLaunch || ""}
                    onChange={(e) => setMarket({ ...market, estimatedLaunch: e.target.value })}
                    placeholder="Kuartal 3 - 2026"
                    className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                  <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                    Target waktu pembukaan toko resmi.
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Teks Headline Banner
                  </label>
                  <input
                    type="text"
                    value={market.headline || ""}
                    onChange={(e) => setMarket({ ...market, headline: e.target.value })}
                    placeholder="COMING SOON"
                    className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                  <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                    Teks sorotan utama (default: COMING SOON).
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Judul Utama Halaman
                  </label>
                  <input
                    type="text"
                    value={market.title || ""}
                    onChange={(e) => setMarket({ ...market, title: e.target.value })}
                    placeholder="CEES AREA MARKET"
                    className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-display text-lg font-black text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                  <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                    Judul besar H1 halaman.
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Subjudul / Tagline Toko
                  </label>
                  <input
                    type="text"
                    value={market.subtitle || ""}
                    onChange={(e) => setMarket({ ...market, subtitle: e.target.value })}
                    placeholder="Merchandise resmi CEES GANK, apparel kompetitif, gaming gear..."
                    className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                  <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                    Ringkasan singkat di bawah judul halaman.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                  Deskripsi Narasi Lengkap Coming Soon
                </label>
                <textarea
                  rows={4}
                  value={market.description || ""}
                  onChange={(e) => setMarket({ ...market, description: e.target.value })}
                  className="mt-1.5 w-full border-2 border-slate-900 p-3 text-xs leading-relaxed text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                />
                <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                  Paragraf penjelasan yang menguraikan produk apa saja yang sedang dipersiapkan.
                </span>
              </div>
            </div>

            {/* 3. Notice Member & WhatsApp Action */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base space-y-6">
              <h4 className="font-display text-lg font-bold uppercase text-slate-900 dark:text-white border-b-2 border-slate-900 pb-2 dark:border-white">
                2. Banner Pengumuman & Kontak Pre-Order
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                    Teks Banner Previlese / Diskon Member
                  </label>
                  <input
                    type="text"
                    value={market.noticeText || ""}
                    onChange={(e) => setMarket({ ...market, noticeText: e.target.value })}
                    placeholder="Pemberitahuan: Seluruh member terverifikasi CEES GANK berhak mendapatkan potongan harga..."
                    className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                  />
                  <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                    Pesan yang tampil di banner biru bawah sebagai ajakan daftar member baru.
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      Link / URL WhatsApp Admin (Pre-Order)
                    </label>
                    <input
                      type="text"
                      value={market.contactWhatsapp || ""}
                      onChange={(e) => setMarket({ ...market, contactWhatsapp: e.target.value })}
                      placeholder="http://wa.me/6285705035765"
                      className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-mono text-xs text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                    />
                    <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                      Tujuan saat pengunjung menekan tombol tanya merchandise / pre-order.
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                      Label Teks Tombol Kontak
                    </label>
                    <input
                      type="text"
                      value={market.contactButtonText || ""}
                      onChange={(e) => setMarket({ ...market, contactButtonText: e.target.value })}
                      placeholder="Tanya Merchandise / Kemitraan Vendor"
                      className="mt-1.5 w-full border-2 border-slate-900 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                    />
                    <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-steel-400">
                      Teks tombol WhatsApp pada banner kanan.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Products Teaser List */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base space-y-6">
              <div className="flex flex-col justify-between gap-4 border-b-2 border-slate-900 pb-3 dark:border-white sm:flex-row sm:items-center">
                <div>
                  <h4 className="font-display text-lg font-bold uppercase text-slate-900 dark:text-white">
                    3. Daftar Rencana Produk & Layanan ({market.features?.length || 0})
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-steel-400">
                    Kartu preview barang atau kategori yang akan tersedia di toko resmi.
                  </p>
                </div>

                <button
                  onClick={handleAddMarketFeature}
                  className="brutal-btn flex items-center gap-2 border-2 border-slate-900 bg-brand-cyan px-4 py-2 text-xs font-bold text-slate-900 hover:bg-white"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Rencana Produk</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {(market.features || []).map((feat: any, idx: number) => (
                  <div
                    key={feat.id || idx}
                    className="border-2 border-slate-900 bg-slate-50 p-5 shadow-[4px_4px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface space-y-4"
                  >
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 dark:border-white">
                      <span className="font-mono text-xs font-bold text-brand-blue dark:text-brand-cyan">
                        ITEM #{String(idx + 1).padStart(2, "0")}
                      </span>
                      <button
                        onClick={() => handleRemoveMarketFeature(idx)}
                        className="flex items-center gap-1 font-mono text-xs font-bold text-red-600 hover:underline dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>HAPUS</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Nama / Judul Produk
                        </label>
                        <input
                          type="text"
                          value={feat.title || ""}
                          onChange={(e) => handleUpdateMarketFeature(idx, "title", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                            Kategori / Tag
                          </label>
                          <input
                            type="text"
                            value={feat.category || ""}
                            onChange={(e) => handleUpdateMarketFeature(idx, "category", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                            Status Badge
                          </label>
                          <input
                            type="text"
                            value={feat.badge || ""}
                            onChange={(e) => handleUpdateMarketFeature(idx, "badge", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-steel-400">
                          Deskripsi Produk / Rincian
                        </label>
                        <textarea
                          rows={3}
                          value={feat.desc || ""}
                          onChange={(e) => handleUpdateMarketFeature(idx, "desc", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed text-slate-900 dark:border-white dark:bg-dark-base dark:text-steel-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: MEMBER VERIFICATION */}
        {/* ============================================================== */}
        {activeTab === "members" && (
          <div className="mt-6 space-y-6">
            <div className="border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                Pendaftar Member Baru ({liveMembers.length})
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-steel-400">
                Pendaftaran yang masuk melalui formulir <strong>/join</strong>. Pengurus dapat meninjau data sebelum verifikasi resmi.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-2 border-slate-900 bg-slate-900 text-left text-white dark:border-white dark:bg-dark-void">
                      <th className="p-3">#</th>
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3">In-Game Nick</th>
                      <th className="p-3">Divisi</th>
                      <th className="p-3">Kota</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Waktu Masuk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border-2 border-slate-900 p-6 text-center text-slate-500 dark:border-white">
                          Belum ada member baru yang mendaftar.
                        </td>
                      </tr>
                    ) : (
                      liveMembers.map((m, i) => (
                        <tr
                          key={m.id || i}
                          className="border-2 border-slate-900 bg-white hover:bg-slate-50 dark:border-white dark:bg-dark-base dark:hover:bg-dark-surface"
                        >
                          <td className="p-3 font-bold">{i + 1}</td>
                          <td className="p-3 font-display font-bold text-slate-900 dark:text-white">
                            {m.fullName}
                          </td>
                          <td className="p-3 font-bold text-brand-blue dark:text-brand-cyan">
                            {m.gameNickname}
                          </td>
                          <td className="p-3">
                            <span className="rounded-none border border-slate-900 px-1.5 py-0.5 text-[10px] font-bold dark:border-white">
                              {m.division}
                            </span>
                          </td>
                          <td className="p-3">{m.city}</td>
                          <td className="p-3">
                            <a
                              href={`https://wa.me/${m.whatsapp?.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400"
                            >
                              {m.whatsapp}
                            </a>
                          </td>
                          <td className="p-3 text-[10px] text-slate-500 dark:text-steel-400">
                            {m.timestamp || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. Floating Save Status Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-slate-900 bg-white p-3 shadow-lg dark:border-white dark:bg-dark-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800 dark:text-steel-200">
              SESI ADMIN: {user.displayName} (SEKTOR HQ)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="brutal-btn flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "MENYIMPAN DATA..." : "SIMPAN PERUBAHAN WEB"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
