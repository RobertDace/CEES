"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { STAFF_MEMBERS, StaffMember } from "@/data/community";
import { Users, ArrowUpRight, Filter, ShieldCheck } from "lucide-react";

export default function RosterPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const categories = [
    { label: "SEMUA PENGURUS", value: "ALL" },
    { label: "FOUNDER & KETUA", value: "Founder & Community Lead" },
    { label: "DIVISI PUBGM", value: "Divisi PUBGM" },
    { label: "DIVISI MLBB", value: "Divisi MLBB" },
    { label: "DIVISI ROBLOX", value: "Divisi Roblox" },
    { label: "MEDIA & BRANDING", value: "Media & Branding" },
  ];

  const filteredStaff = STAFF_MEMBERS.filter((member) => {
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "Founder & Community Lead") return member.isFounder;
    return member.division === selectedFilter || member.role.includes(selectedFilter);
  });

  return (
    <div className="py-12 lg:py-20 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="border-b-2 border-slate-900 pb-8 dark:border-white">
          <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-brand-blue dark:bg-dark-surface dark:text-brand-cyan">
            <Users className="h-4 w-4" />
            <span className="uppercase tracking-wider font-mono">Struktur Kepengurusan Resmi</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
            PENGURUS & ROSTER
          </h1>
          <p className="mt-2 text-sm font-bold text-brand-blue dark:text-brand-cyan">
            Pilar-pilar penggerak komunitas CEES AREA yang mengelola kegiatan kompetitif, media komunikasi, serta administrasi seluruh divisi.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b-2 border-slate-900 pb-6 dark:border-white">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white mr-2">
            <Filter className="h-3.5 w-3.5 text-brand-blue" />
            <span>KATEGORI:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedFilter(cat.value)}
              className={`rounded-none border-2 px-3.5 py-1.5 font-display text-xs font-bold tracking-wider uppercase transition-all ${
                selectedFilter === cat.value
                  ? "border-brand-blue bg-brand-blue text-white shadow-[2px_2px_0px_0px_#0F172A] dark:shadow-[2px_2px_0px_0px_#FFFFFF]"
                  : "border-slate-900 bg-white text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-slate-50 dark:border-white dark:bg-dark-surface dark:text-white dark:hover:bg-dark-base"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Staff Grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((staff: StaffMember) => (
            <div
              key={staff.id}
              className={`group relative flex flex-col justify-between border-2 border-slate-900 bg-white shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#0030FF] ${
                staff.isFounder
                  ? "ring-2 ring-brand-blue"
                  : ""
              }`}
            >
              <div>
                {/* Photo Frame */}
                <div className="relative aspect-square w-full overflow-hidden border-b-2 border-slate-900 bg-slate-950 dark:border-white">
                  <Image
                    src={staff.image}
                    alt={staff.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    {staff.isFounder ? (
                      <span className="border-2 border-white bg-brand-blue px-3 py-1 font-mono text-xs font-bold text-white uppercase shadow-[2px_2px_0px_0px_#000000] rounded-none">
                        FOUNDER & LEAD
                      </span>
                    ) : (
                      <span className="border border-white bg-slate-950/90 px-2.5 py-0.5 font-mono text-xs font-bold text-brand-cyan uppercase shadow-[2px_2px_0px_0px_#000000] rounded-none">
                        {staff.division}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-blue dark:text-brand-cyan uppercase">
                      {staff.role}
                    </span>
                    {staff.nickname && (
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-steel-400">
                        &quot;{staff.nickname}&quot;
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 font-display text-2xl font-black text-slate-900 uppercase group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan transition-colors">
                    {staff.name}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-steel-200">
                    {staff.bio}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t-2 border-slate-900 bg-slate-100 px-6 py-3 font-mono text-xs font-bold text-slate-800 dark:border-white dark:bg-dark-base dark:text-steel-300 flex justify-between items-center rounded-none">
                <span>DIVISI: {staff.division}</span>
                <span className="flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>AKTIF</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recruitment Footer Note */}
        <div className="mt-16 border-2 border-slate-900 bg-slate-50 p-8 text-center sm:p-12 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
          <h3 className="font-display text-2xl font-black text-slate-900 uppercase sm:text-3xl dark:text-white">
            Ingin Menjadi Anggota atau Pengurus Baru?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-slate-700 dark:text-steel-300">
            CEES AREA selalu membuka kesempatan bagi kamu yang berjiwa kompetitif, kreatif di bidang media, maupun ingin berkontribusi dalam manajemen turnamen lokal.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/join"
              className="brutal-btn inline-flex items-center space-x-2 px-8 py-4 text-sm font-bold rounded-none"
            >
              <span>DAFTARKAN DIRIMU SEKARANG</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
