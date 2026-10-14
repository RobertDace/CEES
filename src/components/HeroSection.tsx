import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { COMMUNITY_INFO } from "@/data/community";

const STATS = [
  { value: `${COMMUNITY_INFO.totalMembers}+`, label: "Member aktif" },
  { value: "03", label: "Divisi game" },
  { value: "S1", label: "Turnamen offline" },
  { value: "2024", label: "Tahun berdiri" },
];

const TAPE_ITEMS = [
  "PUBG Mobile",
  "Mobile Legends",
  "Roblox",
  "Invictus Maneo",
  "Samarinda — Kaltim",
  "CEES GANK",
];

export default function HeroSection() {
  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-slate-900 bg-white dark:border-white dark:bg-dark-base">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 lg:px-8 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left: statement */}
            <div className="lg:col-span-7">
              <span className="sticker -rotate-2">Komunitas E-Sport · Samarinda, Kaltim</span>

              <h1 className="display-xl mt-8 text-[clamp(3.4rem,10vw,8.5rem)] text-slate-900 dark:text-white">
                <span className="block">Welcome</span>
                <span className="block">
                  to <span className="text-outline">our</span>
                </span>
                <span className="block">
                  <span className="mark-block">Area.</span>
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg dark:text-steel-200">
                Komunitas e-sport asal Samarinda yang dibangun dari tongkrongan mabar. Sekarang
                jadi rumah buat pemain <strong className="font-semibold text-slate-900 dark:text-white">PUBG Mobile</strong>,{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">Mobile Legends</strong>, dan{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">Roblox</strong> se-Kalimantan Timur.
              </p>

              <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-brand-blue dark:text-brand-cyan">
                &ldquo;{COMMUNITY_INFO.tagline}&rdquo; — {COMMUNITY_INFO.taglineMeaning}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
                <Link href="/join" className="brutal-btn px-7 py-4 text-sm">
                  <span>Daftar member baru</span>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
                <Link href="/about" className="link-arrow text-slate-900 dark:text-white">
                  <span>Kenalan dulu</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right: zine-style photo */}
            <div className="relative lg:col-span-5 lg:pt-6">
              <div aria-hidden className="bg-hatch absolute -right-3 top-10 bottom-6 left-10 hidden opacity-25 sm:block" />

              <figure className="relative border-2 border-slate-900 bg-white shadow-[10px_10px_0_0_#0F172A] dark:border-white dark:bg-dark-surface dark:shadow-[10px_10px_0_0_#0030FF]">
                <div className="flex items-center justify-between border-b-2 border-slate-900 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900 dark:border-white dark:text-white">
                  <span>Arsip / 2024</span>
                  <span className="text-slate-400 dark:text-steel-500">IMG_0412</span>
                </div>

                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900 sm:aspect-[5/5]">
                  <Image
                    src="/assets/activities/bukber_bungas_2024.jpg"
                    alt="Meet up dan buka bersama anggota CEES AREA 2024 di Bungas Cafe Samarinda"
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    priority
                    className="object-cover object-center grayscale-[35%] contrast-[1.08] transition-[filter,transform] duration-500 hover:scale-[1.03] hover:grayscale-0"
                  />
                </div>

                <figcaption className="grid grid-cols-[1fr_auto] items-end gap-4 border-t-2 border-slate-900 px-3 py-3 dark:border-white">
                  <div>
                    <p className="font-display text-lg font-bold uppercase leading-tight text-slate-900 dark:text-white">
                      Bukber &amp; meet up
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-steel-400">Bungas Cafe, Samarinda</p>
                  </div>
                  <p className="font-mono text-[11px] font-bold uppercase text-brand-blue dark:text-brand-cyan">
                    {COMMUNITY_INFO.memberTerm}
                  </p>
                </figcaption>
              </figure>

              <span className="sticker sticker-blue absolute -left-3 -top-3 rotate-[-6deg] sm:-left-6">
                Est. 04.10.2024
              </span>
            </div>
          </div>

          {/* Stats strip */}
          <dl className="ruled-grid mt-14 grid-cols-2 bg-white dark:bg-dark-base sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 py-5 sm:px-6">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-steel-400">
                  {s.label}
                </dt>
                <dd className="mt-1 font-display text-4xl font-bold tabular-nums text-slate-900 sm:text-5xl dark:text-white">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Marquee tape */}
      <div className="tape" aria-hidden>
        <div className="tape-track py-2.5 font-display text-lg font-bold uppercase tracking-wide">
          {[...TAPE_ITEMS, ...TAPE_ITEMS, ...TAPE_ITEMS, ...TAPE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="px-6">{item}</span>
              <span className="text-brand-cyan">///</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
