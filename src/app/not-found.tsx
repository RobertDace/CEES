import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { COMMUNITY_INFO } from "@/data/community";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      {/* Top Tape Track */}
      <div className="tape-track w-full max-w-2xl border-y-2 border-slate-900 bg-brand-blue py-1 text-white dark:border-white">
        <div className="flex items-center justify-around font-mono text-[11px] font-bold uppercase tracking-wider">
          <span>[ 404 ERROR ]</span>
          <span>//</span>
          <span>SIGNAL LOST</span>
          <span>//</span>
          <span>SAMARINDA SECTOR</span>
          <span>//</span>
          <span>{COMMUNITY_INFO.tagline}</span>
        </div>
      </div>

      {/* Main Brutalist 404 Box */}
      <div className="mt-8 w-full max-w-2xl border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base sm:p-12">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 dark:border-white">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-blue dark:text-brand-cyan">
            DIREKTORI // KESALAHAN RUTE
          </span>
          <span className="font-mono text-xs font-bold text-slate-500 dark:text-steel-400">
            ERR_404_NOT_FOUND
          </span>
        </div>

        <div className="my-8 text-center sm:text-left">
          <h1 className="font-display text-6xl font-black uppercase tracking-tight text-slate-900 dark:text-white sm:text-8xl">
            404<span className="text-brand-blue dark:text-brand-cyan">.</span>
          </h1>
          <p className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white sm:text-3xl">
            Sinyal Terputus // Sektor Tidak Ditemukan
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-steel-300">
            Halaman atau koordinat yang kamu tuju tidak terdaftar di direktori resmi CEES AREA.
            Bisa jadi tautan sudah kedaluwarsa atau terjadi salah ketik pada URL browser kamu.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Link href="/" className="brutal-btn flex items-center justify-center gap-2 px-6 py-3 text-sm">
            <Home className="h-4 w-4" />
            <span>Kembali ke Markas</span>
          </Link>
          <Link
            href="/join"
            className="flex items-center justify-center gap-2 border-2 border-slate-900 bg-white px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] hover:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:hover:bg-dark-void"
          >
            <Compass className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
            <span>Daftar Member</span>
          </Link>
        </div>

        {/* Quick Directory Links */}
        <div className="mt-10 border-t-2 border-slate-900 pt-6 dark:border-white">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-steel-400">
            JALUR PINTAS DIREKTORI:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs font-semibold sm:grid-cols-4">
            <Link href="/" className="hover:text-brand-blue dark:hover:text-brand-cyan">
              [01] Home
            </Link>
            <Link href="/about" className="hover:text-brand-blue dark:hover:text-brand-cyan">
              [02] About Us
            </Link>
            <Link href="/activities" className="hover:text-brand-blue dark:hover:text-brand-cyan">
              [03] Activities
            </Link>
            <Link href="/news" className="hover:text-brand-blue dark:hover:text-brand-cyan">
              [04] E-Sport Flash
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
