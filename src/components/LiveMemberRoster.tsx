"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowUpRight,
  Flame,
  Gamepad2,
  Crosshair,
  Shield,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
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
}

export default function LiveMemberRoster() {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState<number>(90);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const toggleAdminMode = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      return;
    }
    const pin = window.prompt("Masukkan PIN Administrator untuk mengelola data (Default: cees2026):");
    if (pin === "cees2026") {
      setIsAdminMode(true);
    } else if (pin !== null) {
      alert("PIN Administrator salah!");
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus data "${name}" dari sistem database?`)) return;
    try {
      setIsDeleting(id);
      const res = await fetch(`/api/join?id=${id}&pin=cees2026`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setTotalCount((prev) => Math.max(90, prev - 1));
      } else {
        alert(data.error || "Gagal menghapus data.");
      }
    } catch (err) {
      alert("Terjadi kendala saat menghapus data.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm("PERINGATAN: Yakin ingin menghapus SEMUA data pendaftar/dummy dari database?")) return;
    try {
      const res = await fetch(`/api/join?id=all&pin=cees2026`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers([]);
        setTotalCount(90);
        alert("Semua data pendaftar berhasil dibersihkan!");
      } else {
        alert(data.error || "Gagal membersihkan data.");
      }
    } catch (err) {
      alert("Terjadi kendala saat membersihkan data.");
    }
  };

  const exportToCSV = () => {
    if (members.length === 0) {
      alert("Belum ada data pendaftar untuk diekspor ke Excel.");
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
          setTotalCount(data.totalCount || 90);
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

    // Instant sync ketika formulir di halaman disubmit
    const handleMemberRegistered = (e: Event) => {
      const customEvent = e as CustomEvent<Member>;
      if (customEvent.detail) {
        const newMember = customEvent.detail;
        setMembers((prev) => [newMember, ...prev.filter((m) => m.id !== newMember.id)]);
        setTotalCount((prev) => prev + 1);
      }
      // Re-fetch to guarantee sync with server
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
            Daftar anggota resmi & pendaftar yang terverifikasi ke sistem komunitas CEES AREA.
          </p>
        </div>

        {/* Counter & Action */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <div className="border-2 border-slate-900 bg-slate-100 px-4 py-2 text-center shadow-[3px_3px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
            <div className="text-[10px] font-bold text-slate-600 uppercase dark:text-steel-400">
              TOTAL ROSTER
            </div>
            <div className="font-display text-2xl font-black text-brand-blue dark:text-brand-cyan">
              {totalCount}+
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchMembers()}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-50 disabled:opacity-50 dark:border-white dark:bg-dark-base dark:text-white rounded-none"
            title="Muat ulang data live"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-50 dark:border-white dark:bg-dark-base dark:text-white rounded-none"
            title="Download data pendaftar sebagai file Excel/CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            type="button"
            onClick={toggleAdminMode}
            className={`inline-flex items-center space-x-1.5 border-2 border-slate-900 px-3 py-2.5 text-xs font-bold shadow-[2px_2px_0px_0px_#000000] transition-colors rounded-none dark:border-white ${isAdminMode
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-dark-base dark:text-steel-300"
              }`}
            title="Mode Administrator (Kelola & Hapus Data)"
          >
            {isAdminMode ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span className="hidden sm:inline">{isAdminMode ? "Admin Aktif" : "Admin"}</span>
          </button>

          <Link
            href="/join"
            className="brutal-btn inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold"
          >
            <span>Daftar Member</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Admin Action Bar (Only when Admin Mode is unlocked) */}
      {isAdminMode && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-2 border-red-500 bg-red-50 p-4 font-mono text-xs text-red-950 dark:border-red-500 dark:bg-red-950/40 dark:text-red-200 shadow-[4px_4px_0px_0px_#EF4444] rounded-none">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span>
              <strong>MODE ADMINISTRATOR AKTIF</strong>: Anda dapat menghapus entri member satu per satu atau mereset seluruh database.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="border-2 border-red-700 bg-red-600 px-3 py-1.5 font-bold text-white shadow-[2px_2px_0px_0px_#000000] hover:bg-red-700 rounded-none inline-flex items-center space-x-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Semua Pendaftar (Reset)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="border border-slate-700 bg-white px-2.5 py-1.5 text-slate-900 hover:bg-slate-100 dark:bg-dark-base dark:text-white rounded-none text-xs"
            >
              Kunci Kembali
            </button>
          </div>
        </div>
      )}

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
                Semua data dummy telah dibersihkan. Setiap calon anggota yang mendaftar melalui formulir resmi akan otomatis muncul secara live di sini!
              </p>
              <div className="mt-5">
                <Link
                  href="/join"
                  className="brutal-btn inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold"
                >
                  <span>Daftar Member Pertama</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-400 p-8 text-center font-mono text-xs text-slate-600 dark:border-slate-700 dark:text-steel-400">
              Tidak ada member ditemukan dengan kriteria &quot;{searchQuery}&quot;.
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member, idx) => {
              const isNewMember = member.status === "MEMBER BARU";
              return (
                <div
                  key={member.id || idx}
                  className={`group relative flex flex-col justify-between border-2 bg-white p-4.5 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 dark:bg-dark-base ${isNewMember
                      ? "border-brand-blue shadow-[5px_5px_0px_0px_#0030FF] ring-2 ring-brand-blue/20 dark:border-brand-cyan dark:shadow-[5px_5px_0px_0px_#00F0FF]"
                      : "border-slate-900 shadow-[4px_4px_0px_0px_#0030FF] dark:border-white"
                    }`}
                >
                  <div>
                    {/* Top Bar: Division + Status + Admin Delete */}
                    <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2.5 dark:border-slate-800">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider rounded-none ${getDivisionBadgeColor(
                          member.division
                        )}`}
                      >
                        {member.division}
                      </span>

                      <div className="flex items-center space-x-2">
                        {isNewMember ? (
                          <span className="flex items-center space-x-1 font-mono text-[10px] font-black text-brand-blue dark:text-brand-cyan bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 border border-brand-blue dark:border-brand-cyan animate-pulse">
                            <Flame className="h-3 w-3" />
                            <span>MEMBER BARU</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            <span>{member.status || "VERIFIED"}</span>
                          </span>
                        )}

                        {isAdminMode && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id, member.gameNickname || member.fullName)}
                            disabled={isDeleting === member.id}
                            className="border border-red-600 bg-red-50 px-1.5 py-0.5 text-red-600 hover:bg-red-600 hover:text-white font-mono text-[10px] font-bold inline-flex items-center space-x-1 dark:bg-red-950/60 dark:text-red-300 rounded-none transition-colors"
                            title="Hapus pendaftar ini dari database"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Nickname & Full Name */}
                    <div className="mt-3">
                      <h3 className="font-mono text-base font-black tracking-wide text-slate-900 uppercase transition-colors group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan">
                        {member.gameNickname}
                      </h3>
                      <p className="font-mono text-xs font-medium text-slate-600 dark:text-steel-400">
                        {member.fullName}
                      </p>
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
          <span>Ingin namamu ada di daftar ini?</span>
          <Link href="/join" className="font-bold text-brand-blue underline dark:text-brand-cyan">
            Daftar Sekarang
          </Link>
        </div>
      </div>

    </div>
  );
}
