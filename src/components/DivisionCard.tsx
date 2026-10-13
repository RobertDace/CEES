import React from "react";
import Link from "next/link";
import { GameDivision } from "@/data/community";
import { Target, ShieldAlert, Gamepad2, CheckCircle2, ExternalLink } from "lucide-react";

interface Props {
  division: GameDivision;
}

export default function DivisionCard({ division }: Props) {
  const getIcon = () => {
    switch (division.icon) {
      case "Target":
        return <Target className="h-6 w-6 text-brand-blue dark:text-brand-cyan" />;
      case "ShieldAlert":
        return <ShieldAlert className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
      case "Gamepad2":
        return <Gamepad2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Target className="h-6 w-6 text-brand-blue dark:text-brand-cyan" />;
    }
  };

  return (
    <div className="group relative flex flex-col justify-between border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface rounded-none">
      
      {/* Top Header Badge */}
      <div>
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 dark:border-white">
          <span className="font-mono text-xs font-bold text-brand-blue dark:text-brand-cyan uppercase">
            {division.badge}
          </span>
          <span className="border border-slate-900 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-900 dark:border-white dark:bg-dark-base dark:text-white rounded-none">
            {division.type}
          </span>
        </div>

        {/* Division Title & Icon */}
        <div className="mt-4 flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center border-2 border-slate-900 bg-slate-50 shadow-[2px_2px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base rounded-none">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-display text-2xl font-black tracking-wide text-slate-900 group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan transition-colors">
              {division.name}
            </h3>
            <span className="font-mono text-xs text-slate-600 dark:text-steel-400">
              AKTIF: {division.activeSince}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-slate-800 dark:text-steel-300">
          {division.description}
        </p>

        {/* Feature Highlights */}
        <div className="mt-5 space-y-2 border-t-2 border-slate-900 pt-4 dark:border-dark-border">
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            FOKUS & AKTIVITAS:
          </span>
          {division.features.map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-800 dark:text-steel-200">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue dark:text-brand-cyan" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center gap-2.5 border-t-2 border-slate-900 pt-4 dark:border-dark-border">
        <Link
          href={`/join?division=${division.id}`}
          className="brutal-btn flex-1 py-3 text-center text-xs font-bold rounded-none"
        >
          GABUNG DIVISI INI
        </Link>
        <a
          href={division.gameUrl}
          target="_blank"
          rel="noreferrer"
          className="brutal-btn-outline flex items-center justify-center p-3 rounded-none text-slate-900 dark:text-white"
          title={`Website Resmi ${division.name}`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

    </div>
  );
}
