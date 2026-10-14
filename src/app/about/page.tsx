import React from "react";
import Image from "next/image";
import Link from "next/link";
import { COMMUNITY_INFO } from "@/data/community";
import {
  Shield,
  Target,
  Award,
  CheckCircle2,
  MapPin,
  ArrowUpRight,
  Calendar,
  Globe,
  HeartHandshake,
  Users,
} from "lucide-react";

export const metadata = {
  title: "About Us | CEES AREA - Sejarah, Visi, Misi & Filosofi",
  description: "Sejarah berdirinya CEES AREA (CEES GANK) sejak 4 Oktober 2024 di Samarinda, visi, misi, dan nilai Invictus Maneo.",
};

export default function AboutPage() {
  return (
    <div className="py-12 lg:py-20 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header Title */}
        <div className="border-b-2 border-slate-900 pb-8 dark:border-white">
          <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-brand-blue dark:bg-dark-surface dark:text-brand-cyan">
            <Shield className="h-4 w-4" />
            <span className="uppercase tracking-wider font-mono">Profil Resmi Organisasi</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
            ABOUT US
          </h1>
          <p className="mt-2 text-sm font-bold text-brand-blue dark:text-brand-cyan">
            Semboyan: &quot;{COMMUNITY_INFO.tagline}&quot; ({COMMUNITY_INFO.taglineMeaning}) — Didirikan pada 4 Oktober 2024, Kota Samarinda
          </p>
        </div>

        {/* 1. Core Identity Narrative */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">

          <div className="space-y-6 lg:col-span-7">
            <h2 className="font-display text-2xl font-black text-slate-900 uppercase sm:text-3xl dark:text-white">
              CEES GANK itu Komunitas Apa?
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base dark:text-steel-200">
              <p>
                <strong className="text-slate-900 dark:text-white">CEES GANK</strong> adalah sebutan bagi para anggota atau membernya, sedangkan <strong className="text-brand-blue dark:text-brand-cyan">CEES AREA</strong> adalah nama resmi komunitasnya. Kami adalah komunitas E-Sport lokal yang berakar kuat dari Provinsi Kalimantan Timur.
              </p>
              <p>
                Mayoritas anggota kami berdomisili di Kota Samarinda, namun seiring berjalannya waktu banyak kawan-kawan dari kabupaten/kota lain yang bergabung, seperti Kutai Kartanegara, Kutai Timur, Sangatta, dan Berau. Bahkan komunitas ini juga memiliki anggota yang berdomisili di luar Kalimantan Timur, khususnya di pulau Jawa.
              </p>
              <p>
                Komunitas ini resmi didirikan pada tanggal <strong className="text-brand-blue dark:text-brand-cyan">4 Oktober 2024</strong>. Saat ini, CEES AREA menaungi sekitar 90 anggota aktif yang terdistribusi ke dalam tiga divisi game utama: <strong>PUBG Mobile</strong>, <strong>Mobile Legends: Bang Bang</strong>, dan <strong>Roblox</strong>.
              </p>
            </div>

            {/* Coverage Badges */}
            <div className="border-2 border-slate-900 bg-slate-50 p-5 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Jangkauan Wilayah Domisili Member:
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {COMMUNITY_INFO.coverage.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base dark:text-white"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-blue dark:text-brand-cyan" />
                    <span>{city}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Group Photo Showcase */}
          <div className="lg:col-span-5">
            <div className="border-2 border-slate-900 bg-white p-4 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
              <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-slate-900 bg-slate-950 rounded-none dark:border-white">
                <Image
                  src="/assets/activities/bukber.png"
                  alt="CEES AREA Meet Up Bungas Cafe Samarinda"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4 border-t-2 border-slate-900 pt-3 text-xs text-slate-700 dark:border-white dark:text-steel-300">
                <span className="font-bold text-slate-900 dark:text-white uppercase font-mono">DOKUMENTASI RESMI:</span> Silaturahmi & Buka Bersama Anggota Lintas Divisi di Bungas Cafe Samarinda.
              </div>
            </div>
          </div>

        </div>

        {/* 2. Sejarah Detail */}
        <div className="mt-16 border-t-2 border-slate-900 pt-12 dark:border-white">
          <div className="border-2 border-slate-900 bg-slate-50 p-6 sm:p-10 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
            <div className="inline-flex items-center gap-1.5 border-2 border-brand-blue bg-brand-blue px-3 py-0.5 text-xs font-mono font-bold text-white uppercase shadow-[2px_2px_0px_0px_#000000] rounded-none mb-4">
              <Calendar className="h-3.5 w-3.5" />
              <span>CHRONOLOGY 2024 - 2025</span>
            </div>
            <h3 className="font-display text-2xl font-black text-slate-900 uppercase sm:text-3xl dark:text-white">
              Sejarah Perjalanan Kami
            </h3>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base dark:text-steel-200">
              <p>
                Pada awalnya, komunitas ini terbentuk dari sekumpulan pemuda yang sering main bareng (mabar) dari berbagai latar belakang komunitas e-sport terdahulu. Setelah saling mengenal akrab dan berdiskusi intensif, akhirnya pada tanggal <strong>4 Oktober 2024</strong> diputuskan untuk membentuk sebuah komunitas yang menjadi wadah resmi para gamers dengan markas di Kota Samarinda.
              </p>
              <p>
                Divisi pertama yang lahir berfokus pada <strong>PUBG Mobile</strong>. Tim ini mulanya dirancang untuk tujuan kompetitif dan mengenalkan eksistensi CEES AREA di skena esports Kota Samarinda. Kurang lebih dua bulan setelah berdiri, kami memberanikan diri mengadakan <strong>Offline Tournament PUBGM S1</strong> perdana dengan menggandeng <strong>PAWPAW Samarinda</strong> sebagai rekanan vendor di Mall Robinson Samarinda.
              </p>
              <p>
                Perwakilan tim kami juga aktif mengikuti scrim dan latih tanding di berbagai fast tournament. Memasuki bulan Februari 2025, kami resmi mengekspansi divisi dengan membuka <strong>Mobile Legends: Bang-Bang (MLBB)</strong> dengan struktur kepengurusan terarah. Divisi <strong>ROBLOX</strong> kemudian dibentuk untuk memenuhi kebutuhan bermain santai bersama yang dapat menampung banyak member sekaligus ketika ingin rehat dari taktik intensif.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Visi & Misi */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* VISI */}
          <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
            <div className="flex items-center space-x-2 text-brand-blue dark:text-brand-cyan">
              <Target className="h-6 w-6" />
              <h3 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white">VISI</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-steel-200">
              Mengembangkan dan mempromosikan ekosistem Esports yang stabil sebagai wadah penyalur hobi dan bakat, serta membawa nama daerah, khususnya Kota Samarinda, Kalimantan Timur, ke kancah nasional.
            </p>
          </div>

          {/* MISI */}
          <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none md:col-span-2 dark:border-white dark:bg-dark-surface">
            <div className="flex items-center space-x-2 text-brand-blue dark:text-brand-cyan">
              <Award className="h-6 w-6" />
              <h3 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white">MISI</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-steel-200">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan" />
                <span>Menjadi wadah bagi penggemar esports dan game untuk menyalurkan hobi, memperluas relasi, serta menambah wawasan.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan" />
                <span>Mendorong semangat berkompetisi yang sehat dan berintegritas di dalam maupun di luar komunitas.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan" />
                <span>Membangun manajemen tim yang baik, solid, transparan, dan terstruktur.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan" />
                <span>Berpartisipasi aktif dalam mengikuti berbagai ajang kompetisi regional maupun nasional.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. Tiga Tujuan Organisasi */}
        <div className="mt-8 border-2 border-slate-900 bg-slate-50 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
          <h3 className="font-display text-xl font-black text-slate-900 uppercase sm:text-2xl dark:text-white">
            3 Pilar Tujuan Utama Organisasi
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="border-l-4 border-brand-blue pl-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue dark:text-brand-cyan">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>PILAR 01</span>
              </div>
              <h4 className="mt-1 font-display text-base font-bold text-slate-900 uppercase dark:text-white">Ruang Lingkup Luas</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-steel-300">
                Memperluas ruang lingkup komunitas agar tidak hanya berfokus pada aktivitas bermain game bersama, tetapi juga mampu bertindak sebagai penyelenggara turnamen dan pelopor kegiatan sosial.
              </p>
            </div>

            <div className="border-l-4 border-brand-blue pl-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue dark:text-brand-cyan">
                <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
                <span>PILAR 02</span>
              </div>
              <h4 className="mt-1 font-display text-base font-bold text-slate-900 uppercase dark:text-white">Aksi Sosial Rutin</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-steel-300">
                Menjadikan organisasi sebagai wadah utama untuk menggerakkan berbagai kegiatan sosial secara rutin (seperti bakti sosial, penggalangan dana, dan aksi relawan peduli sesama).
              </p>
            </div>

            <div className="border-l-4 border-brand-blue pl-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue dark:text-brand-cyan">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>PILAR 03</span>
              </div>
              <h4 className="mt-1 font-display text-base font-bold text-slate-900 uppercase dark:text-white">Karakter & Integritas</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-steel-300">
                Membentuk karakter anggota dan tata kelola organisasi yang visioner, komunikatif, adil, penuh tanggung jawab, serta memiliki empati sosial yang tinggi.
              </p>
            </div>

          </div>
        </div>

        {/* CTA Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none sm:flex-row dark:border-white dark:bg-dark-surface">
          <div>
            <h4 className="font-display text-xl font-black text-slate-900 uppercase dark:text-white">
              Tertarik Mengenal Struktur Kepengurusan?
            </h4>
            <p className="text-xs text-slate-600 dark:text-steel-300 mt-1">
              Lihat jajaran pengurus lengkap, founder, dan administrator tiap divisi game.
            </p>
          </div>
          <Link
            href="/roster"
            className="brutal-btn flex items-center gap-2 px-6 py-3.5 text-xs font-bold whitespace-nowrap rounded-none"
          >
            <span>LIHAT STRUKTUR PENGURUS</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
