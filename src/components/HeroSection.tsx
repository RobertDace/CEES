"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Flame, Shield, Trophy, Users, Crosshair, ChevronRight, CheckCircle2 } from "lucide-react";
import { COMMUNITY_INFO } from "@/data/community";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b-2 border-slate-900 bg-slate-50/50 pt-10 pb-16 transition-colors duration-200 dark:border-dark-border dark:bg-dark-base lg:pt-16 lg:pb-24">
      {/* Decorative Brand Grid Background */}
      <div className="absolute top-0 right-0 h-full w-1/3 bg-dot-matrix opacity-25 pointer-events-none" />
      <div className="absolute -top-24 left-1/4 h-96 w-96 bg-brand-blue/15 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Headline & Bio */}
          <div className="space-y-6 lg:col-span-7">
            {/* Regional Brutalist Stamp */}
            <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-brand-blue dark:bg-dark-surface dark:text-brand-cyan">
              <Flame className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
              <span className="tracking-wider uppercase">Komunitas E-Sport Resmi Samarinda, Kalimantan Timur</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl lg:text-7xl dark:text-white">
                WELCOME TO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-cyan">
                  OUR AREA.
                </span>
              </h1>
              <p className="font-mono text-xs font-bold tracking-wider text-brand-blue uppercase dark:text-brand-cyan">
                SEMBOYAN: &quot;{COMMUNITY_INFO.tagline}&quot; — {COMMUNITY_INFO.taglineMeaning}
              </p>
            </div>

            <p className="max-w-xl text-base leading-relaxed text-slate-800 sm:text-lg dark:text-steel-200">
              Komunitas E-Sport terdepan asal Samarinda, Kalimantan Timur. Dibangun dari semangat kekeluargaan yang solid dan mental bertanding yang tangguh di divisi <strong className="font-bold text-slate-900 dark:text-white">PUBG Mobile</strong>, <strong className="font-bold text-slate-900 dark:text-white">Mobile Legends</strong>, dan <strong className="font-bold text-slate-900 dark:text-white">Roblox</strong>.
            </p>

            {/* Brutalist Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/join"
                className="brutal-btn inline-flex items-center space-x-2 px-7 py-4 text-sm font-bold tracking-wider rounded-none"
              >
                <span>DAFTAR MEMBER BARU</span>
                <ArrowUpRight className="h-5 w-5" />
              </Link>

              <Link
                href="/about"
                className="brutal-btn-outline inline-flex items-center space-x-2 px-7 py-4 text-sm font-bold tracking-wider rounded-none"
              >
                <span>PROFIL LENGKAP KAMI</span>
                <ChevronRight className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
              </Link>
            </div>

            {/* Brutalist Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 border-t-2 border-slate-900 pt-6 dark:border-dark-border sm:grid-cols-4">
              <div className="border-2 border-slate-900 bg-white p-3.5 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-transform hover:-translate-y-0.5">
                <div className="flex items-center space-x-1.5 text-brand-blue dark:text-brand-cyan">
                  <Users className="h-4 w-4" />
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">90+</span>
                </div>
                <p className="font-mono text-[11px] font-bold uppercase text-slate-600 dark:text-steel-400">Anggota Aktif</p>
              </div>

              <div className="border-2 border-slate-900 bg-white p-3.5 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-transform hover:-translate-y-0.5">
                <div className="flex items-center space-x-1.5 text-brand-blue dark:text-brand-cyan">
                  <Crosshair className="h-4 w-4" />
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">3</span>
                </div>
                <p className="font-mono text-[11px] font-bold uppercase text-slate-600 dark:text-steel-400">Divisi Game</p>
              </div>

              <div className="border-2 border-slate-900 bg-white p-3.5 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-transform hover:-translate-y-0.5">
                <div className="flex items-center space-x-1.5 text-amber-500">
                  <Trophy className="h-4 w-4" />
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">S1</span>
                </div>
                <p className="font-mono text-[11px] font-bold uppercase text-slate-600 dark:text-steel-400">Turnamen Offline</p>
              </div>

              <div className="border-2 border-slate-900 bg-white p-3.5 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-transform hover:-translate-y-0.5">
                <div className="flex items-center space-x-1.5 text-brand-blue dark:text-white">
                  <Shield className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">2024</span>
                </div>
                <p className="font-mono text-[11px] font-bold uppercase text-slate-600 dark:text-steel-400">Tahun Berdiri</p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Esports Brutalist Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Brutalist Outer Frame */}
              <div className="relative border-2 border-slate-900 bg-white p-5 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface rounded-none">
                
                {/* Header Tag */}
                <div className="mb-4 flex items-center justify-between border-b-2 border-slate-900 pb-3 text-xs dark:border-white">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 bg-emerald-500 animate-pulse"></span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wider uppercase">
                      CEES AREA SAMARINDA
                    </span>
                  </div>
                  <span className="border border-brand-blue bg-brand-blue px-2.5 py-0.5 text-[11px] font-bold text-white uppercase rounded-none shadow-[2px_2px_0px_0px_#000000]">
                    TERVERIFIKASI
                  </span>
                </div>

                {/* Central Community Visual Banner */}
                <div className="relative h-64 w-full overflow-hidden border-2 border-slate-900 bg-slate-950 sm:h-72 dark:border-white rounded-none">
                  <Image
                    src="/assets/activities/bukber_bungas_2024.jpg"
                    alt="Meet Up dan Buka Bersama Akbar Anggota CEES AREA 2024 @Bungas Cafe Samarinda"
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    priority
                    className="object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
                  
                  {/* Overlay Description Badge */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="inline-block border border-white bg-brand-blue px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase rounded-none shadow-[2px_2px_0px_0px_#000000]">
                      DOKUMENTASI BUKBER 2024
                    </div>
                    <p className="mt-1 font-display text-sm font-bold text-white uppercase drop-shadow-sm">
                      Buka Bersama Akbar & Meet Up @Bungas Cafe Samarinda
                    </p>
                  </div>
                </div>

                {/* Information Footer */}
                <div className="mt-4 flex items-center justify-between border-t-2 border-slate-900 pt-3 text-xs dark:border-white font-mono">
                  <div>
                    <span className="text-slate-600 dark:text-steel-400">SEBUTAN:</span>{" "}
                    <strong className="font-bold text-slate-900 dark:text-white">CEES GANK</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-steel-400">MOTTO:</span>{" "}
                    <strong className="font-bold text-brand-blue dark:text-brand-cyan">INVICTUS MANEO</strong>
                  </div>
                </div>

                {/* Division Badges */}
                <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-dark-border">
                  <span className="border border-slate-900 bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-900 uppercase dark:border-white dark:bg-dark-base dark:text-white rounded-none">
                    PUBG MOBILE
                  </span>
                  <span className="border border-slate-900 bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-900 uppercase dark:border-white dark:bg-dark-base dark:text-white rounded-none">
                    MOBILE LEGENDS
                  </span>
                  <span className="border border-slate-900 bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-900 uppercase dark:border-white dark:bg-dark-base dark:text-white rounded-none">
                    ROBLOX
                  </span>
                </div>
              </div>

              {/* Floating Brutalist Badge */}
              <div className="absolute -bottom-4 -left-4 hidden border-2 border-slate-900 bg-white px-4 py-2 font-mono text-xs font-bold text-slate-900 shadow-[4px_4px_0px_0px_#0030FF] sm:flex sm:items-center sm:gap-2 dark:border-white dark:bg-dark-void dark:text-white rounded-none">
                <span className="h-2 w-2 bg-brand-blue dark:bg-brand-cyan animate-ping" />
                <span>WADAH RESMI GAMERS SAMARINDA</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
