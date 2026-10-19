import React from "react";
import Link from "next/link";
import { Flame } from "lucide-react";

interface HomeCtaSectionProps {
  badge?: string;
  title?: string;
  description?: string;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  whatsappUrl?: string;
}

export default function HomeCtaSection({
  badge = "Pendaftaran Anggota Baru 2026",
  title = "SIAP BERGABUNG DENGAN CEES GANK SAMARINDA?",
  description = "Tidak harus pro player! Apapun tingkat keahlianmu, jika kamu memiliki komitmen, sikap saling menghargai, dan ingin berteman akrab, pintu CEES AREA selalu terbuka untukmu.",
  primaryBtnText = "ISI FORMULIR PENDAFTARAN",
  secondaryBtnText = "HUBUNGI ADMIN VIA WHATSAPP",
  whatsappUrl = "http://wa.me/6285705035765",
}: HomeCtaSectionProps) {
  return (
    <section id="cta" className="relative overflow-hidden border-b-2 border-slate-900 bg-slate-100 py-16 dark:border-dark-border dark:bg-dark-void transition-colors duration-200">
      <div className="absolute inset-0 bg-industrial-grid opacity-25 pointer-events-none" />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:bg-dark-surface dark:text-brand-cyan">
          <Flame className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
          <span className="uppercase tracking-wider">{badge}</span>
        </div>

        <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
          {title.includes("CEES GANK") ? (
            <>
              {title.split("CEES GANK")[0]} <br />
              <span className="text-brand-blue dark:text-brand-cyan">
                CEES GANK{title.split("CEES GANK")[1]}
              </span>
            </>
          ) : (
            title
          )}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-800 sm:text-base dark:text-steel-200">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/join"
            className="brutal-btn px-8 py-4 text-base font-bold tracking-wider rounded-none"
          >
            {primaryBtnText}
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="brutal-btn-outline px-8 py-4 text-base font-bold tracking-wider rounded-none"
          >
            {secondaryBtnText}
          </a>
        </div>
      </div>
    </section>
  );
}
