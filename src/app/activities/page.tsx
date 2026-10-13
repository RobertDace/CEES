import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ACTIVITIES } from "@/data/community";
import { Calendar, MapPin, ArrowUpRight, Flame, Handshake } from "lucide-react";

export const metadata = {
  title: "Our Activity | CEES AREA - Dokumentasi Kegiatan & Turnamen",
  description: "Dokumentasi kegiatan, turnamen offline Mall Robinson Samarinda, buka bersama, dan family gathering pantai Samboja CEES AREA.",
};

export default function ActivitiesPage() {
  return (
    <div className="py-12 lg:py-20 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="border-b-2 border-slate-900 pb-8 dark:border-white">
          <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-brand-blue dark:bg-dark-surface dark:text-brand-cyan">
            <Calendar className="h-4 w-4" />
            <span className="uppercase tracking-wider font-mono">Agenda & Rekam Jejak Komunitas</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
            OUR ACTIVITY
          </h1>
          <p className="mt-2 text-sm font-bold text-brand-blue dark:text-brand-cyan">
            Dari panggung turnamen kompetitif regional hingga kebersamaan santai pelepas penat di luar game.
          </p>
        </div>

        {/* Timeline List */}
        <div className="mt-12 space-y-10">
          {ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="border-2 border-slate-900 bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                
                {/* Event Visual */}
                <div className="lg:col-span-5">
                  <div className="relative aspect-video w-full overflow-hidden border-2 border-slate-900 bg-slate-950 sm:aspect-[4/3] rounded-none dark:border-white shadow-[4px_4px_0px_0px_#0F172A] dark:shadow-[4px_4px_0px_0px_#FFFFFF]">
                    <Image
                      src={activity.image}
                      alt={activity.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 border border-white bg-brand-blue px-3 py-1 font-mono text-xs font-bold text-white uppercase shadow-[2px_2px_0px_0px_#000000] rounded-none">
                      {activity.tag}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4 lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold text-slate-700 dark:text-steel-300">
                    <span className="border border-slate-900 bg-slate-100 px-2.5 py-1 text-brand-blue dark:border-white dark:bg-dark-base dark:text-brand-cyan rounded-none flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{activity.date}</span>
                    </span>
                    <span className="border border-slate-900 bg-slate-100 px-2.5 py-1 text-slate-800 dark:border-white dark:bg-dark-base dark:text-white rounded-none flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-blue" />
                      <span>{activity.location}</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-2xl font-black text-slate-900 uppercase sm:text-3xl dark:text-white">
                      {activity.title}
                    </h2>
                    <p className="text-xs font-bold text-brand-blue dark:text-brand-cyan mt-1 uppercase font-mono">
                      {activity.subtitle}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700 sm:text-base dark:text-steel-200">
                    {activity.description}
                  </p>

                  {activity.partner && (
                    <div className="inline-flex items-center space-x-2 border-2 border-slate-900 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base dark:text-white">
                      <Handshake className="h-4 w-4 text-brand-blue" />
                      <span className="font-mono text-slate-600 dark:text-steel-400">Mitra Acara:</span>
                      <strong className="text-slate-900 dark:text-white">{activity.partner}</strong>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Future Pipeline Banner */}
        <div className="mt-16 border-2 border-slate-900 bg-slate-50 p-8 sm:p-12 text-center shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
          <Flame className="mx-auto h-8 w-8 text-brand-blue dark:text-brand-cyan" />
          <h3 className="mt-3 font-display text-2xl font-black text-slate-900 uppercase sm:text-3xl dark:text-white">
            Lebih Banyak Program Menarik di Tahun 2026
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-700 dark:text-steel-300">
            Masih banyak turnamen offline, sparing persahabatan, agenda bakti sosial, serta gathering seru yang akan diselenggarakan. Jangan sampai ketinggalan!
          </p>
          <div className="mt-6">
            <Link
              href="/join"
              className="brutal-btn inline-flex items-center space-x-2 px-8 py-4 text-sm font-bold rounded-none"
            >
              <span>GABUNG BERSAMA KAMI</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
