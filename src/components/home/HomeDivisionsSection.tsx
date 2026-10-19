import React from "react";
import Link from "next/link";
import { Zap, ArrowUpRight } from "lucide-react";
import DivisionCard from "@/components/DivisionCard";
import { GameDivision } from "@/data/community";

interface HomeDivisionsSectionProps {
  divisions: GameDivision[];
  badge?: string;
  title?: string;
  subtitle?: string;
  btnText?: string;
}

export default function HomeDivisionsSection({
  divisions,
  badge = "Divisi Game Resmi",
  title = "DIVISI RESMI CEES AREA",
  subtitle = "Pilih panggung tempurmu. Mulai dari strategi bertahan hidup di Battle Royale, taktik objektif di MOBA, hingga keseruan tanpa batas di Roblox.",
  btnText = "DAFTAR SEMUA DIVISI",
}: HomeDivisionsSectionProps) {
  return (
    <section id="divisions" className="relative border-b-2 border-slate-900 bg-slate-50/50 py-16 transition-colors duration-200 dark:border-dark-border dark:bg-dark-base lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:bg-dark-surface dark:text-brand-cyan">
              <Zap className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
              <span className="uppercase tracking-wider">{badge}</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-5xl dark:text-white">
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-700 dark:text-steel-300">
              {subtitle}
            </p>
          </div>

          <Link
            href="/join"
            className="brutal-btn flex items-center space-x-2 px-6 py-3.5 text-xs font-bold rounded-none"
          >
            <span>{btnText}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {divisions.map((division) => (
            <DivisionCard key={division.id} division={division} />
          ))}
        </div>
      </div>
    </section>
  );
}
