import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import {
  ShoppingBag,
  Sparkles,
  Clock,
  ShieldCheck,
  MessageCircle,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Tag,
  Truck,
  Layers,
} from "lucide-react";
import { MARKET_DATA, MarketContent, COMMUNITY_INFO } from "@/data/community";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Market | CEES AREA - Official Merchandise & Store",
  description:
    "Official Merchandise CEES AREA (CEES GANK). Dapatkan jersey kompetisi resmi, streetwear Invictus Maneo, dan voucher game lokal Samarinda.",
};

function getMarketContent(): MarketContent {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "siteContent.json");
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(fileData);
      if (json.market) {
        return {
          ...MARKET_DATA,
          ...json.market,
          features: Array.isArray(json.market.features)
            ? json.market.features
            : MARKET_DATA.features,
        };
      }
    }
  } catch (err) {
    console.error("Gagal membaca siteContent.json di /market:", err);
  }
  return MARKET_DATA;
}

export default function MarketPage() {
  const content = getMarketContent();

  return (
    <div className="min-h-screen py-12 lg:py-20 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ==================================================================== */}
        {/* 1. Header & Breadcrumb Strip */}
        {/* ==================================================================== */}
        <div className="border-b-2 border-slate-900 pb-8 dark:border-white">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-brand-blue dark:bg-dark-surface dark:text-brand-cyan">
              <ShoppingBag className="h-4 w-4" />
              <span className="font-mono uppercase tracking-wider">
                {content.badge || "OFFICIAL STORE // COMING SOON"}
              </span>
            </div>

            <div className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-amber-300 px-3 py-1 font-mono text-xs font-bold uppercase text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] dark:border-white">
              <Clock className="h-3.5 w-3.5" />
              <span>ESTIMASI: {content.estimatedLaunch || "Kuartal 3 - 2026"}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand-blue dark:text-brand-cyan">
              [ {content.statusLabel || "FASE 1: PRODUKSI & KURASI"} ]
            </span>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white leading-[1.05]">
              {content.title || "CEES AREA MARKET"}
            </h1>
          </div>

          <p className="mt-4 max-w-3xl font-display text-lg font-semibold tracking-wide text-brand-blue dark:text-brand-cyan sm:text-xl leading-snug">
            {content.subtitle ||
              "Merchandise resmi CEES GANK, apparel kompetitif, gaming gear, dan layanan store komunitas segera hadir."}
          </p>
        </div>

        {/* ==================================================================== */}
        {/* 2. Hero Coming Soon Highlight Banner */}
        {/* ==================================================================== */}
        <div className="mt-10 border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface sm:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Narrative */}
            <div className="space-y-6 lg:col-span-8">
              <div className="inline-flex items-center gap-2 border-2 border-slate-900 bg-brand-cyan px-3 py-1 font-mono text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] dark:border-white">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{content.headline || "COMING SOON"}</span>
              </div>

              <div className="space-y-4">
                <h2 className="font-display text-2xl font-black uppercase text-slate-900 sm:text-3xl dark:text-white leading-tight">
                  Koleksi Eksklusif & Store Resmi Komunitas Sedang Dipersiapkan
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-steel-200">
                  {content.description}
                </p>
              </div>

              {/* Status Checklist */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                <div className="flex items-start gap-2.5 border-2 border-slate-900 bg-slate-50 p-3 shadow-[2px_2px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs leading-tight">
                    <span className="block font-bold text-slate-900 dark:text-white uppercase">
                      Desain Original
                    </span>
                    <span className="text-slate-600 dark:text-steel-400">
                      Identitas visual Invictus Maneo
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-2 border-slate-900 bg-slate-50 p-3 shadow-[2px_2px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan" />
                  <div className="text-xs leading-tight">
                    <span className="block font-bold text-slate-900 dark:text-white uppercase">
                      Pengiriman Lokal
                    </span>
                    <span className="text-slate-600 dark:text-steel-400">
                      Samarinda, Kaltim & se-Indonesia
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-2 border-slate-900 bg-slate-50 p-3 shadow-[2px_2px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div className="text-xs leading-tight">
                    <span className="block font-bold text-slate-900 dark:text-white uppercase">
                      Kualitas Juara
                    </span>
                    <span className="text-slate-600 dark:text-steel-400">
                      Material nyaman standar turnamen
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Info Card */}
            <div className="flex flex-col justify-between border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-[6px_6px_0px_0px_#00F0FF] dark:border-white dark:bg-dark-void lg:col-span-4">
              <div>
                <div className="flex items-center justify-between border-b border-white/20 pb-3 font-mono text-xs font-bold uppercase text-brand-cyan">
                  <span>[ STATUS TOKO ]</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="font-display text-4xl font-black uppercase text-white tracking-wider">
                    COMING SOON
                  </div>
                  <p className="font-mono text-xs text-steel-300 leading-relaxed">
                    Kami memprioritaskan kualitas jahitan dan kenyamanan bahan sebelum membuka pesanan publik.
                  </p>
                </div>

                <div className="mt-6 border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-brand-cyan uppercase">
                    <Flame className="h-4 w-4 text-brand-cyan shrink-0" />
                    <span>Dukungan Resmi PAWPAW</span>
                  </div>
                  <p className="mt-1 text-xs text-steel-300 leading-relaxed">
                    Didukung mitra resmi {COMMUNITY_INFO.sponsor.name} untuk produksi dan distribusi merchandise.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={content.contactWhatsapp || COMMUNITY_INFO.socials.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 border-2 border-white bg-brand-cyan px-4 py-3 font-display text-xs font-black uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_#FFFFFF] transition-all hover:bg-white hover:text-slate-900"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="whitespace-nowrap">
                    {content.contactButtonText || "Tanya Merchandise via WA"}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. Product Teaser Cards Grid */}
        {/* ==================================================================== */}
        <div className="mt-16">
          <div className="flex flex-col justify-between gap-3 border-b-2 border-slate-900 pb-4 dark:border-white sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
                <Layers className="h-4 w-4" />
                <span>KATALOG YANG AKAN DATANG</span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Rencana Lini Produk & Layanan
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500 dark:text-steel-400">
              Total {content.features.length} Kategori Utama
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.features.map((item, index) => (
              <div
                key={item.id || `feat-${index}`}
                className="group relative flex flex-col justify-between border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 border-b-2 border-slate-900 pb-3 dark:border-white">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-cyan">
                      {item.category || "PRODUK RESMI"}
                    </span>
                    <span className="border border-slate-900 bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-900 dark:border-white dark:bg-amber-300">
                      {item.badge || "Segera Hadir"}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-steel-500">
                      <Tag className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
                      <span className="font-mono text-xs font-bold">PRODUK #{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-black uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-steel-300">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t-2 border-slate-100 pt-4 dark:border-dark-border">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-steel-400">
                    <span>STATUS PERILISAN</span>
                    <span className="text-brand-blue dark:text-brand-cyan font-display uppercase tracking-wider">
                      TERJADWAL
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 4. Notice & Community Discount Callout */}
        {/* ==================================================================== */}
        {content.noticeText && (
          <div className="mt-14 border-2 border-slate-900 bg-brand-blue p-6 text-white shadow-[6px_6px_0px_0px_#00F0FF] dark:border-white dark:bg-dark-base sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-cyan">
                  <Flame className="h-4 w-4" />
                  <span>PREVILESE MEMBER CEES GANK</span>
                </div>
                <p className="max-w-2xl text-sm sm:text-base font-semibold leading-relaxed text-white">
                  {content.noticeText}
                </p>
              </div>

              <Link
                href="/join"
                className="brutal-btn flex items-center justify-center gap-2 border-white bg-brand-cyan px-5 py-3 text-xs font-black uppercase text-slate-900 hover:bg-white shrink-0"
              >
                <span>Daftar Member Sekarang</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 5. Vendor & Partnership Inquiries */}
        {/* ==================================================================== */}
        <div className="mt-14 border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface sm:p-8">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
            <div className="space-y-2 md:col-span-8">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-steel-400">
                [ KERJASAMA VENDOR & PRE-ORDER KHUSUS ]
              </span>
              <h3 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white leading-tight">
                Punya Konveksi, Vendor Merchandise, atau Minat Beli Kolektif?
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-steel-300">
                Kami menyambut mitra konveksi lokal Samarinda & Kaltim serta pesanan jersey kustom untuk tim/komunitas esport lain. Hubungi pengurus kami untuk diskusi portofolio sample dan penawaran.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <a
                href={content.contactWhatsapp || COMMUNITY_INFO.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="brutal-btn flex items-center justify-center gap-2 py-3 text-xs font-bold text-center"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="whitespace-nowrap">Hubungi Pengurus via WA</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <Link
                href="/about"
                className="flex items-center justify-center gap-2 border-2 border-slate-900 bg-slate-100 py-3 font-mono text-xs font-bold uppercase text-slate-900 hover:bg-slate-200 dark:border-white dark:bg-dark-base dark:text-white dark:hover:bg-dark-surface text-center"
              >
                <span>Lihat Profil Komunitas</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
