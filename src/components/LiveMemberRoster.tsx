"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowUpRight,
  Flame,
  Crosshair,
  Download,
} from "lucide-react";

interface Member {
  id: string;
  fullName: string;
  gameNickname: string;
  division: string;
  city: string;
  playerType: string;
  timestamp: string;
  status: string;
  verified?: boolean;
  avatarUrl?: string;
}

export default function LiveMemberRoster() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const exportToCSV = () => {
    if (members.length === 0) {
      alert("Belum ada data anggota untuk diekspor ke Excel.");
      return;
    }
    const headers = [
      "Waktu Pendaftaran",
      "Nama Lengkap",
      "Nickname In-Game",
      "ID Game",
      "Divisi",
      "Domisili",
      "WhatsApp",
      "Discord",
      "Tipe Player",
      "Status",
    ];
    const rows = members.map((m) => [
      `"${m.timestamp || ""}"`,
      `"${m.fullName || ""}"`,
      `"${m.gameNickname || ""}"`,
      `"${(m as any).gameId || "-"}"`,
      `"${m.division || ""}"`,
      `"${m.city || ""}"`,
      `"${(m as any).whatsapp || ""}"`,
      `"${(m as any).discordTag || "-"}"`,
      `"${m.playerType || ""}"`,
      `"${m.status || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cees_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchMembers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/join?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.members) {
          setMembers(data.members);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data live member:", err);
    } finally {
      if (!silent) setLoading(false);
      const now = new Date();
      setLastRefreshed(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WITA"
      );
    }
  };

  useEffect(() => {
    fetchMembers();

    // Instant sync saat ada pendaftar baru dari formulir di halaman
    const handleMemberRegistered = (e: Event) => {
      const customEvent = e as CustomEvent<Member>;
      if (customEvent.detail) {
        const newMember = customEvent.detail;
        setMembers((prev) => [newMember, ...prev.filter((m) => m.id !== newMember.id)]);
      }
      setTimeout(() => fetchMembers(true), 500);
    };

    window.addEventListener("memberRegistered", handleMemberRegistered);

    // Polling live setiap 10 detik
    const interval = setInterval(() => fetchMembers(true), 10000);

    return () => {
      window.removeEventListener("memberRegistered", handleMemberRegistered);
      clearInterval(interval);
    };
  }, []);

  const divisionFilters = [
    { label: "SEMUA DIVISI", value: "ALL" },
    { label: "PUBG MOBILE", value: "PUBGM" },
    { label: "MOBILE LEGENDS", value: "MLBB" },
    { label: "ROBLOX", value: "ROBLOX" },
  ];

  const filteredMembers = members.filter((m) => {
    const matchesDiv =
      selectedDivision === "ALL" ||
      m.division.toUpperCase().includes(selectedDivision);

    const matchesSearch =
      searchQuery === "" ||
      m.gameNickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDiv && matchesSearch;
  });

  const getDivisionBadgeColor = (div: string) => {
    const d = div.toUpperCase();
    if (d.includes("PUBG")) return "bg-brand-blue text-white border-slate-900";
    if (d.includes("MLBB") || d.includes("MOBILE")) return "bg-purple-600 text-white border-slate-900";
    if (d.includes("ROBLOX")) return "bg-brand-cyan text-slate-900 border-slate-900";
    return "bg-slate-800 text-white border-slate-900";
  };

  return (
    <div className="border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface sm:p-8">

      {/* Telemetry Header */}
      <div className="flex flex-col justify-between gap-4 border-b-2 border-slate-900 pb-6 dark:border-white md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center space-x-2 border-2 border-slate-900 bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-700 shadow-[2px_2px_0px_0px_#10B981] dark:border-white dark:bg-emerald-950/60 dark:text-emerald-400">
            <span className="h-2.5 w-2.5 animate-pulse bg-emerald-500 rounded-none" />
            <span className="tracking-wider uppercase">LIVE DATABASE FEED • REALTIME</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            DATA MEMBER BERGABUNG LIVE
          </h2>
          <p className="mt-1 font-mono text-xs text-slate-600 dark:text-steel-400">
            Daftar seluruh anggota komunitas CEES AREA, baik pendaftar baru maupun anggota terverifikasi (Realtime Live Feed).
          </p>
        </div>

        {/* Counter & Action */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          {/* Total Member Counter (Sesuai Jumlah Data Nyata) */}
          <div className="border-2 border-slate-900 bg-slate-100 px-4 py-2 text-center shadow-[3px_3px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
            <div className="text-[10px] font-bold text-slate-600 uppercase dark:text-steel-400">
              TOTAL ANGGOTA
            </div>
            <div className="font-display text-2xl font-black text-brand-blue dark:text-brand-cyan">
              {members.length}
            </div>
            {filteredMembers.length !== members.length && (
              <div className="text-[9px] font-bold text-slate-500 dark:text-steel-400">
                ({filteredMembers.length} sesuai filter)
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchMembers()}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-50 disabled:opacity-50 dark:border-white dark:bg-dark-base dark:text-white rounded-none transition-colors"
            title="Muat ulang data live"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-50 dark:border-white dark:bg-dark-base dark:text-white rounded-none transition-colors"
            title="Download data pendaftar sebagai file Excel/CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Division Filters */}
      <div className="mt-6 flex flex-col gap-4 border-b-2 border-slate-900 pb-6 dark:border-white lg:flex-row lg:items-center lg:justify-between">

        {/* Division Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {divisionFilters.map((df) => (
            <button
              key={df.value}
              type="button"
              onClick={() => setSelectedDivision(df.value)}
              className={`border-2 px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all rounded-none ${selectedDivision === df.value
                  ? "border-brand-blue bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#FFFFFF]"
                  : "border-slate-900 bg-white text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-slate-50 dark:border-white dark:bg-dark-base dark:text-white"
                }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nickname atau kota..."
            className="w-full border-2 border-slate-900 bg-slate-50 py-2 pl-9 pr-4 font-mono text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:border-white dark:bg-dark-base dark:text-white"
          />
        </div>
      </div>

      {/* Live Member Roster Grid */}
      <div className="mt-6">
        {filteredMembers.length === 0 ? (
          members.length === 0 ? (
            <div className="border-2 border-dashed border-slate-400 p-10 text-center font-mono text-xs text-slate-600 dark:border-slate-700 dark:text-steel-400">
              <Users className="mx-auto h-12 w-12 text-slate-400 dark:text-steel-500 mb-3" />
              <h4 className="font-display text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                DATABASE LIVE SIAP MENERIMA PENDAFTAR
              </h4>
              <p className="mt-1.5 max-w-md mx-auto text-xs leading-relaxed text-slate-600 dark:text-steel-400">
                Belum ada anggota yang terdaftar di database live. Setiap calon anggota yang mendaftar melalui formulir resmi akan otomatis muncul secara live di sini!
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-400 p-8 text-center font-mono text-xs text-slate-600 dark:border-slate-700 dark:text-steel-400">
              Tidak ada member ditemukan dengan kriteria &quot;{searchQuery}&quot;.
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member, idx) => {
              const isVerified = Boolean(member.verified);
              return (
                <div
                  key={member.id || idx}
                  className={`group relative flex flex-col justify-between border-2 bg-white p-4.5 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 dark:bg-dark-base ${!isVerified
                      ? "border-amber-500 shadow-[4px_4px_0px_0px_#D97706] dark:border-amber-400"
                      : "border-slate-900 shadow-[4px_4px_0px_0px_#0030FF] dark:border-white"
                    }`}
                >
                  <div>
                    {/* Top Bar: Division + Status */}
                    <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2.5 dark:border-slate-800">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider rounded-none ${getDivisionBadgeColor(
                          member.division
                        )}`}
                      >
                        {member.division}
                      </span>

                      <div className="flex items-center space-x-2">
                        {isVerified ? (
                          <span className="flex items-center space-x-1 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            <span>VERIFIED</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 font-mono text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 border border-amber-500 animate-pulse">
                            <Clock className="h-3 w-3" />
                            <span>PENDING WA</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nickname & Full Name with Avatar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden border-2 border-slate-900 bg-slate-100 shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-dark-surface">
                        <Image
                          src={member.avatarUrl || "/assets/default_avatar.jpg"}
                          alt={member.gameNickname || "Member"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-mono text-base font-black tracking-wide text-slate-900 uppercase transition-colors group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan">
                          {member.gameNickname}
                        </h3>
                        <p className="truncate font-mono text-xs font-medium text-slate-600 dark:text-steel-400">
                          {member.fullName}
                        </p>
                      </div>
                    </div>

                    {/* Player Role & Details */}
                    <div className="mt-3 space-y-1 font-mono text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-700 dark:text-steel-300">
                        <Crosshair className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                        <span className="font-bold text-[11px]">{member.playerType}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-600 dark:text-steel-400">
                        <MapPin className="h-3.5 w-3.5 text-brand-blue" />
                        <span>{member.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar: Timestamp */}
                  <div className="mt-4 flex items-center justify-between border-t-2 border-slate-100 pt-2.5 font-mono text-[10px] text-slate-500 dark:border-slate-800 dark:text-steel-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{member.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t-2 border-slate-900 pt-4 font-mono text-[11px] text-slate-600 dark:border-white dark:text-steel-400">
        <div>
          Sinkronisasi Terakhir: <strong className="text-slate-900 dark:text-white">{lastRefreshed || "Baru saja"}</strong>
        </div>
        <div className="flex items-center space-x-1">
          <span>Total Database:</span>
          <strong className="text-brand-blue dark:text-brand-cyan font-bold">{members.length} Anggota Terdaftar</strong>
        </div>
      </div>

    </div>
  );
}
