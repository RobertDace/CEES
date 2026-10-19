import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowUpRight } from "lucide-react";
import { ActivityEvent } from "@/data/community";

interface HomeActivitiesSectionProps {
  activities: ActivityEvent[];
  badge?: string;
  title?: string;
  btnText?: string;
}

export default function HomeActivitiesSection({
  activities,
  badge = "Dokumentasi & Agenda",
  title = "REKAM JEJAK & KEGIATAN",
  btnText = "LIHAT SEMUA DOKUMENTASI",
}: HomeActivitiesSectionProps) {
  return (
    <section id="activities" className="border-b-2 border-slate-900 bg-white py-16 transition-colors duration-200 dark:border-dark-border dark:bg-dark-surface lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:bg-dark-base dark:text-brand-cyan">
              <Calendar className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
              <span className="uppercase tracking-wider">{badge}</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-5xl dark:text-white">
              {title}
            </h2>
          </div>

          <Link
            href="/activities"
            className="brutal-btn-outline flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-none"
          >
            <span>{btnText}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Activity Cards Preview */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {activities.map((act) => (
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
  );
}
