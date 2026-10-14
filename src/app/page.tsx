import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import DivisionCard from "@/components/DivisionCard";
import FounderFeature from "@/components/FounderFeature";
import LiveMemberRoster from "@/components/LiveMemberRoster";
import { DIVISIONS, ACTIVITIES, COMMUNITY_INFO, HOME_SECTIONS } from "@/data/community";
import { ArrowUpRight, Flame, Trophy, MapPin, Calendar, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Core Motto & Origin Callout */}
      <section className="border-b-2 border-slate-900 bg-white py-12 transition-colors duration-200 dark:border-dark-border dark:bg-dark-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="border-2 border-slate-900 bg-slate-50 p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
              <div className="flex items-center space-x-2 text-brand-blue font-bold text-xs uppercase tracking-wider dark:text-brand-cyan">
                <Flame className="h-4 w-4" />
                <span>FILOSOFI KAMI</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-black text-slate-900 uppercase dark:text-white">
                {HOME_SECTIONS.filosofiTitle}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                {HOME_SECTIONS.filosofiText}
              </p>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
              <div className="flex items-center space-x-2 text-brand-blue font-bold text-xs uppercase tracking-wider dark:text-brand-cyan">
                <MapPin className="h-4 w-4" />
                <span>AKAR REGIONAL</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-black text-slate-900 uppercase dark:text-white">
                {HOME_SECTIONS.regionalTitle}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                {HOME_SECTIONS.regionalText}
              </p>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
              <div className="flex items-center space-x-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <Trophy className="h-4 w-4" />
                <span>SOLIDARITAS KOMUNITAS</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-black text-slate-900 uppercase dark:text-white">
                {HOME_SECTIONS.solidaritasTitle}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                {HOME_SECTIONS.solidaritasText}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Game Divisions Section */}
      <section id="divisions" className="relative border-b-2 border-slate-900 bg-slate-50/50 py-16 transition-colors duration-200 dark:border-dark-border dark:bg-dark-base lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:bg-dark-surface dark:text-brand-cyan">
                <Zap className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
                <span className="uppercase tracking-wider">Divisi Game Resmi</span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-5xl dark:text-white">
                DIVISI RESMI CEES AREA
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-700 dark:text-steel-300">
                Pilih panggung tempurmu. Mulai dari strategi bertahan hidup di Battle Royale, taktik objektif di MOBA, hingga keseruan tanpa batas di Roblox.
              </p>
            </div>

            <Link
              href="/join"
              className="brutal-btn flex items-center space-x-2 px-6 py-3.5 text-xs font-bold rounded-none"
            >
              <span>DAFTAR SEMUA DIVISI</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {DIVISIONS.map((division) => (
              <DivisionCard key={division.id} division={division} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. Founder Spotlight Section */}
      <FounderFeature />

      {/* 5. Activities Teaser Section */}
      <section className="border-b-2 border-slate-900 bg-white py-16 transition-colors duration-200 dark:border-dark-border dark:bg-dark-surface lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:bg-dark-base dark:text-brand-cyan">
                <Calendar className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
                <span className="uppercase tracking-wider">Dokumentasi & Agenda</span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-5xl dark:text-white">
                REKAM JEJAK & KEGIATAN
              </h2>
            </div>

            <Link
              href="/activities"
              className="brutal-btn-outline flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-none"
            >
              <span>LIHAT SEMUA DOKUMENTASI</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Activity Cards Preview */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {ACTIVITIES.map((act) => (
              <div
                key={act.id}
                className="group border-2 border-slate-900 bg-white overflow-hidden shadow-[6px_6px_0px_0px_#0030FF] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base rounded-none"
              >
                <div className="relative aspect-video w-full overflow-hidden border-b-2 border-slate-900 dark:border-white bg-slate-200 dark:bg-dark-void">
                  <Image
                    src={act.image}
                    alt={act.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 border border-white bg-brand-blue px-2.5 py-0.5 text-xs font-mono font-bold text-white uppercase rounded-none shadow-[2px_2px_0px_0px_#000000]">
                    {act.tag}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-steel-400">
                    <span>{act.date}</span>
                    <span className="font-bold text-brand-blue dark:text-brand-cyan">
                      {act.location.split(",")[0]}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-black text-slate-900 uppercase group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan transition-colors">
                    {act.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs font-bold text-brand-blue dark:text-brand-cyan">
                    {act.subtitle}
                  </p>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Live Registered Members Roster Section */}
      <section className="border-b-2 border-slate-900 bg-slate-50/50 py-16 dark:border-dark-border dark:bg-dark-base lg:py-24 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LiveMemberRoster />
        </div>
      </section>

      {/* 7. High-Impact Call to Action Banner */}
      <section className="relative overflow-hidden border-b-2 border-slate-900 bg-slate-100 py-16 dark:border-dark-border dark:bg-dark-void transition-colors duration-200">
        <div className="absolute inset-0 bg-industrial-grid opacity-25 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:bg-dark-surface dark:text-brand-cyan">
            <Flame className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
            <span className="uppercase tracking-wider">Pendaftaran Anggota Baru 2026</span>
          </div>

          <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
            SIAP BERGABUNG DENGAN <br />
            <span className="text-brand-blue dark:text-brand-cyan">CEES GANK SAMARINDA?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-800 sm:text-base dark:text-steel-200">
            Tidak harus pro player! Apapun tingkat keahlianmu, jika kamu memiliki komitmen, sikap saling menghargai, dan ingin berteman akrab, pintu CEES AREA selalu terbuka untukmu.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/join"
              className="brutal-btn px-8 py-4 text-base font-bold tracking-wider rounded-none"
            >
              ISI FORMULIR PENDAFTARAN
            </Link>
            <a
              href={COMMUNITY_INFO.socials.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="brutal-btn-outline px-8 py-4 text-base font-bold tracking-wider rounded-none"
            >
              HUBUNGI ADMIN VIA WHATSAPP
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
