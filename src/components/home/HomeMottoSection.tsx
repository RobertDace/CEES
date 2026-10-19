import React from "react";
import { Flame, MapPin, Trophy } from "lucide-react";

interface HomeMottoSectionProps {
  filosofiTitle?: string;
  filosofiText?: string;
  regionalTitle?: string;
  regionalText?: string;
  solidaritasTitle?: string;
  solidaritasText?: string;
}

export default function HomeMottoSection({
  filosofiTitle = '"INVICTUS MANEO"',
  filosofiText = 'Diambil dari bahasa Latin yang bermakna "Tetap Tak Terkalahkan". Sebuah ikrar mentalitas bahwa apapun hasil di dalam game, semangat persaudaraan dan daya juang CEES GANK tidak akan pernah padam.',
  regionalTitle = "SAMARINDA & KALTIM",
  regionalText = "Berpusat di ibukota Kalimantan Timur dengan anggota aktif tersebar di Kutai Kartanegara, Kutai Timur, Sangatta, Berau, hingga perwakilan di pulau Jawa.",
  solidaritasTitle = "LEBIH DARI SEKADAR MABAR",
  solidaritasText = "Tidak hanya bertanding di turnamen dan scrim, kami rutin mengadakan agenda silaturahmi buka bersama, gathering pantai, dan turnamen offline untuk memajukan komunitas lokal.",
}: HomeMottoSectionProps) {
  return (
    <section id="motto" className="border-b-2 border-slate-900 bg-white py-12 transition-colors duration-200 dark:border-dark-border dark:bg-dark-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border-2 border-slate-900 bg-slate-50 p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
            <div className="flex items-center space-x-2 text-brand-blue font-bold text-xs uppercase tracking-wider dark:text-brand-cyan">
              <Flame className="h-4 w-4" />
              <span>FILOSOFI KAMI</span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-black text-slate-900 uppercase dark:text-white">
              {filosofiTitle}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
              {filosofiText}
            </p>
          </div>

          <div className="border-2 border-slate-900 bg-slate-50 p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
            <div className="flex items-center space-x-2 text-brand-blue font-bold text-xs uppercase tracking-wider dark:text-brand-cyan">
              <MapPin className="h-4 w-4" />
              <span>AKAR REGIONAL</span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-black text-slate-900 uppercase dark:text-white">
              {regionalTitle}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
              {regionalText}
            </p>
          </div>

          <div className="border-2 border-slate-900 bg-slate-50 p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
            <div className="flex items-center space-x-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
              <Trophy className="h-4 w-4" />
              <span>SOLIDARITAS KOMUNITAS</span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-black text-slate-900 uppercase dark:text-white">
              {solidaritasTitle}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
              {solidaritasText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
