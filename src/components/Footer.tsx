"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Shield, MapPin, ExternalLink, Flame, Trophy } from "lucide-react";
import { COMMUNITY_INFO } from "@/data/community";
import { BrandLogo } from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="relative border-t-2 border-brand-blue bg-white text-slate-600 transition-colors duration-200 dark:bg-dark-void dark:text-steel-300">
      {/* Top Banner / Motto Marquee */}
      <div className="overflow-hidden bg-brand-blue py-2.5 text-white">
        <div className="flex animate-marquee whitespace-nowrap font-display text-sm font-bold tracking-widest uppercase">
          <span className="mx-6 flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-cyan" /> INVICTUS MANEO — TETAP TAK TERKALAHKAN
          </span>
          <span className="mx-6 text-brand-cyan">✦</span>
          <span className="mx-6 flex items-center gap-2">
            <Shield className="h-4 w-4 text-white" /> CEES AREA OFFICIAL ESPORT COMMUNITY
          </span>
          <span className="mx-6 text-brand-cyan">✦</span>
          <span className="mx-6 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-300" /> SAMARINDA, KALIMANTAN TIMUR
          </span>
          <span className="mx-6 text-brand-cyan">✦</span>
          <span className="mx-6 flex items-center gap-2">
            PUBG MOBILE • MOBILE LEGENDS • ROBLOX
          </span>
          <span className="mx-6 text-brand-cyan">✦</span>
          <span className="mx-6 flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-cyan" /> INVICTUS MANEO — TETAP TAK TERKALAHKAN
          </span>
          <span className="mx-6 text-brand-cyan">✦</span>
          <span className="mx-6 flex items-center gap-2">
            <Shield className="h-4 w-4 text-white" /> CEES AREA OFFICIAL ESPORT COMMUNITY
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Col 1: Identity & Motto */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <BrandLogo width={140} height={60} className="h-10 w-auto" />
              <div>
                <h3 className="font-display text-2xl font-black tracking-wider text-slate-900 dark:text-white">
                  CEES AREA
                </h3>
                <p className="text-xs font-semibold text-brand-blue dark:text-brand-cyan">
                  HOMELAND OF THE CEES GANK
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-steel-300">
              Komunitas E-Sport independen asal Samarinda, Kalimantan Timur yang berdiri sejak 4 Oktober 2024. Mewadahi talenta kompetitif dan pegiat game di divisi PUBG Mobile, Mobile Legends, dan Roblox.
            </p>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-steel-400">
              <MapPin className="h-4 w-4 text-brand-blue" />
              <span>Samarinda, Kalimantan Timur, Indonesia</span>
            </div>

            {/* Supported By Section */}
            <div className="border-2 border-slate-900 bg-slate-50 p-4 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-steel-300">
                Sponsor & Mitra Strategis Resmi
              </span>
              <div className="mt-2 flex items-center justify-between">
                <a
                  href={COMMUNITY_INFO.sponsor.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center space-x-3"
                >
                  <div className="relative h-9 w-28 border-2 border-slate-900 bg-white p-1 shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-void">
                    <Image
                      src={COMMUNITY_INFO.sponsor.logo}
                      alt="PAWPAW Samarinda"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-display text-sm font-bold text-slate-900 group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan">
                    PAWPAW SAMARINDA
                  </span>
                </a>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="border-b-2 border-slate-900 pb-2 font-display text-base font-bold tracking-wider text-slate-900 uppercase dark:border-white dark:text-white">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/" className="hover:text-brand-blue dark:hover:text-brand-cyan transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-blue dark:hover:text-brand-cyan transition-colors">
                  Tentang Kami & Sejarah
                </Link>
              </li>
              <li>
                <Link href="/roster" className="hover:text-brand-blue dark:hover:text-brand-cyan transition-colors">
                  Struktur Pengurus & Roster
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-brand-blue dark:hover:text-brand-cyan transition-colors">
                  Aktivitas & Turnamen Offline
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-brand-blue dark:hover:text-brand-cyan transition-colors">
                  E-Sport Flash News
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-brand-blue dark:hover:text-brand-cyan transition-colors">
                  Market & Official Merch
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-brand-blue dark:text-brand-cyan font-bold hover:underline">
                  Pendaftaran Member Baru
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Channels */}
          <div className="space-y-3">
            <h4 className="border-b-2 border-slate-900 pb-2 font-display text-base font-bold tracking-wider text-slate-900 uppercase dark:border-white dark:text-white">
              Media Sosial & Kontak
            </h4>
            <div className="flex flex-col space-y-2.5 text-sm">
              <a
                href={COMMUNITY_INFO.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border-2 border-slate-900 bg-slate-50 px-3 py-2 text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-white dark:bg-dark-surface dark:text-white"
              >
                <span className="font-bold">WhatsApp Pengurus</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={COMMUNITY_INFO.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border-2 border-slate-900 bg-slate-50 px-3 py-2 text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-white dark:bg-dark-surface dark:text-white"
              >
                <span className="font-bold">Instagram @cees.area</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={COMMUNITY_INFO.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border-2 border-slate-900 bg-slate-50 px-3 py-2 text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-white dark:bg-dark-surface dark:text-white"
              >
                <span className="font-bold">TikTok @ceesgankk</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={COMMUNITY_INFO.socials.googleForm}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border-2 border-brand-blue bg-brand-blue px-3 py-2 text-white font-bold shadow-[2px_2px_0px_0px_#0F172A] rounded-none hover:-translate-x-0.5 hover:-translate-y-0.5 dark:shadow-[2px_2px_0px_0px_#FFFFFF]"
              >
                <span>Google Form Pendaftaran</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-dark-border dark:text-steel-400 sm:flex-row">
          <p>© {new Date().getFullYear()} CEES AREA ESPORT. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="mt-2 flex items-center space-x-3 sm:mt-0 font-medium">
            <span className="text-brand-blue dark:text-brand-blue-light font-bold">INVICTUS MANEO</span>
            <span>•</span>
            <span>Kota Samarinda, Kalimantan Timur</span>
            <span>•</span>
            <Link
              href="/login"
              className="font-mono text-[10px] font-bold text-slate-400 opacity-60 transition-all hover:text-brand-blue hover:opacity-100 dark:text-steel-500 dark:hover:text-brand-cyan"
              title="Terminal Akses Staf Pengurus CEES AREA"
            >
              [STAFF HQ]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
