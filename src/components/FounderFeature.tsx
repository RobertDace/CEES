"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Quote, Award } from "lucide-react";
import { FOUNDER_DATA } from "@/data/community";

export default function FounderFeature() {
  return (
    <section className="relative overflow-hidden border-b-2 border-slate-900 bg-white py-16 transition-colors duration-200 dark:border-dark-border dark:bg-dark-void lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading Tag */}
        <div className="mb-12 flex flex-col items-start space-y-2">
          <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:bg-dark-surface dark:text-brand-cyan">
            <Award className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
            <span className="tracking-wider uppercase">Kepemimpinan & Pendiri Komunitas</span>
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
            FOUNDER CEES AREA
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          
          {/* Founder Portrait Photo */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              
              {/* True Brutalist Card Frame around Portrait */}
              <div className="relative border-2 border-brand-blue bg-white p-4 shadow-[6px_6px_0px_0px_#0030FF] dark:bg-dark-surface rounded-none">
                <div className="relative aspect-square w-full overflow-hidden border-2 border-slate-900 bg-slate-100 dark:border-white rounded-none">
                  <Image
                    src={FOUNDER_DATA.image}
                    alt={FOUNDER_DATA.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />
                  
                  {/* Badge on Photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between border-2 border-white/30 bg-slate-950/90 p-3 backdrop-blur-xs rounded-none">
                    <div>
                      <p className="font-display text-base font-bold text-white uppercase">{FOUNDER_DATA.name}</p>
                      <p className="text-xs font-mono text-brand-cyan">Panggilan: &quot;{FOUNDER_DATA.nickname}&quot;</p>
                    </div>
                    <span className="border border-brand-blue bg-brand-blue px-2.5 py-0.5 text-xs font-bold text-white uppercase rounded-none shadow-[2px_2px_0px_0px_#000000]">
                      FOUNDER
                    </span>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-700 dark:text-steel-400">
                  <span>ROLE: PENGURUS & LEAD</span>
                  <span className="font-bold text-brand-blue dark:text-brand-cyan">DIVISI PUBGM</span>
                </div>
              </div>

            </div>
          </div>

          {/* Founder Story & Quote */}
          <div className="space-y-6 lg:col-span-7">
            <div className="relative border-2 border-slate-900 bg-slate-50 p-6 sm:p-8 dark:border-white dark:bg-dark-surface shadow-[6px_6px_0px_0px_#0030FF] rounded-none">
              <Quote className="h-8 w-8 text-brand-blue opacity-80" />
              <blockquote className="mt-2 text-base leading-relaxed text-slate-900 sm:text-lg dark:text-white font-medium">
                &ldquo;Saya mengawali semua ini karena saya adalah mantan atlet E-Sport lokal dari divisi PUBGM yang ingin mengembangkan dan memajukan Komunitas E-Sport di Kota Samarinda. Berawal dari grup kecil yang sering main bareng, hingga semakin banyak kawan-kawan yang bergabung dan kini kami berdiri kokoh sebagai wadah bersama.&rdquo;
              </blockquote>
              <div className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-brand-blue dark:text-brand-cyan">
                — {FOUNDER_DATA.name} (&quot;{FOUNDER_DATA.nickname}&quot;)
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border-2 border-slate-900 bg-white p-5 dark:border-dark-border dark:bg-dark-base shadow-[4px_4px_0px_0px_#0030FF] rounded-none">
                <h4 className="font-display text-lg font-bold text-slate-900 uppercase dark:text-white">
                  Visi Utama
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                  Mengembangkan dan mempromosikan ekosistem Esports yang sehat dan berkesinambungan sebagai wadah penyalur hobi dan bakat, serta membawa nama Kota Samarinda dan Kalimantan Timur ke pentas nasional.
                </p>
              </div>

              <div className="border-2 border-slate-900 bg-white p-5 dark:border-dark-border dark:bg-dark-base shadow-[4px_4px_0px_0px_#0030FF] rounded-none">
                <h4 className="font-display text-lg font-bold text-slate-900 uppercase dark:text-white">
                  Rekam Jejak & Prestasi
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                  Berhasil mengorganisir Offline Tournament S1 di Mall Robinson Samarinda bersama PAWPAW Samarinda hanya dalam 2 bulan pasca deklarasi komunitas.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="brutal-btn-outline inline-flex items-center space-x-2 px-6 py-3 text-xs font-bold tracking-wider rounded-none"
              >
                <span>BACA SEJARAH LENGKAP & STRUKTUR ORGANISASI</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
