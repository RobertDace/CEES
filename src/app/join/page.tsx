import React from "react";
import Link from "next/link";
import JoinForm from "@/components/JoinForm";
import LiveMemberRoster from "@/components/LiveMemberRoster";
import { COMMUNITY_INFO } from "@/data/community";
import { UserPlus, MessageCircle, FileText, ExternalLink, HelpCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Let's Join Us! | CEES AREA - Pendaftaran Member Baru",
  description: "Formulir pendaftaran resmi anggota baru CEES AREA untuk divisi PUBG Mobile, Mobile Legends, dan Roblox. Hubungi admin atau isi form langsung.",
};

export default function JoinPage() {
  return (
    <div className="py-12 lg:py-20 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header Title */}
        <div className="border-b-2 border-slate-900 pb-8 dark:border-white">
          <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-brand-blue dark:bg-dark-surface dark:text-brand-cyan">
            <UserPlus className="h-4 w-4" />
            <span className="uppercase tracking-wider font-mono">Pendaftaran Anggota Baru 2026</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
            LET&apos;S JOIN US!
          </h1>
          <p className="mt-2 text-sm font-bold text-brand-blue dark:text-brand-cyan">
            Jadilah bagian dari keluarga besar CEES GANK Samarinda. Terbuka untuk pemain kompetitif maupun penikmat mabar santai.
          </p>
        </div>
 
        {/* Already a Member Banner */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-slate-900 bg-brand-cyan/20 p-4 shadow-[4px_4px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-slate-900 bg-brand-cyan font-bold text-slate-900 dark:border-white">
              ★
            </span>
            <div>
              <p className="font-display text-sm font-black uppercase text-slate-900 dark:text-white">
                Sudah Pernah Mendaftar Sebagai Member?
              </p>
              <p className="font-sans text-xs text-slate-600 dark:text-steel-300">
                Kamu tidak perlu mengisi formulir ini lagi. Silakan masuk ke Portal Member untuk melihat Kartu Anggota dan profilmu.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="brutal-btn inline-flex items-center gap-2 border-2 border-slate-900 bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-900 whitespace-nowrap"
          >
            <span>Sign In Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Intro Guidance Card */}
        <div className="mt-8 border-2 border-slate-900 bg-slate-50 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
          <h2 className="font-display text-xl font-black text-slate-900 uppercase sm:text-2xl dark:text-white">
            Tertarik Bergabung Bareng CEES AREA?
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-steel-200">
            <p>
              Daftarkan dirimu melalui formulir interaktif di bawah ini dan pilih divisi game yang kamu sukai (<strong>PUBG Mobile</strong>, <strong>Mobile Legends</strong>, atau <strong>Roblox</strong>).
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Bukan pemain pro? Santai saja!</strong> Buat kamu yang sekadar ingin cari teman mabar atau ngobrol santai seputar game, kami memiliki channel Discord dan grup WhatsApp yang ramah dan saling mendukung. Tautan server Discord resmi akan langsung dibagikan oleh Administrator setelah verifikasi datamu selesai.
            </p>
          </div>
        </div>

        {/* Two Column Layout: Form & Backup Links */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* Main Interactive Form */}
          <div className="lg:col-span-8">
            <JoinForm />
          </div>

          {/* Right Sidebar: Official External Links & FAQ */}
          <div className="space-y-6 lg:col-span-4">

            {/* Direct Admin WhatsApp Card */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <MessageCircle className="h-4 w-4" />
                <span>Respon Cepat WhatsApp</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-black text-slate-900 uppercase dark:text-white">
                WHATSAPP PENGURUS
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                Punya pertanyaan sebelum mendaftar atau ingin konfirmasi seputar kegiatan komunitas? Hubungi kami langsung.
              </p>
              <a
                href={COMMUNITY_INFO.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center space-x-2 border-2 border-slate-900 bg-emerald-600 py-3.5 font-display text-xs font-bold text-white shadow-[4px_4px_0px_0px_#0F172A] rounded-none hover:bg-emerald-500 transition-all uppercase tracking-wider dark:border-white dark:shadow-[4px_4px_0px_0px_#FFFFFF]"
              >
                <span>CHAT VIA WHATSAPP</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Google Form & Drive Spreadsheets Backup */}
            <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
              <div className="flex items-center space-x-2 text-brand-blue font-mono font-bold text-xs uppercase tracking-wider dark:text-brand-cyan">
                <FileText className="h-4 w-4" />
                <span>Formulir Alternatif</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-black text-slate-900 uppercase dark:text-white">
                FORMULIR GOOGLE RESMI
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-steel-300">
                Jika kamu lebih nyaman mengisi formulir bawaan Google Form atau ingin memeriksa rekapitulasi data pendaftar:
              </p>

              <div className="mt-4 space-y-2.5">
                <a
                  href={COMMUNITY_INFO.socials.googleForm}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border-2 border-slate-900 bg-slate-50 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none hover:bg-slate-100 transition-colors dark:border-white dark:bg-dark-base dark:text-white"
                >
                  <span>Google Form Asli</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-600 dark:text-steel-400" />
                </a>

                <a
                  href={COMMUNITY_INFO.socials.spreadsheet}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border-2 border-slate-900 bg-slate-50 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none hover:bg-slate-100 transition-colors dark:border-white dark:bg-dark-base dark:text-white"
                >
                  <span>Daftar Pendaftar (Spreadsheet)</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-600 dark:text-steel-400" />
                </a>
              </div>
            </div>

            {/* FAQ Box */}
            <div className="border-2 border-slate-900 bg-slate-50 p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
              <div className="flex items-center space-x-2 text-brand-blue font-mono font-bold text-xs uppercase tracking-wider dark:text-brand-cyan">
                <HelpCircle className="h-4 w-4" />
                <span>Pertanyaan yang Sering Diajukan</span>
              </div>

              <div className="mt-4 space-y-4 font-mono text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase">Apakah ada biaya pendaftaran?</h4>
                  <p className="mt-1 text-slate-600 dark:text-steel-300 font-sans">Gratis 100%. Komunitas ini didirikan atas dasar hobi dan persaudaraan.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase">Boleh bergabung di lebih dari 1 game?</h4>
                  <p className="mt-1 text-slate-600 dark:text-steel-300 font-sans">Tentu boleh! Banyak member PUBGM dan MLBB yang juga aktif bermain Roblox bersama.</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase">Domisili di luar Samarinda?</h4>
                  <p className="mt-1 text-slate-600 dark:text-steel-300 font-sans">Bisa! Kami memiliki anggota dari berbagai daerah Kaltim hingga pulau Jawa.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Live Members Roster Section */}
        <div className="mt-16">
          <LiveMemberRoster />
        </div>

      </div>
    </div>
  );
}
