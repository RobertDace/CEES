import React from "react";
import Link from "next/link";
import { GameDivision } from "@/data/community";
import { ArrowUpRight, Plus } from "lucide-react";

interface Props {
  division: GameDivision;
}

/**
 * Designed to live inside a `.ruled-grid` parent: no own border or shadow,
 * cells share hairline-free 2px rules with their neighbours.
 */
export default function DivisionCard({ division }: Props) {
  const index = division.badge.replace(/\D/g, "") || "00";

  return (
    <article className="group relative flex flex-col bg-white transition-colors duration-150 dark:bg-dark-surface">
      {/* Accent bar uses the division's existing accent colour */}
      <div aria-hidden className="h-2 w-full" style={{ backgroundColor: division.accentColor }} />

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="display-xl text-outline text-7xl leading-none transition-colors duration-150 group-hover:text-slate-900 dark:group-hover:text-white">
            {index}
          </span>
          <span className="border-2 border-slate-900 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:border-white dark:text-white">
            {division.type}
          </span>
        </div>

        <h3 className="mt-6 font-display text-3xl font-bold uppercase leading-[0.95] text-slate-900 dark:text-white">
          {division.name}
        </h3>
        <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-steel-400">
          Aktif sejak {division.activeSince}
        </p>

        <p className="mt-5 text-[15px] leading-relaxed text-slate-700 dark:text-steel-300">{division.description}</p>

        <ul className="mt-6 space-y-2 border-t-2 border-dashed border-slate-300 pt-5 dark:border-dark-border-bright">
          {division.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-slate-800 dark:text-steel-200">
              <Plus className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan" strokeWidth={3} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action band */}
      <div className="grid grid-cols-[1fr_auto] border-t-2 border-slate-900 dark:border-white">
        <Link
          href={`/join?division=${division.id}`}
          className="flex items-center justify-between px-6 py-4 font-display text-sm font-bold uppercase tracking-wide text-slate-900 transition-colors hover:bg-brand-blue hover:text-white dark:text-white"
        >
          <span>Gabung divisi ini</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <a
          href={division.gameUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center border-l-2 border-slate-900 px-4 font-mono text-[10px] font-bold uppercase text-slate-500 transition-colors hover:bg-slate-900 hover:text-white dark:border-white dark:text-steel-400 dark:hover:bg-white dark:hover:text-slate-900"
          aria-label={`Website resmi ${division.name}`}
        >
          Situs game
        </a>
      </div>
    </article>
  );
}
