import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FOUNDER_DATA, QUOTES_DATA } from "@/data/community";

export interface FounderFeatureProps {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export default function FounderFeature({
  badge = "[03] Founder",
  title = "Dari mabar jadi rumah.",
  subtitle = "Cerita singkat orang di balik berdirinya CEES AREA pada 4 Oktober 2024.",
}: FounderFeatureProps) {
  return (
    <section className="relative border-b-2 border-slate-900 bg-white py-20 dark:border-white dark:bg-dark-void lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-slate-900 pb-6 dark:border-white">
          <div>
            <span className="index-label">{badge}</span>
            <h2 className="display-xl mt-4 text-5xl text-slate-900 sm:text-7xl dark:text-white">
              {title.includes("jadi") ? (
                <>
                  Dari mabar <span className="text-outline">jadi</span> rumah.
                </>
              ) : (
                title
              )}
            </h2>
          </div>
          <p className="max-w-xs font-mono text-xs leading-relaxed text-slate-500 dark:text-steel-400">
            {subtitle}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Portrait */}
          <div className="lg:col-span-5">
            <figure className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="relative aspect-[4/5] w-full overflow-hidden border-2 border-slate-900 bg-slate-100 shadow-[10px_10px_0_0_#0030FF] dark:border-white">
                <Image
                  src={FOUNDER_DATA.image}
                  alt={`Potret ${FOUNDER_DATA.name}, founder CEES AREA`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover object-top"
                />
              </div>
              <span className="sticker sticker-blue absolute -right-2 top-6 rotate-[4deg]">Founder</span>
              <figcaption className="mt-6 flex items-baseline justify-between gap-4 border-t-2 border-slate-900 pt-3 dark:border-white">
                <span className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white">
                  {FOUNDER_DATA.name}
                </span>
                <span className="font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-steel-400">
                  a.k.a. {FOUNDER_DATA.nickname}
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Story */}
          <div className="flex flex-col lg:col-span-7">
            <blockquote className="relative">
              <span aria-hidden className="display-xl absolute -left-1 -top-10 text-[7rem] leading-none text-brand-blue dark:text-brand-cyan">
                &ldquo;
              </span>
              <p className="relative pt-10 font-display text-2xl font-medium uppercase leading-[1.15] text-slate-900 sm:text-[2.1rem] dark:text-white">
                {QUOTES_DATA.founderQuote}
              </p>
            </blockquote>
            <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-steel-400">
              — {FOUNDER_DATA.name}, {FOUNDER_DATA.role}
            </p>

            <div className="mt-12 grid grid-cols-1 border-t-2 border-slate-900 sm:grid-cols-2 dark:border-white">
              <div className="py-6 sm:pr-8">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand-blue dark:text-brand-cyan">
                  Visi
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-700 dark:text-steel-300">
                  {QUOTES_DATA.founderVision}
                </p>
              </div>
              <div className="border-t-2 border-slate-900 py-6 sm:border-l-2 sm:border-t-0 sm:pl-8 dark:border-white">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand-blue dark:text-brand-cyan">
                  Rekam jejak
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-700 dark:text-steel-300">
                  {QUOTES_DATA.founderTrackRecord}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Link href="/about" className="link-arrow text-slate-900 dark:text-white">
                <span>Sejarah lengkap &amp; struktur organisasi</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
