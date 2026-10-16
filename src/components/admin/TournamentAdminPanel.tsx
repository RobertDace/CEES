"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Swords,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Crosshair,
  RefreshCw,
  Archive,
  Share2,
  Download,
  Copy,
  Check,
  Flame,
  ChevronDown,
} from "lucide-react";
import {
  LiveTournamentData,
  TournamentTeam,
  TournamentMatch,
  TournamentStanding,
  ArchivedTournament,
  calculatePUBGMStandings,
  PMWC_RANK_POINTS,
  OFFICIAL_MAPS,
} from "@/lib/tournament/pubgmCalculator";
import {
  fetchLiveTournamentFromApi,
  saveLiveTournament,
  archiveCurrentTournament,
  fetchArchivedTournamentsFromApi,
} from "@/lib/tournament/tournamentHelper";
import {
  exportTournamentToExcel,
  generateWhatsAppShareText,
} from "@/lib/tournament/exportTournamentUtils";
import TournamentShareModal from "../tournament/TournamentShareModal";
import TournamentArchiveModal from "../tournament/TournamentArchiveModal";
import { ceesAlert } from "@/lib/ceesAlert";

export default function TournamentAdminPanel() {
  const [tournament, setTournament] = useState<LiveTournamentData | null>(null);
  const [archives, setArchives] = useState<ArchivedTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Match calculator state
  const [selectedMatchNumber, setSelectedMatchNumber] = useState<number>(1);
  const [matchMap, setMatchMap] = useState<string>("Erangel");
  const [matchCompleted, setMatchCompleted] = useState<boolean>(true);
  const [teamScoreInputs, setTeamScoreInputs] = useState<
    Record<string, { rank: number; kills: number }>
  >({});

  // Share Modal & WA Text
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  // New team form state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamCode, setNewTeamCode] = useState("");

  const tournamentRef = React.useRef<LiveTournamentData | null>(tournament);
  useEffect(() => {
    tournamentRef.current = tournament;
  }, [tournament]);

  useEffect(() => {
    loadData();

    // Dengarkan event save all dari tombol mengambang admin utama
    const handleGlobalSave = async () => {
      if (tournamentRef.current) {
        setSaving(true);
        const res = await saveLiveTournament(tournamentRef.current);
        setSaving(false);
        if (res.success) {
          setSaveStatus("Data turnamen dan daftar tim berhasil disimpan!");
          setTimeout(() => setSaveStatus(null), 3500);
        }
      }
    };

    window.addEventListener("cees_admin_save_tournament", handleGlobalSave);
    return () => {
      window.removeEventListener("cees_admin_save_tournament", handleGlobalSave);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [liveData, archList] = await Promise.all([
        fetchLiveTournamentFromApi(),
        fetchArchivedTournamentsFromApi(),
      ]);
      if (liveData) {
        setTournament(liveData);
        syncMatchForm(liveData, selectedMatchNumber);
      }
      setArchives(archList);
    } catch (err: any) {
      setErrorStatus("Gagal memuat data turnamen.");
    } finally {
      setLoading(false);
    }
  };

  const syncMatchForm = (data: LiveTournamentData, matchNum: number) => {
    const match = data.matches.find((m) => m.matchNumber === matchNum);
    if (match) {
      setMatchMap(match.mapName || "Erangel");
      setMatchCompleted(match.isCompleted);

      const inputs: Record<string, { rank: number; kills: number }> = {};
      data.teams.forEach((t) => {
        const found = match.teamResults?.find((r) => r.teamId === t.id);
        inputs[t.id] = {
          rank: found ? found.rank : 16,
          kills: found ? found.kills : 0,
        };
      });
      setTeamScoreInputs(inputs);
    } else {
      // New match defaults
      const inputs: Record<string, { rank: number; kills: number }> = {};
      data.teams.forEach((t, i) => {
        inputs[t.id] = { rank: i + 1, kills: 0 };
      });
      setTeamScoreInputs(inputs);
      setMatchMap("Erangel");
      setMatchCompleted(false);
    }
  };

  const handleSelectMatch = (num: number) => {
    setSelectedMatchNumber(num);
    if (tournament) {
      syncMatchForm(tournament, num);
    }
  };

  // Toggle Show/Hide on Homepage
  const handleToggleVisibility = async () => {
    if (!tournament) return;
    const updated = {
      ...tournament,
      isVisible: !tournament.isVisible,
    };
    setTournament(updated);
    setSaving(true);
    const res = await saveLiveTournament(updated);
    setSaving(false);
    if (res.success) {
      setSaveStatus(
        updated.isVisible
          ? "Turnamen sekarang TAMPIL di Beranda."
          : "Turnamen sekarang DISEMBUNYIKAN dari Beranda."
      );
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setErrorStatus("Gagal mengubah visibilitas turnamen.");
    }
  };

  // Save General Tournament Info
  const handleSaveGeneralInfo = async () => {
    if (!tournament) return;
    setSaving(true);
    ceesAlert.loading({
      title: "MENYIMPAN INFO TURNAMEN",
      message: "Menyimpan judul, subtitle, prizepool, dan status turnamen ke server HQ...",
      showProgress: true,
      progress: 50,
    });
    const res = await saveLiveTournament(tournament);
    setSaving(false);
    if (res.success) {
      setSaveStatus("Informasi umum turnamen berhasil disimpan!");
      ceesAlert.success("INFORMASI TERSIMPAN", "Pengaturan umum turnamen berhasil diperbarui!");
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setErrorStatus("Gagal menyimpan informasi turnamen.");
      ceesAlert.error("GAGAL MENYIMPAN", "Gagal menyimpan konfigurasi turnamen.");
    }
  };

  // Update Team In-Place (Code or Name)
  const handleUpdateTeam = (teamId: string, field: "name" | "code", value: string) => {
    if (!tournament) return;
    const updatedTeams = tournament.teams.map((t) =>
      t.id === teamId ? { ...t, [field]: value } : t
    );
    const updatedTournament = {
      ...tournament,
      teams: updatedTeams,
    };
    setTournament(updatedTournament);
  };

  // Save All Teams Permanently
  const handleSaveTeams = async () => {
    if (!tournament) return;
    setSaving(true);
    setSaveStatus(null);
    setErrorStatus(null);
    ceesAlert.loading({
      title: "MENYIMPAN DAFTAR TIM",
      message: "Menyinkronkan daftar tim, kode klan, dan peserta turnamen...",
      showProgress: true,
      progress: 60,
    });
    const res = await saveLiveTournament(tournament);
    setSaving(false);
    if (res.success) {
      setSaveStatus("Daftar nama tim & kode klan berhasil disimpan secara permanen!");
      ceesAlert.success(
        "TIM BERHASIL DISIMPAN",
        "Semua nama tim dan kode klan telah disimpan permanen ke server dan disinkronkan ke Beranda!"
      );
      setTimeout(() => setSaveStatus(null), 3500);
    } else {
      setErrorStatus("Gagal menyimpan perubahan daftar tim.");
      ceesAlert.error("GAGAL MENYIMPAN", "Gagal menyimpan perubahan daftar tim.");
    }
  };

  // Add Team
  const handleAddTeam = async () => {
    if (!tournament) return;
    if (!newTeamName.trim() || !newTeamCode.trim()) {
      ceesAlert.warning(
        "DATA BELUM LENGKAP",
        "Nama tim dan kode klan wajib diisi sebelum menambahkan tim baru!"
      );
      return;
    }
    const newTeam: TournamentTeam = {
      id: "team-" + Date.now(),
      name: newTeamName.trim().toUpperCase(),
      code: newTeamCode.trim().toUpperCase(),
    };
    const updatedTeams = [...tournament.teams, newTeam];
    const updatedTournament = {
      ...tournament,
      teams: updatedTeams,
    };
    setTournament(updatedTournament);
    setNewTeamName("");
    setNewTeamCode("");
    syncMatchForm(updatedTournament, selectedMatchNumber);

    // Auto-save segera agar tidak hilang saat refresh
    setSaving(true);
    const res = await saveLiveTournament(updatedTournament);
    setSaving(false);
    if (res.success) {
      setSaveStatus(`Tim "${newTeam.name}" berhasil ditambahkan & disimpan!`);
      ceesAlert.toast({
        type: "success",
        title: "TIM BARU DITAMBAHKAN",
        message: `Tim "${newTeam.name}" [${newTeam.code}] berhasil didaftarkan.`,
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setErrorStatus("Gagal menyimpan tim baru.");
      ceesAlert.error("GAGAL MENAMBAH TIM", "Gagal menyimpan tim baru ke database.");
    }
  };

  // Remove Team
  const handleRemoveTeam = async (teamId: string) => {
    if (!tournament) return;
    const teamToRemove = tournament.teams.find((t) => t.id === teamId);
    const confirmed = await ceesAlert.confirm({
      title: "HAPUS TIM PESERTA",
      message: `Yakin ingin menghapus tim "${teamToRemove?.name || teamId}" dari daftar peserta turnamen?`,
      danger: true,
      confirmText: "YA, HAPUS PESERTA",
      cancelText: "BATAL",
    });

    if (!confirmed) return;

    const updatedTeams = tournament.teams.filter((t) => t.id !== teamId);
    const updatedTournament = {
      ...tournament,
      teams: updatedTeams,
    };
    setTournament(updatedTournament);
    syncMatchForm(updatedTournament, selectedMatchNumber);

    // Auto-save segera agar sinkron permanen
    setSaving(true);
    const res = await saveLiveTournament(updatedTournament);
    setSaving(false);
    if (res.success) {
      setSaveStatus(`Tim "${teamToRemove?.name || ""}" berhasil dihapus.`);
      ceesAlert.toast({
        type: "info",
        title: "TIM DIHAPUS",
        message: `Tim "${teamToRemove?.name || ""}" telah dihapus dari turnamen.`,
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setErrorStatus("Gagal menghapus tim.");
      ceesAlert.error("GAGAL MENGHAPUS TIM", "Terjadi kesalahan saat menghapus tim dari server.");
    }
  };

  // Save Match Scores
  const handleSaveMatchScores = async () => {
    if (!tournament) return;
    setSaving(true);

    ceesAlert.loading({
      title: "MENYIMPAN SKOR MATCH",
      message: `Mengkalkulasi sistem 10-Point PMWC untuk Match #${selectedMatchNumber} (${matchMap})...`,
      showProgress: true,
      progress: 60,
    });

    const matchResults = tournament.teams.map((t) => ({
      teamId: t.id,
      rank: Number(teamScoreInputs[t.id]?.rank) || 16,
      kills: Number(teamScoreInputs[t.id]?.kills) || 0,
    }));

    const existingMatchIndex = tournament.matches.findIndex(
      (m) => m.matchNumber === selectedMatchNumber
    );

    const updatedMatches = [...tournament.matches];
    const newMatchObj: TournamentMatch = {
      matchId: `m${selectedMatchNumber}`,
      matchNumber: selectedMatchNumber,
      mapName: matchMap,
      isCompleted: matchCompleted,
      teamResults: matchResults,
    };

    if (existingMatchIndex >= 0) {
      updatedMatches[existingMatchIndex] = newMatchObj;
    } else {
      updatedMatches.push(newMatchObj);
    }

    const updatedTournament: LiveTournamentData = {
      ...tournament,
      currentMatch: selectedMatchNumber,
      currentMap: matchMap,
      matches: updatedMatches,
    };

    setTournament(updatedTournament);

    const res = await saveLiveTournament(updatedTournament);
    setSaving(false);
    if (res.success) {
      const msg = `Hasil Match #${selectedMatchNumber} (${matchMap}) berhasil disimpan & dikalkulasi!`;
      setSaveStatus(msg);
      ceesAlert.success("SKOR MATCH TERSIMPAN", msg);
      setTimeout(() => setSaveStatus(null), 3500);
    } else {
      setErrorStatus("Gagal menyimpan hasil match.");
      ceesAlert.error("GAGAL MENYIMPAN SKOR", "Gagal menyimpan hasil match ke database.");
    }
  };

  // Add Next Match
  const handleAddNewMatch = () => {
    if (!tournament) return;
    const nextNum = (tournament.matches.length || 0) + 1;
    setSelectedMatchNumber(nextNum);
    setMatchMap(OFFICIAL_MAPS[(nextNum - 1) % OFFICIAL_MAPS.length]);
    setMatchCompleted(false);

    const inputs: Record<string, { rank: number; kills: number }> = {};
    tournament.teams.forEach((t, i) => {
      inputs[t.id] = { rank: i + 1, kills: 0 };
    });
    setTeamScoreInputs(inputs);
    ceesAlert.toast({
      type: "info",
      title: `MATCH #${nextNum} DISIAPKAN`,
      message: `Form input skor untuk Match #${nextNum} (${OFFICIAL_MAPS[(nextNum - 1) % OFFICIAL_MAPS.length]}) aktif.`,
    });
  };

  // Archive Current Tournament
  const handleArchiveTournament = async () => {
    if (!tournament) return;
    const confirmed = await ceesAlert.confirm({
      title: "ARSIPKAN TURNAMEN",
      message: `Arsipkan turnamen "${tournament.title}" ke Hall of Fame? Seluruh rekaman match, statistik eliminasi, dan pemenang akan diabadikan di arsip komunitas.`,
      danger: true,
      confirmText: "YA, ARSIPKAN SEKARANG",
      cancelText: "BATALKAN",
    });

    if (!confirmed) return;

    setSaving(true);
    ceesAlert.loading({
      title: "MENGARSIPKAN TURNAMEN",
      message: "Menghitung klasemen final, menetapkan gelar juara, dan menyimpan ke Hall of Fame...",
      showProgress: true,
      progress: 65,
    });

    const res = await archiveCurrentTournament(tournament);
    setSaving(false);
    if (res.success) {
      setSaveStatus("Turnamen berhasil diarsipkan ke riwayat!");
      ceesAlert.success(
        "TURNAMEN DIARSIPKAN",
        `Turnamen "${tournament.title}" telah resmi diabadikan ke Hall of Fame!`
      );
      setTimeout(() => setSaveStatus(null), 3000);
      loadData();
    } else {
      setErrorStatus("Gagal mengarsipkan turnamen.");
      ceesAlert.error("GAGAL MENGARSIPKAN", "Terjadi kesalahan saat mengarsipkan turnamen.");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center font-mono text-sm text-slate-600 dark:text-steel-400">
        Memuat data turnamen & modul kalkulator...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="py-16 text-center font-mono text-sm text-rose-500">
        Gagal memuat konfigurasi turnamen.
      </div>
    );
  }

  const standings = calculatePUBGMStandings(tournament.teams, tournament.matches);

  return (
    <div className="space-y-8">
      {/* 1. VISIBILITY & LIVE STATUS CONTROL BANNER */}
      <div className="border-4 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-black uppercase text-brand-blue dark:text-brand-cyan tracking-wider">
                [ VISIBILITY CONTROLLER ]
              </span>
              <span
                className={`font-mono text-[10px] font-black px-2 py-0.5 border ${
                  tournament.isVisible
                    ? "bg-emerald-500 text-slate-950 border-emerald-600"
                    : "bg-amber-400 text-slate-950 border-amber-500"
                }`}
              >
                {tournament.isVisible ? "● TAMPIL DI BERANDA" : "○ TERSEMBUNYI (HIDDEN)"}
              </span>
            </div>
            <h3 className="mt-1 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
              Status Penayangan di Beranda
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-steel-400 max-w-2xl leading-relaxed">
              Jika event turnamen masih bulan depan, kamu bisa klik{" "}
              <strong>Sembunyikan dari Beranda</strong> agar halaman utama tetap bersih. Saat
              turnamen dimulai atau saat pengujian, kamu bisa aktifkan kembali kapan saja!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleVisibility}
              disabled={saving}
              className={`border-2 border-slate-900 px-5 py-3 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center space-x-2 ${
                tournament.isVisible
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {tournament.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>
                {tournament.isVisible ? "SEMBUNYIKAN DARI BERANDA" : "TAMPILKAN DI BERANDA"}
              </span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="brutal-btn flex items-center space-x-2 px-4 py-3 text-xs font-bold"
            >
              <Share2 className="h-4 w-4" />
              <span>TEST KARTU IG/TIKTOK</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {saveStatus && (
          <div className="mt-4 flex items-center gap-2 border-2 border-emerald-600 bg-emerald-50 p-3 font-mono text-xs font-bold uppercase text-emerald-800 shadow-[3px_3px_0px_0px_#059669] dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}
        {errorStatus && (
          <div className="mt-4 flex items-center gap-2 border-2 border-red-600 bg-red-50 p-3 font-mono text-xs font-bold uppercase text-red-800 shadow-[3px_3px_0px_0px_#DC2626] dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>{errorStatus}</span>
          </div>
        )}
      </div>

      {/* 2. GENERAL TOURNAMENT SETTINGS */}
      <div className="border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
            <h3 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
              Pengaturan Umum Turnamen
            </h3>
          </div>
          <button
            onClick={handleSaveGeneralInfo}
            disabled={saving}
            className="brutal-btn flex items-center space-x-1.5 px-4 py-2 text-xs font-bold"
          >
            <Save className="h-4 w-4" />
            <span>SIMPAN INFO UMUM</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Judul Turnamen
            </label>
            <input
              type="text"
              value={tournament.title}
              onChange={(e) => setTournament({ ...tournament, title: e.target.value })}
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-display text-base font-black uppercase text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Sub-judul / Tagline
            </label>
            <input
              type="text"
              value={tournament.subtitle}
              onChange={(e) => setTournament({ ...tournament, subtitle: e.target.value })}
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Status Event
            </label>
            <select
              value={tournament.status}
              onChange={(e) => setTournament({ ...tournament, status: e.target.value as any })}
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs font-bold uppercase text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            >
              <option value="LIVE">LIVE (SEDANG BERJALAN)</option>
              <option value="BREAK">BREAK (ISTIRAHAT / INTERMISSION)</option>
              <option value="UPCOMING">UPCOMING (SEGERA DIMULAI)</option>
              <option value="COMPLETED">COMPLETED (SELESAI)</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Total Pertandingan (Matches)
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={tournament.totalMatches}
              onChange={(e) =>
                setTournament({ ...tournament, totalMatches: Number(e.target.value) || 5 })
              }
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Prizepool / Hadiah
            </label>
            <input
              type="text"
              value={tournament.prizePool || ""}
              onChange={(e) => setTournament({ ...tournament, prizePool: e.target.value })}
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
              placeholder="Contoh: Rp 1.500.000 + Trophy"
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Tanggal & Lokasi
            </label>
            <input
              type="text"
              value={tournament.date}
              onChange={(e) => setTournament({ ...tournament, date: e.target.value })}
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
              placeholder="Contoh: November 2026 / Samarinda"
            />
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR / MATCH SCORING INTERFACE */}
      <div className="border-4 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-white pb-4">
          <div>
            <div className="flex items-center space-x-2 text-brand-blue dark:text-brand-cyan">
              <Swords className="h-5 w-5" />
              <span className="font-mono text-xs font-black uppercase tracking-wider">
                [ PUBGM MATCH CALCULATOR // PMWC RULES ]
              </span>
            </div>
            <h3 className="mt-1 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
              Input Skor & Hitung Klasemen
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddNewMatch}
              className="border-2 border-slate-900 bg-slate-100 px-3.5 py-2 font-mono text-xs font-bold uppercase text-slate-900 hover:bg-slate-200 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-dark-base dark:text-white"
            >
              + TAMBAH MATCH BARU
            </button>
            <button
              onClick={handleSaveMatchScores}
              disabled={saving}
              className="brutal-btn flex items-center space-x-1.5 px-5 py-2 text-xs font-bold"
            >
              <Save className="h-4 w-4" />
              <span>SIMPAN HASIL MATCH #{selectedMatchNumber}</span>
            </button>
          </div>
        </div>

        {/* Match Selector Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Array.from({ length: Math.max(tournament.matches.length, 3) }, (_, i) => i + 1).map(
            (num) => {
              const matchObj = tournament.matches.find((m) => m.matchNumber === num);
              const isActive = selectedMatchNumber === num;
              return (
                <button
                  key={num}
                  onClick={() => handleSelectMatch(num)}
                  className={`border-2 border-slate-900 px-4 py-2 font-mono text-xs font-black uppercase transition-all rounded-none dark:border-white ${
                    isActive
                      ? "bg-brand-blue text-white shadow-[3px_3px_0px_0px_#000] dark:bg-brand-cyan dark:text-slate-950"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-dark-base dark:text-steel-300"
                  }`}
                >
                  MATCH #{num} {matchObj?.isCompleted ? "✓" : ""}
                </button>
              );
            }
          )}
        </div>

        {/* Selected Match Settings */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-slate-900 bg-slate-50 p-4 dark:border-white dark:bg-dark-base">
          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Pilih Map untuk Match #{selectedMatchNumber}
            </label>
            <select
              value={matchMap}
              onChange={(e) => setMatchMap(e.target.value)}
              className="w-full border-2 border-slate-900 bg-white p-2.5 font-mono text-xs font-bold uppercase text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            >
              {OFFICIAL_MAPS.map((map) => (
                <option key={map} value={map}>
                  {map}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4 sm:pt-6">
            <label className="flex items-center space-x-2 cursor-pointer font-mono text-xs font-bold uppercase text-slate-900 dark:text-white select-none">
              <input
                type="checkbox"
                checked={matchCompleted}
                onChange={(e) => setMatchCompleted(e.target.checked)}
                className="h-4 w-4 rounded-none border-2 border-slate-900 text-brand-blue"
              />
              <span>Tandai Match Ini Sudah Selesai (Completed)</span>
            </label>
          </div>
        </div>

        {/* Teams Input Table */}
        <div className="mt-4 border-2 border-slate-900 overflow-x-auto dark:border-white">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-dark-void uppercase">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">TIM / PESERTA</th>
                <th className="py-2.5 px-4 w-32 text-center">PLACEMENT RANK (1-16)</th>
                <th className="py-2.5 px-4 w-28 text-center">KILLS</th>
                <th className="py-2.5 px-4 w-32 text-right">PLACEMENT PTS</th>
                <th className="py-2.5 px-4 w-32 text-right bg-brand-blue text-white">TOTAL PTS MATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-dark-border">
              {tournament.teams.map((t, index) => {
                const currentRank = teamScoreInputs[t.id]?.rank ?? index + 1;
                const currentKills = teamScoreInputs[t.id]?.kills ?? 0;
                const rankPts = PMWC_RANK_POINTS[currentRank] ?? 0;
                const totalMatchPts = rankPts + (Number(currentKills) || 0);

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-50 dark:hover:bg-dark-base ${
                      currentRank === 1 ? "bg-amber-50/60 dark:bg-amber-950/20" : ""
                    }`}
                  >
                    <td className="py-2 px-4 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-xs bg-slate-900 text-white px-1.5 py-0.5 border border-slate-900 dark:bg-white dark:text-slate-950">
                          {t.code}
                        </span>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => handleUpdateTeam(t.id, "name", e.target.value.toUpperCase())}
                          className="font-display font-black text-xs sm:text-sm uppercase text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-400/60 dark:border-steel-700 hover:border-brand-blue focus:border-brand-blue focus:outline-none px-1 py-0.5 w-full min-w-[140px]"
                          title="Klik untuk langsung ganti nama tim"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min={1}
                        max={tournament.teams.length || 20}
                        value={currentRank}
                        onChange={(e) =>
                          setTeamScoreInputs({
                            ...teamScoreInputs,
                            [t.id]: {
                              rank: Number(e.target.value) || 16,
                              kills: currentKills,
                            },
                          })
                        }
                        className="w-20 border-2 border-slate-900 p-1.5 text-center font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={currentKills}
                        onChange={(e) =>
                          setTeamScoreInputs({
                            ...teamScoreInputs,
                            [t.id]: {
                              rank: currentRank,
                              kills: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-20 border-2 border-slate-900 p-1.5 text-center font-mono text-xs font-bold text-rose-600 dark:border-white dark:bg-dark-surface dark:text-rose-400"
                      />
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-slate-700 dark:text-steel-300">
                      {rankPts} Pts
                    </td>
                    <td className="py-2 px-4 text-right font-display font-black text-sm text-slate-900 dark:text-white bg-blue-50/40 dark:bg-blue-950/20">
                      {totalMatchPts} Pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CRUD DAFTAR TIM / PESERTA */}
      <div className="border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 dark:border-white pb-3">
          <div>
            <h3 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
              Kelola Daftar Tim Peserta ({tournament.teams.length} Tim Terdaftar)
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-steel-400">
              Ganti nama tim & kode klan langsung di bawah, lalu klik Simpan. Fleksibel 12 - 20 tim per match.
            </p>
          </div>
          <button
            onClick={handleSaveTeams}
            disabled={saving}
            className="brutal-btn flex items-center space-x-2 px-5 py-2.5 text-xs font-black bg-brand-blue text-white hover:bg-blue-600 shadow-[3px_3px_0px_0px_#000]"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "MENYIMPAN TIM..." : "SIMPAN DAFTAR & NAMA TIM"}</span>
          </button>
        </div>

        {/* Add Team Form */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-2 border-slate-900 bg-slate-50 p-4 dark:border-white dark:bg-dark-surface">
          <input
            type="text"
            placeholder="Kode Klan (cth: CEES, BTR)"
            value={newTeamCode}
            onChange={(e) => setNewTeamCode(e.target.value.toUpperCase())}
            className="w-32 border-2 border-slate-900 p-2 font-mono text-xs uppercase font-bold text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
          />
          <input
            type="text"
            placeholder="Nama Lengkap Tim (cth: CEES GANK PRIME)"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value.toUpperCase())}
            className="flex-1 min-w-[200px] border-2 border-slate-900 p-2 font-mono text-xs uppercase text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
          />
          <button
            onClick={handleAddTeam}
            className="brutal-btn flex items-center space-x-1.5 px-4 py-2 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>TAMBAH TIM</span>
          </button>
        </div>

        {/* Teams Grid with Inline Editing */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
          {tournament.teams.map((t, idx) => (
            <div
              key={t.id}
              className="flex items-center gap-2 border-2 border-slate-900 p-2.5 bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-dark-surface"
            >
              <span className="font-mono text-xs font-black text-slate-400 dark:text-steel-500 w-7 text-center">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={t.code}
                onChange={(e) => handleUpdateTeam(t.id, "code", e.target.value.toUpperCase())}
                placeholder="TAG"
                title="Kode Klan (cth: CEES)"
                className="w-20 border-2 border-slate-900 bg-slate-900 text-white font-mono font-black text-xs px-2 py-1.5 uppercase text-center focus:bg-brand-blue focus:outline-none dark:border-white dark:bg-dark-base dark:text-white"
              />
              <input
                type="text"
                value={t.name}
                onChange={(e) => handleUpdateTeam(t.id, "name", e.target.value.toUpperCase())}
                placeholder="Nama Lengkap Tim"
                title="Nama Tim (cth: CEES GANK PRIME)"
                className="flex-1 min-w-0 border-2 border-slate-900 font-display font-black text-xs uppercase px-2.5 py-1.5 text-slate-900 focus:border-brand-blue focus:outline-none dark:border-white dark:bg-dark-base dark:text-white"
              />
              <button
                onClick={() => handleRemoveTeam(t.id)}
                className="border-2 border-slate-900 p-2 text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-colors dark:border-white"
                title="Hapus tim dari daftar turnamen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ARSIP & EXPORT ACTIONS */}
      <div className="border-4 border-slate-900 bg-slate-50 p-6 shadow-[6px_6px_0px_0px_#000] rounded-none dark:border-white dark:bg-dark-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-mono text-xs font-black uppercase">
              <Archive className="h-4 w-4" />
              <span>[ ARSIP & DOKUMENTASI ]</span>
            </div>
            <h3 className="mt-1 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
              Arsipkan Turnamen & Unduh Rekap
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-steel-400 max-w-xl">
              Ketika seluruh match selesai dan pemenang didapatkan, kamu bisa mengarsipkan turnamen
              ini ke riwayat agar tersimpan selamanya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="border-2 border-slate-900 bg-white px-4 py-2.5 font-mono text-xs font-bold text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_0px_#000] flex items-center space-x-1.5 dark:border-white dark:bg-dark-base dark:text-white"
            >
              <Archive className="h-4 w-4 text-amber-500" />
              <span>LIHAT DETAIL ARSIP</span>
            </button>

            <button
              onClick={() => exportTournamentToExcel(tournament, standings)}
              className="border-2 border-slate-900 bg-slate-100 px-4 py-2.5 font-mono text-xs font-bold text-slate-900 hover:bg-slate-200 shadow-[2px_2px_0px_0px_#000] flex items-center space-x-2 dark:border-white dark:bg-dark-base dark:text-white"
            >
              <Download className="h-4 w-4" />
              <span>UNDUH EXCEL (.XLSX)</span>
            </button>

            <button
              onClick={handleArchiveTournament}
              disabled={saving}
              className="border-2 border-slate-900 bg-amber-400 px-5 py-2.5 font-mono text-xs font-black uppercase text-slate-950 hover:bg-amber-300 shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center space-x-2"
            >
              <Archive className="h-4 w-4" />
              <span>ARSIPKAN TURNAMEN INI</span>
            </button>
          </div>
        </div>

        {/* Existing Archives List */}
        {archives.length > 0 && (
          <div className="mt-6 border-t-2 border-slate-900 pt-4 dark:border-white">
            <span className="font-mono text-xs font-black uppercase text-slate-500 dark:text-steel-400 block mb-2">
              Daftar Turnamen yang Telah Diarsipkan ({archives.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {archives.map((arch) => (
                <div
                  key={arch.id}
                  className="border-2 border-slate-900 bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-dark-base"
                >
                  <div className="font-mono text-[10px] text-slate-500 dark:text-steel-400 font-bold">
                    {arch.date}
                  </div>
                  <div className="font-display font-black text-sm uppercase text-slate-900 dark:text-white">
                    {arch.title}
                  </div>
                  {arch.champion && (
                    <div className="mt-1 font-mono text-xs font-bold text-amber-500">
                      🏆 Juara: {arch.champion.teamName} ({arch.champion.totalPoints} Pts)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <TournamentShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tournament={tournament}
        standings={standings}
      />

      {/* Archive Modal (Admin Only) */}
      <TournamentArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archives={archives}
      />
    </div>
  );
}
