"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Layers,
  FileSpreadsheet,
  Settings2,
  Sparkles,
  X,
  Users,
  Radio,
} from "lucide-react";
import {
  LiveTournamentData,
  TournamentTeam,
  TournamentMatch,
  TournamentStanding,
  TournamentSheet,
  TournamentPhase,
  ArchivedTournament,
  calculatePUBGMStandings,
  normalizeTournamentData,
  createNewTournament,
  createNewTournamentSheet,
  DEFAULT_PRESET_TEAMS,
  PMWC_RANK_POINTS,
  OFFICIAL_MAPS,
} from "@/lib/tournament/pubgmCalculator";
import {
  fetchLiveTournamentFromApi,
  fetchAllTournamentsFromApi,
  switchActiveTournamentApi,
  saveLiveTournament,
  saveTournamentsBundle,
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
  // Master Tournaments State
  const [tournaments, setTournaments] = useState<LiveTournamentData[]>([]);
  const [tournament, setTournament] = useState<LiveTournamentData | null>(null);
  const [liveTournamentId, setLiveTournamentId] = useState<string>("");
  const [archives, setArchives] = useState<ArchivedTournament[]>([]);

  // Active Sheet / Lembar State
  const [activeSheetId, setActiveSheetId] = useState<string>("");

  // UI / Status State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Match Calculator State for Active Sheet
  const [selectedMatchNumber, setSelectedMatchNumber] = useState<number>(1);
  const [matchMap, setMatchMap] = useState<string>("Erangel");
  const [matchCompleted, setMatchCompleted] = useState<boolean>(true);
  const [teamScoreInputs, setTeamScoreInputs] = useState<
    Record<string, { rank: number; kills: number }>
  >({});

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isAddSheetModalOpen, setIsAddSheetModalOpen] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  // New Team in Sheet Form
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamCode, setNewTeamCode] = useState("");

  // New Tournament Modal Form State
  const [newTourTitle, setNewTourTitle] = useState("");
  const [newTourSubtitle, setNewTourSubtitle] = useState("SAMARINDA BATTLE ROYALE SHOWDOWN // PMWC RULES");
  const [newTourPrizePool, setNewTourPrizePool] = useState("Rp 2.000.000 + Trophy");
  const [newTourPreset, setNewTourPreset] = useState<"dual" | "single">("dual");

  // New Sheet Modal Form State
  const [newSheetName, setNewSheetName] = useState("");
  const [newSheetPhase, setNewSheetPhase] = useState<TournamentPhase>("QUALIFIER");
  const [newSheetCopySource, setNewSheetCopySource] = useState<string>("default");

  const tournamentRef = useRef<LiveTournamentData | null>(tournament);
  const tournamentsRef = useRef<LiveTournamentData[]>(tournaments);
  useEffect(() => {
    tournamentRef.current = tournament;
  }, [tournament]);
  useEffect(() => {
    tournamentsRef.current = tournaments;
  }, [tournaments]);

  // Initial Load
  useEffect(() => {
    loadData();

    // Listen to global save event from floating admin button
    const handleGlobalSave = async () => {
      if (tournamentRef.current) {
        setSaving(true);
        const res = await saveTournamentsBundle(tournamentsRef.current, tournamentRef.current);
        setSaving(false);
        if (res.success) {
          setSaveStatus("Semua perubahan turnamen berhasil disinkronkan ke server HQ!");
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
      const [{ live, tournaments: allList }, archList] = await Promise.all([
        fetchAllTournamentsFromApi(),
        fetchArchivedTournamentsFromApi(),
      ]);

      const activeTour = live || (allList.length > 0 ? allList[0] : null);

      if (activeTour) {
        setTournament(activeTour);
        setLiveTournamentId(live?.id || activeTour.id);

        const initialSheet = activeTour.sheets && activeTour.sheets.length > 0
          ? activeTour.sheets.find((s) => s.id === activeTour.activeSheetId) || activeTour.sheets[0]
          : null;

        if (initialSheet) {
          setActiveSheetId(initialSheet.id);
          syncMatchForm(initialSheet, 1);
        }
      }

      setTournaments(allList.length > 0 ? allList : activeTour ? [activeTour] : []);
      setArchives(archList);
    } catch (err: any) {
      setErrorStatus("Gagal memuat data turnamen.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Ambil sheet aktif saat ini
  const getActiveSheet = (): TournamentSheet | null => {
    if (!tournament) return null;
    const sheets = tournament.sheets || [];
    if (sheets.length === 0) return null;
    return sheets.find((s) => s.id === activeSheetId) || sheets[0];
  };

  const activeSheet = getActiveSheet();

  // Sync Match Form Inputs from Sheet and Match Number
  const syncMatchForm = (sheet: TournamentSheet, matchNum: number) => {
    const match = sheet.matches.find((m) => m.matchNumber === matchNum);
    if (match) {
      setMatchMap(match.mapName || "Erangel");
      setMatchCompleted(match.isCompleted);

      const inputs: Record<string, { rank: number; kills: number }> = {};
      sheet.teams.forEach((t) => {
        const found = match.teamResults?.find((r) => r.teamId === t.id);
        inputs[t.id] = {
          rank: found ? found.rank : 16,
          kills: found ? found.kills : 0,
        };
      });
      setTeamScoreInputs(inputs);
    } else {
      // Default new match
      const inputs: Record<string, { rank: number; kills: number }> = {};
      sheet.teams.forEach((t, i) => {
        inputs[t.id] = { rank: i + 1, kills: 0 };
      });
      setTeamScoreInputs(inputs);
      setMatchMap("Erangel");
      setMatchCompleted(false);
    }
  };

  // Switch Active Sheet
  const handleSelectSheet = (sheetId: string) => {
    if (!tournament) return;
    setActiveSheetId(sheetId);
    const targetSheet = (tournament.sheets || []).find((s) => s.id === sheetId);
    if (targetSheet) {
      setSelectedMatchNumber(1);
      syncMatchForm(targetSheet, 1);
    }
  };

  // Update Active Sheet Helper
  const updateActiveSheet = (
    updater: (sheet: TournamentSheet) => TournamentSheet
  ): LiveTournamentData | null => {
    if (!tournament || !activeSheet) return null;
    const updatedSheet = updater({ ...activeSheet });
    const currentSheets = tournament.sheets || [];
    const nextSheets = currentSheets.map((s) => (s.id === updatedSheet.id ? updatedSheet : s));

    const updatedTournament: LiveTournamentData = {
      ...tournament,
      sheets: nextSheets,
      activeSheetId: updatedSheet.id,
      // Sinkronkan legacy fields jika aktif
      teams: updatedSheet.teams,
      matches: updatedSheet.matches,
      totalMatches: updatedSheet.totalMatches,
      currentMatch: updatedSheet.currentMatch,
      currentMap: updatedSheet.currentMap,
    };

    setTournament(updatedTournament);

    // Update in tournaments list
    const updatedList = tournaments.map((t) =>
      t.id === updatedTournament.id ? updatedTournament : t
    );
    setTournaments(updatedList);

    return updatedTournament;
  };

  // Switch Tournament Being Edited
  const handleSelectTournament = (tourId: string) => {
    const found = tournaments.find((t) => t.id === tourId);
    if (found) {
      const normalized = normalizeTournamentData(found);
      setTournament(normalized);
      const firstSheet = normalized.sheets && normalized.sheets.length > 0 ? normalized.sheets[0] : null;
      if (firstSheet) {
        setActiveSheetId(firstSheet.id);
        setSelectedMatchNumber(1);
        syncMatchForm(firstSheet, 1);
      }
      ceesAlert.toast({
        type: "info",
        title: "TURNAMEN DIPILIH",
        message: `Beralih ke editor: "${normalized.title}"`,
      });
    }
  };

  // Set Current Tournament as Live on Homepage
  const handleSetTournamentAsLive = async () => {
    if (!tournament) return;
    setSaving(true);
    ceesAlert.loading({
      title: "MENGAKTIFKAN TURNAMEN LIVE",
      message: `Mempublikasikan "${tournament.title}" sebagai turnamen live di Beranda...`,
      showProgress: true,
      progress: 60,
    });

    const res = await switchActiveTournamentApi(tournament.id);
    setSaving(false);
    if (res.success) {
      setLiveTournamentId(tournament.id);
      ceesAlert.success(
        "BERHASIL DIPUBLIKASIKAN",
        `Turnamen "${tournament.title}" sekarang resmi aktif dan tayang di Beranda Pengunjung!`
      );
    } else {
      ceesAlert.error("GAGAL MEMPUBLIKASIKAN", res.error || "Gagal mengaktifkan turnamen di beranda.");
    }
  };

  // Toggle Global Visibility (Homepage Show/Hide)
  const handleToggleGlobalVisibility = async () => {
    if (!tournament) return;
    const nextState = !tournament.isVisible;
    const updated = {
      ...tournament,
      isVisible: nextState,
    };
    setTournament(updated);
    setSaving(true);

    ceesAlert.loading({
      title: "MENGUBAH VISIBILITAS",
      message: nextState
        ? "Mengaktifkan penayangan turnamen di Beranda..."
        : "Menyembunyikan turnamen dari Beranda...",
      showProgress: true,
      progress: 50,
    });

    const res = await saveTournamentsBundle(tournaments, updated);
    setSaving(false);
    if (res.success) {
      const msg = nextState
        ? "Turnamen sekarang TAMPIL di Beranda Pengunjung!"
        : "Turnamen sekarang DISEMBUNYIKAN dari Beranda Pengunjung!";
      setSaveStatus(msg);
      ceesAlert.success(nextState ? "TURNAMEN AKTIF" : "TURNAMEN DISEMBUNYIKAN", msg);
      setTimeout(() => setSaveStatus(null), 3500);
    } else {
      setTournament({ ...tournament, isVisible: !nextState });
      ceesAlert.error("GAGAL MENGUBAH VISIBILITAS", res.error || "Gagal menyimpan.");
    }
  };

  // Toggle Sheet Visibility (Show/Hide Lembar Grup A/B/Final)
  const handleToggleSheetVisibility = async (sheetId: string) => {
    if (!tournament) return;
    const currentSheets = tournament.sheets || [];
    const targetSheet = currentSheets.find((s) => s.id === sheetId);
    if (!targetSheet) return;

    const nextVisibility = !targetSheet.isVisible;
    const updatedSheets = currentSheets.map((s) =>
      s.id === sheetId ? { ...s, isVisible: nextVisibility } : s
    );

    const updatedTournament: LiveTournamentData = {
      ...tournament,
      sheets: updatedSheets,
    };

    setTournament(updatedTournament);
    setSaving(true);

    const res = await saveTournamentsBundle(tournaments, updatedTournament);
    setSaving(false);

    if (res.success) {
      const msg = nextVisibility
        ? `Lembar "${targetSheet.name}" sekarang TAMPIL di Beranda!`
        : `Lembar "${targetSheet.name}" sekarang DISEMBUNYIKAN dari Beranda!`;
      ceesAlert.toast({
        type: nextVisibility ? "success" : "info",
        title: nextVisibility ? "LEMBAR DITAMPILKAN" : "LEMBAR DISEMBUNYIKAN",
        message: msg,
      });
    } else {
      // Revert
      setTournament(tournament);
      ceesAlert.error("GAGAL MENYIMPAN", res.error || "Gagal mengubah visibilitas lembar.");
    }
  };

  // Create New Tournament
  const handleCreateTournament = async () => {
    if (!newTourTitle.trim()) {
      ceesAlert.warning("JUDUL BELUM DIISI", "Silakan masukkan nama/judul turnamen terlebih dahulu!");
      return;
    }

    const newTour = createNewTournament(
      newTourTitle.trim(),
      newTourSubtitle.trim() || undefined,
      newTourPreset === "dual"
    );
    newTour.prizePool = newTourPrizePool.trim() || undefined;

    const nextTournaments = [newTour, ...tournaments];
    setTournaments(nextTournaments);
    setTournament(newTour);
    setActiveSheetId(newTour.sheets![0].id);
    syncMatchForm(newTour.sheets![0], 1);
    setIsCreateTournamentModalOpen(false);

    setSaving(true);
    ceesAlert.loading({
      title: "MEMBUAT TURNAMEN BARU",
      message: `Menyusun struktur turnamen "${newTour.title}"...`,
      showProgress: true,
      progress: 50,
    });

    const res = await saveTournamentsBundle(nextTournaments, newTour);
    setSaving(false);

    if (res.success) {
      ceesAlert.success(
        "TURNAMEN BERHASIL DIBUAT",
        `Turnamen "${newTour.title}" telah dibuat dengan ${newTour.sheets?.length} lembar fase!`
      );
    } else {
      ceesAlert.error("GAGAL MEMBUAT TURNAMEN", res.error || "Gagal menyimpan turnamen ke server.");
    }
  };

  // Add Sheet to Tournament
  const handleAddSheet = async () => {
    if (!tournament) return;
    if (!newSheetName.trim()) {
      ceesAlert.warning("NAMA LEMBAR WAJIB DIISI", "Silakan beri nama lembar/grup, misal: 'Grup B' atau 'Grand Final'!");
      return;
    }

    let teamListToUse: TournamentTeam[] | undefined = undefined;

    if (newSheetCopySource === "active" && activeSheet) {
      teamListToUse = JSON.parse(JSON.stringify(activeSheet.teams));
    } else if (newSheetCopySource === "top8" && activeSheet) {
      const sheetStandings = calculatePUBGMStandings(activeSheet.teams, activeSheet.matches);
      const top8Standings = sheetStandings.slice(0, 8);
      teamListToUse = top8Standings.map((s, idx) => ({
        id: `t-qualified-${Date.now()}-${idx + 1}`,
        code: s.teamCode,
        name: s.teamName,
      }));
    }

    const newSheet = createNewTournamentSheet(
      newSheetName.trim(),
      newSheetPhase,
      teamListToUse,
      5
    );

    const currentSheets = tournament.sheets || [];
    const updatedSheets = [...currentSheets, newSheet];

    const updatedTournament: LiveTournamentData = {
      ...tournament,
      sheets: updatedSheets,
      activeSheetId: newSheet.id,
    };

    setTournament(updatedTournament);
    setActiveSheetId(newSheet.id);
    syncMatchForm(newSheet, 1);
    setIsAddSheetModalOpen(false);
    setNewSheetName("");

    setSaving(true);
    ceesAlert.loading({
      title: "MENAMBAHKAN LEMBAR",
      message: `Menyimpan lembar baru "${newSheet.name}" ke turnamen...`,
      showProgress: true,
      progress: 60,
    });

    const res = await saveTournamentsBundle(tournaments, updatedTournament);
    setSaving(false);

    if (res.success) {
      ceesAlert.success(
        "LEMBAR BERHASIL DITAMBAHKAN",
        `Lembar "${newSheet.name}" (${newSheet.phase}) telah siap digunakan dengan ${newSheet.teams.length} tim!`
      );
    } else {
      ceesAlert.error("GAGAL MENAMBAHKAN LEMBAR", res.error || "Gagal menyimpan lembar baru.");
    }
  };

  // Delete Sheet
  const handleDeleteSheet = async (sheetId: string) => {
    if (!tournament) return;
    const currentSheets = tournament.sheets || [];
    if (currentSheets.length <= 1) {
      ceesAlert.warning("TIDAK BISA MENGHAPUS", "Turnamen minimal harus memiliki 1 lembar grup / fase!");
      return;
    }

    const targetSheet = currentSheets.find((s) => s.id === sheetId);
    const confirmed = await ceesAlert.confirm({
      title: "HAPUS LEMBAR PERTANDINGAN",
      message: `Yakin ingin menghapus lembar "${targetSheet?.name || sheetId}"? Seluruh data tim dan hasil match di lembar ini akan dihapus.`,
      danger: true,
      confirmText: "YA, HAPUS LEMBAR",
      cancelText: "BATAL",
    });

    if (!confirmed) return;

    const remainingSheets = currentSheets.filter((s) => s.id !== sheetId);
    const nextActiveSheet = remainingSheets[0];

    const updatedTournament: LiveTournamentData = {
      ...tournament,
      sheets: remainingSheets,
      activeSheetId: nextActiveSheet.id,
      teams: nextActiveSheet.teams,
      matches: nextActiveSheet.matches,
      totalMatches: nextActiveSheet.totalMatches,
      currentMatch: nextActiveSheet.currentMatch,
      currentMap: nextActiveSheet.currentMap,
    };

    setTournament(updatedTournament);
    setActiveSheetId(nextActiveSheet.id);
    syncMatchForm(nextActiveSheet, 1);

    setSaving(true);
    const res = await saveTournamentsBundle(tournaments, updatedTournament);
    setSaving(false);

    if (res.success) {
      ceesAlert.toast({
        type: "info",
        title: "LEMBAR DIHAPUS",
        message: `Lembar "${targetSheet?.name}" telah dihapus.`,
      });
    }
  };

  // Save General Info
  const handleSaveGeneralInfo = async () => {
    if (!tournament) return;
    setSaving(true);
    ceesAlert.loading({
      title: "MENYIMPAN INFO TURNAMEN",
      message: "Menyinkronkan data judul, status, dan prizepool ke server...",
      showProgress: true,
      progress: 60,
    });

    const res = await saveTournamentsBundle(tournaments, tournament);
    setSaving(false);

    if (res.success) {
      setSaveStatus("Pengaturan umum turnamen berhasil disimpan!");
      ceesAlert.success("INFORMASI TERSIMPAN", "Pengaturan turnamen berhasil diperbarui!");
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      ceesAlert.error("GAGAL MENYIMPAN", res.error || "Terjadi kesalahan saat menyimpan.");
    }
  };

  // Save Match Scores for Active Sheet
  const handleSaveMatchScores = async () => {
    if (!tournament || !activeSheet) return;
    setSaving(true);

    ceesAlert.loading({
      title: "MENGKALKULASI SKOR MATCH",
      message: `Menyimpan skor PMWC 10-Point Match #${selectedMatchNumber} (${matchMap}) di ${activeSheet.name}...`,
      showProgress: true,
      progress: 60,
    });

    const matchResults = activeSheet.teams.map((t) => ({
      teamId: t.id,
      rank: Number(teamScoreInputs[t.id]?.rank) || 16,
      kills: Number(teamScoreInputs[t.id]?.kills) || 0,
    }));

    const existingMatchIdx = activeSheet.matches.findIndex(
      (m) => m.matchNumber === selectedMatchNumber
    );

    const updatedMatches = [...activeSheet.matches];
    const newMatchObj: TournamentMatch = {
      matchId: `m-${activeSheet.id}-${selectedMatchNumber}`,
      matchNumber: selectedMatchNumber,
      mapName: matchMap,
      isCompleted: matchCompleted,
      teamResults: matchResults,
    };

    if (existingMatchIdx >= 0) {
      updatedMatches[existingMatchIdx] = newMatchObj;
    } else {
      updatedMatches.push(newMatchObj);
    }

    const updatedTournament = updateActiveSheet((sheet) => ({
      ...sheet,
      currentMatch: selectedMatchNumber,
      currentMap: matchMap,
      matches: updatedMatches,
    }));

    if (!updatedTournament) return;

    const res = await saveTournamentsBundle(tournaments, updatedTournament);
    setSaving(false);

    if (res.success) {
      const msg = `Hasil Match #${selectedMatchNumber} (${matchMap}) [${activeSheet.name}] berhasil disimpan & dikalkulasi!`;
      setSaveStatus(msg);
      ceesAlert.success("SKOR MATCH TERSIMPAN", msg);
      setTimeout(() => setSaveStatus(null), 3500);
    } else {
      ceesAlert.error("GAGAL MENYIMPAN SKOR", res.error || "Gagal menyimpan skor.");
    }
  };

  // Add Match to Active Sheet
  const handleAddNewMatchToSheet = () => {
    if (!activeSheet) return;
    const nextNum = (activeSheet.matches.length || 0) + 1;
    setSelectedMatchNumber(nextNum);
    setMatchMap(OFFICIAL_MAPS[(nextNum - 1) % OFFICIAL_MAPS.length]);
    setMatchCompleted(false);

    const inputs: Record<string, { rank: number; kills: number }> = {};
    activeSheet.teams.forEach((t, i) => {
      inputs[t.id] = { rank: i + 1, kills: 0 };
    });
    setTeamScoreInputs(inputs);

    ceesAlert.toast({
      type: "info",
      title: `MATCH #${nextNum} DISIAPKAN`,
      message: `Form input Match #${nextNum} (${activeSheet.name}) siap diisi.`,
    });
  };

  // Team CRUD for Active Sheet
  const handleUpdateTeamInSheet = (teamId: string, field: "name" | "code", value: string) => {
    if (!activeSheet) return;
    updateActiveSheet((sheet) => ({
      ...sheet,
      teams: sheet.teams.map((t) => (t.id === teamId ? { ...t, [field]: value } : t)),
    }));
  };

  const handleSaveTeamsInSheet = async () => {
    if (!tournament || !activeSheet) return;
    setSaving(true);
    ceesAlert.loading({
      title: "MENYIMPAN DAFTAR TIM",
      message: `Menyinkronkan daftar tim untuk ${activeSheet.name}...`,
      showProgress: true,
      progress: 60,
    });

    const res = await saveTournamentsBundle(tournaments, tournament);
    setSaving(false);

    if (res.success) {
      setSaveStatus(`Daftar tim [${activeSheet.name}] berhasil disimpan permanen!`);
      ceesAlert.success("TIM TERSIMPAN", `Daftar tim ${activeSheet.name} berhasil diperbarui.`);
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      ceesAlert.error("GAGAL MENYIMPAN TIM", res.error || "Gagal menyimpan tim.");
    }
  };

  const handleAddTeamToSheet = async () => {
    if (!tournament || !activeSheet) return;
    if (!newTeamName.trim() || !newTeamCode.trim()) {
      ceesAlert.warning("DATA BELUM LENGKAP", "Nama tim dan kode klan wajib diisi!");
      return;
    }

    const newTeam: TournamentTeam = {
      id: `team-${activeSheet.id}-${Date.now()}`,
      name: newTeamName.trim().toUpperCase(),
      code: newTeamCode.trim().toUpperCase(),
    };

    const updated = updateActiveSheet((sheet) => ({
      ...sheet,
      teams: [...sheet.teams, newTeam],
    }));

    setNewTeamName("");
    setNewTeamCode("");

    if (updated) {
      setSaving(true);
      await saveTournamentsBundle(tournaments, updated);
      setSaving(false);
      ceesAlert.toast({
        type: "success",
        title: "TIM DITAMBAHKAN",
        message: `Tim "${newTeam.name}" [${newTeam.code}] ditambahkan ke ${activeSheet.name}.`,
      });
    }
  };

  const handleRemoveTeamFromSheet = async (teamId: string) => {
    if (!tournament || !activeSheet) return;
    const targetTeam = activeSheet.teams.find((t) => t.id === teamId);
    const confirmed = await ceesAlert.confirm({
      title: "HAPUS TIM DARI LEMBAR",
      message: `Hapus tim "${targetTeam?.name || teamId}" dari ${activeSheet.name}?`,
      danger: true,
      confirmText: "YA, HAPUS",
      cancelText: "BATAL",
    });

    if (!confirmed) return;

    const updated = updateActiveSheet((sheet) => ({
      ...sheet,
      teams: sheet.teams.filter((t) => t.id !== teamId),
    }));

    if (updated) {
      setSaving(true);
      await saveTournamentsBundle(tournaments, updated);
      setSaving(false);
      ceesAlert.toast({
        type: "info",
        title: "TIM DIHAPUS",
        message: `Tim "${targetTeam?.name}" dihapus dari ${activeSheet.name}.`,
      });
    }
  };

  // Archive Tournament
  const handleArchive = async () => {
    if (!tournament) return;
    const confirmed = await ceesAlert.confirm({
      title: "ARSIPKAN TURNAMEN",
      message: `Arsipkan "${tournament.title}" ke Hall of Fame? Seluruh rekaman match dan pemenang akan diabadikan.`,
      danger: true,
      confirmText: "YA, ARSIPKAN SEKARANG",
      cancelText: "BATALKAN",
    });

    if (!confirmed) return;

    setSaving(true);
    ceesAlert.loading({
      title: "MENGARSIPKAN TURNAMEN",
      message: "Menghitung pemenang dan menyimpan ke Hall of Fame...",
      showProgress: true,
      progress: 70,
    });

    const res = await archiveCurrentTournament(tournament);
    setSaving(false);

    if (res.success) {
      ceesAlert.success("TURNAMEN DIARSIPKAN", `"${tournament.title}" resmi diabadikan ke Hall of Fame!`);
      loadData();
    } else {
      ceesAlert.error("GAGAL MENGARSIPKAN", res.error || "Gagal mengarsipkan.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-sm">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-blue dark:text-brand-cyan mb-3" />
        <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-steel-300">
          MEMUAT DATABASE TURNAMEN & LEMBAR PMWC...
        </span>
      </div>
    );
  }

  if (!tournament || !activeSheet) {
    return (
      <div className="py-16 text-center font-mono text-sm text-rose-500">
        Gagal memuat konfigurasi turnamen.
      </div>
    );
  }

  const sheetStandings = calculatePUBGMStandings(activeSheet.teams, activeSheet.matches);

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* 1. MASTER TOURNAMENT SELECTOR & CREATOR (MULTI-TOURNAMENT)   */}
      {/* ============================================================ */}
      <div className="border-4 border-slate-900 bg-white p-5 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-white pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
              <span className="font-mono text-xs font-black uppercase text-brand-blue dark:text-brand-cyan tracking-wider">
                [ CEES TOURNAMENT ENGINE // MULTI-EVENT CONTROLLER ]
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
              Kelola & Pilih Turnamen
            </h2>
            <p className="font-mono text-xs text-slate-600 dark:text-steel-400">
              Kamu bisa mengelola beberapa turnamen terpisah (kualifikasi, scrim, cup), menentukan mana yang aktif di Beranda, serta membuat turnamen baru kapan saja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreateTournamentModalOpen(true)}
              className="brutal-btn flex items-center space-x-2 px-4 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950"
            >
              <Plus className="h-4 w-4" />
              <span>+ BUAT TURNAMEN BARU</span>
            </button>

            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="border-2 border-slate-900 px-3.5 py-2.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000] bg-slate-100 hover:bg-slate-200 dark:border-white dark:bg-dark-base dark:text-white flex items-center space-x-1.5"
            >
              <Archive className="h-4 w-4" />
              <span>ARSIP ({archives.length})</span>
            </button>
          </div>
        </div>

        {/* Tournament Switcher Dropdown / Pills */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <label className="font-mono text-xs font-black uppercase text-slate-700 dark:text-steel-300 shrink-0">
              Turnamen yang Diedit:
            </label>
            <select
              value={tournament.id}
              onChange={(e) => handleSelectTournament(e.target.value)}
              className="w-full sm:w-80 border-2 border-slate-900 bg-slate-50 p-2 font-display text-sm font-black uppercase text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.id === liveTournamentId ? "★ [LIVE BERANDA]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Action: Jadikan Live di Beranda */}
          <div className="flex items-center gap-2">
            {tournament.id === liveTournamentId ? (
              <span className="inline-flex items-center space-x-1.5 border-2 border-emerald-600 bg-emerald-500 px-3 py-1.5 font-mono text-xs font-black text-slate-950 uppercase shadow-[2px_2px_0px_0px_#000]">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>SEDANG LIVE DI BERANDA</span>
              </span>
            ) : (
              <button
                onClick={handleSetTournamentAsLive}
                disabled={saving}
                className="border-2 border-slate-900 bg-brand-blue px-3.5 py-1.5 font-mono text-xs font-black text-white uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-blue-600 transition-transform active:translate-x-0.5 active:translate-y-0.5"
                title="Pilih turnamen ini untuk ditayangkan sebagai live tournament di Beranda"
              >
                ★ JADIKAN LIVE DI BERANDA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. GLOBAL VISIBILITY & SHARE TOOLS                           */}
      {/* ============================================================ */}
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
              Status Penayangan "{tournament.title}"
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-steel-400 max-w-2xl leading-relaxed">
              Jika turnamen masih dalam masa persiapan, kamu bisa sembunyikan secara global agar halaman utama tetap bersih.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleGlobalVisibility}
              disabled={saving}
              className={`border-2 border-slate-900 px-5 py-3 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center space-x-2 ${
                tournament.isVisible
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {tournament.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>
                {tournament.isVisible ? "SEMBUNYIKAN TURNAMEN DARI BERANDA" : "TAMPILKAN TURNAMEN DI BERANDA"}
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

        {saveStatus && (
          <div className="mt-4 flex items-center gap-2 border-2 border-emerald-600 bg-emerald-50 p-3 font-mono text-xs font-bold uppercase text-emerald-800 shadow-[3px_3px_0px_0px_#059669] dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. MULTI-LEMBAR & FASE MANAGEMENT (GRUP A, GRUP B, FINAL)    */}
      {/* ============================================================ */}
      <div className="border-4 border-slate-900 bg-slate-900 p-5 shadow-[6px_6px_0px_0px_#000] text-white dark:border-white rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/20 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-brand-cyan font-mono text-xs font-black uppercase">
              <Layers className="h-4 w-4" />
              <span>FASE & LEMBAR PERTANDINGAN ({tournament.sheets?.length || 1} LEMBAR)</span>
            </div>
            <h3 className="mt-1 font-display text-xl font-black uppercase text-white">
              Pilih Lembar untuk Dikelola / Di-Show-Hide
            </h3>
            <p className="font-mono text-xs text-white/70">
              Setiap lembar (misal Grup A atau Grup B) memiliki 16 tim dan match-nya sendiri. Kamu bisa menyembunyikan lembar tertentu secara terpisah!
            </p>
          </div>

          <button
            onClick={() => setIsAddSheetModalOpen(true)}
            className="border-2 border-white bg-amber-400 px-4 py-2 font-mono text-xs font-black uppercase text-slate-950 hover:bg-amber-300 shadow-[3px_3px_0px_0px_#fff] flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>+ TAMBAH LEMBAR / GRUP</span>
          </button>
        </div>

        {/* Sheet Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {(tournament.sheets || []).map((sheet) => {
            const isCurrent = sheet.id === activeSheet.id;
            const phaseLabel =
              sheet.phase === "FINAL"
                ? "GRAND FINAL"
                : sheet.phase === "SEMI_FINAL"
                ? "SEMI FINAL"
                : "KUALIFIKASI";
            const phaseColor =
              sheet.phase === "FINAL"
                ? "bg-amber-400 text-slate-950"
                : sheet.phase === "SEMI_FINAL"
                ? "bg-purple-600 text-white"
                : "bg-brand-blue text-white";

            return (
              <div
                key={sheet.id}
                className={`flex items-center border-2 transition-all ${
                  isCurrent
                    ? "border-brand-cyan bg-slate-800 shadow-[4px_4px_0px_0px_#00D2FF] scale-[1.02]"
                    : "border-white/40 bg-slate-950 hover:bg-slate-900"
                }`}
              >
                <button
                  onClick={() => handleSelectSheet(sheet.id)}
                  className="flex items-center space-x-2 px-3 py-2 text-left font-mono text-xs font-black uppercase"
                >
                  <span className={`px-1.5 py-0.5 text-[9px] font-black ${phaseColor}`}>
                    {phaseLabel}
                  </span>
                  <span className="text-white">{sheet.name}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[9px] font-bold ${
                      sheet.isVisible
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                    title={sheet.isVisible ? "Lembar ini tampil di Beranda" : "Lembar ini tersembunyi dari Beranda"}
                  >
                    {sheet.isVisible ? "👁️ TAMPIL" : "🚫 HIDE"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Sheet Controller Banner */}
        <div className="mt-5 border-2 border-white/30 bg-slate-950 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-brand-cyan font-bold uppercase">
                  LEMBAR AKTIF:
                </span>
                <span className="font-display text-lg font-black uppercase text-white">
                  {activeSheet.name} ({activeSheet.phase})
                </span>
                <span className="font-mono text-xs text-white/60">
                  • {activeSheet.teams.length} Tim Terdaftar • {activeSheet.matches.length} Matches
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-white/70">
                Status visibilitas di Beranda:{" "}
                <strong className={activeSheet.isVisible ? "text-emerald-400" : "text-amber-400"}>
                  {activeSheet.isVisible
                    ? "DITAMPILKAN KE PENGUNJUNG"
                    : "DISEMBUNYIKAN (Hanya admin yang bisa melihat)"}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleToggleSheetVisibility(activeSheet.id)}
                disabled={saving}
                className={`border-2 border-white px-4 py-2 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#fff] flex items-center space-x-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                  activeSheet.isVisible
                    ? "bg-rose-600 text-white hover:bg-rose-500"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                }`}
              >
                {activeSheet.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>
                  {activeSheet.isVisible ? "SEMBUNYIKAN LEMBAR INI" : "TAMPILKAN LEMBAR INI"}
                </span>
              </button>

              {(tournament.sheets || []).length > 1 && (
                <button
                  onClick={() => handleDeleteSheet(activeSheet.id)}
                  disabled={saving}
                  className="border-2 border-red-500/80 bg-red-950/60 text-red-300 hover:bg-red-900/80 px-3 py-2 font-mono text-xs font-bold uppercase flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>HAPUS LEMBAR</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. GENERAL TOURNAMENT SETTINGS                               */}
      {/* ============================================================ */}
      <div className="border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
            <h3 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
              Pengaturan Umum Turnamen ({tournament.title})
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
              <option value="LIVE">🔴 LIVE NOW</option>
              <option value="UPCOMING">🟡 UPCOMING</option>
              <option value="BREAK">☕ BREAK TIME</option>
              <option value="COMPLETED">🏁 COMPLETED</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Total Prizepool
            </label>
            <input
              type="text"
              value={tournament.prizePool || ""}
              onChange={(e) => setTournament({ ...tournament, prizePool: e.target.value })}
              placeholder="Rp 2.000.000 + Trophy"
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Tanggal Pelaksanaan
            </label>
            <input
              type="text"
              value={tournament.date}
              onChange={(e) => setTournament({ ...tournament, date: e.target.value })}
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Lokasi / Venue
            </label>
            <input
              type="text"
              value={tournament.location || ""}
              onChange={(e) => setTournament({ ...tournament, location: e.target.value })}
              placeholder="Samarinda Gaming Hub & Online Room"
              className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MATCH SCORE CALCULATOR (PMWC 10-POINT FOR ACTIVE SHEET)   */}
      {/* ============================================================ */}
      <div className="border-4 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-white pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Crosshair className="h-5 w-5 text-red-600 animate-spin-slow" />
              <h3 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
                Input Skor Match: {activeSheet.name}
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-600 dark:text-steel-400 mt-0.5">
              Input peringkat (1-16) dan jumlah kills tiap tim untuk menghitung otomatis Placement Points (PMWC 10-Point) & Total Poin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddNewMatchToSheet}
              className="border-2 border-slate-900 bg-amber-400 px-3.5 py-2 font-mono text-xs font-bold uppercase text-slate-950 hover:bg-amber-300 shadow-[2px_2px_0px_0px_#000] flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>+ TAMBAH MATCH BARU</span>
            </button>

            <button
              onClick={handleSaveMatchScores}
              disabled={saving}
              className="brutal-btn flex items-center space-x-2 px-5 py-2 text-xs font-bold"
            >
              <Save className="h-4 w-4" />
              <span>SIMPAN HASIL MATCH #{selectedMatchNumber}</span>
            </button>
          </div>
        </div>

        {/* Match Selector Tabs for Active Sheet */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b-2 border-slate-200 pb-3 dark:border-dark-border">
          <span className="font-mono text-xs font-bold uppercase text-slate-600 dark:text-steel-400 mr-1">
            PILIH MATCH:
          </span>
          {activeSheet.matches.map((m) => (
            <button
              key={m.matchId}
              onClick={() => {
                setSelectedMatchNumber(m.matchNumber);
                syncMatchForm(activeSheet, m.matchNumber);
              }}
              className={`border-2 border-slate-900 px-3 py-1.5 font-mono text-xs font-black uppercase transition-all ${
                selectedMatchNumber === m.matchNumber
                  ? "bg-slate-900 text-white shadow-[3px_3px_0px_0px_#0030FF] dark:bg-white dark:text-slate-950"
                  : "bg-white text-slate-800 hover:bg-slate-100 dark:bg-dark-surface dark:text-steel-300"
              }`}
            >
              Match #{m.matchNumber} {m.isCompleted ? "✓" : "⏳"}
            </button>
          ))}
        </div>

        {/* Match Map & Status Config */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 border-2 border-slate-900 dark:border-white dark:bg-dark-surface">
          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Map Pertandingan
            </label>
            <select
              value={matchMap}
              onChange={(e) => setMatchMap(e.target.value)}
              className="w-full border-2 border-slate-900 bg-white p-2 font-mono text-xs font-bold uppercase text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
            >
              {OFFICIAL_MAPS.map((map) => (
                <option key={map} value={map}>
                  {map}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Status Match
            </label>
            <label className="flex items-center space-x-2 mt-2 cursor-pointer font-mono text-xs font-bold">
              <input
                type="checkbox"
                checked={matchCompleted}
                onChange={(e) => setMatchCompleted(e.target.checked)}
                className="h-4 w-4 rounded-none border-2 border-slate-900"
              />
              <span className="text-slate-900 dark:text-white uppercase">
                {matchCompleted ? "Selesai (Completed)" : "Sedang Berlangsung"}
              </span>
            </label>
          </div>

          <div className="flex items-end">
            <span className="font-mono text-xs text-slate-600 dark:text-steel-400">
              Total Tim di Lembar Ini: <strong>{activeSheet.teams.length} Tim</strong>
            </span>
          </div>
        </div>

        {/* Input Table */}
        <div className="mt-4 overflow-x-auto border-2 border-slate-900 dark:border-white">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-dark-void uppercase text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">TIM / CLAN</th>
                <th className="py-2.5 px-4 w-28 text-center">RANKING (1-16)</th>
                <th className="py-2.5 px-4 w-28 text-center">KILLS</th>
                <th className="py-2.5 px-4 w-32 text-right min-w-[110px]">PLACEMENT PTS</th>
                <th className="py-2.5 px-4 w-32 text-right bg-brand-blue text-white min-w-[120px]">TOTAL PTS MATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-dark-border">
              {activeSheet.teams.map((t, index) => {
                const currentRank = teamScoreInputs[t.id]?.rank ?? index + 1;
                const currentKills = teamScoreInputs[t.id]?.kills ?? 0;
                const rankPts = PMWC_RANK_POINTS[currentRank] ?? 0;
                const totalMatchPts = rankPts + (Number(currentKills) || 0);

                const rowBg = currentRank === 1
                  ? "bg-amber-50 dark:bg-amber-950/40"
                  : "bg-white dark:bg-dark-surface";

                return (
                  <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-dark-base ${rowBg}`}>
                    <td className={`py-2 px-3 text-center font-bold text-slate-500 ${rowBg}`}>
                      {index + 1}
                    </td>
                    <td className={`py-2 px-3 ${rowBg}`}>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-xs bg-slate-900 text-white px-1.5 py-0.5 border border-slate-900 dark:bg-white dark:text-slate-950">
                          {t.code}
                        </span>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => handleUpdateTeamInSheet(t.id, "name", e.target.value.toUpperCase())}
                          className="font-display font-black text-xs sm:text-sm uppercase text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-400/60 dark:border-steel-700 hover:border-brand-blue focus:border-brand-blue focus:outline-none px-1 py-0.5 w-full min-w-[120px]"
                          title="Klik untuk langsung ganti nama tim"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min={1}
                        max={activeSheet.teams.length || 20}
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

      {/* ============================================================ */}
      {/* 6. TEAM CRUD MANAGEMENT FOR ACTIVE SHEET                     */}
      {/* ============================================================ */}
      <div className="border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 dark:border-white pb-3">
          <div>
            <h3 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
              Kelola Tim di Lembar: {activeSheet.name} ({activeSheet.teams.length} Tim)
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-steel-400">
              Ubah nama tim & kode klan langsung pada tabel di bawah, lalu klik Simpan Tim.
            </p>
          </div>
          <button
            onClick={handleSaveTeamsInSheet}
            disabled={saving}
            className="brutal-btn flex items-center space-x-1.5 px-4 py-2 text-xs font-bold"
          >
            <Save className="h-4 w-4" />
            <span>SIMPAN NAMA TIM ({activeSheet.name})</span>
          </button>
        </div>

        {/* Add Team Input */}
        <div className="mt-4 flex flex-col sm:flex-row items-end gap-3 bg-slate-50 p-4 border-2 border-slate-900 dark:border-white dark:bg-dark-surface">
          <div className="w-full sm:w-28">
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Kode Klan
            </label>
            <input
              type="text"
              placeholder="e.g. BTR"
              maxLength={5}
              value={newTeamCode}
              onChange={(e) => setNewTeamCode(e.target.value.toUpperCase())}
              className="w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold uppercase text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
            />
          </div>

          <div className="w-full sm:flex-1">
            <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
              Nama Tim Peserta
            </label>
            <input
              type="text"
              placeholder="e.g. BIGETRON RED ALIENS"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value.toUpperCase())}
              className="w-full border-2 border-slate-900 p-2 font-display text-sm font-bold uppercase text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
            />
          </div>

          <button
            onClick={handleAddTeamToSheet}
            disabled={saving}
            className="w-full sm:w-auto border-2 border-slate-900 bg-amber-400 px-4 py-2 font-mono text-xs font-black uppercase text-slate-950 hover:bg-amber-300 shadow-[2px_2px_0px_0px_#000] flex items-center justify-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>+ TAMBAH KE {activeSheet.name}</span>
          </button>
        </div>

        {/* List of Teams in Active Sheet */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeSheet.teams.map((t, index) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-2 border-slate-900 p-2.5 bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-dark-surface"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="font-mono text-xs text-slate-400 font-bold w-5">{index + 1}.</span>
                <span className="font-mono font-black text-xs bg-slate-900 text-white px-1.5 py-0.5 dark:bg-white dark:text-slate-950">
                  {t.code}
                </span>
                <span className="font-display font-black text-xs uppercase text-slate-900 dark:text-white truncate">
                  {t.name}
                </span>
              </div>
              <button
                onClick={() => handleRemoveTeamFromSheet(t.id)}
                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                title="Hapus tim ini dari lembar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. STANDINGS PREVIEW FOR ACTIVE SHEET                        */}
      {/* ============================================================ */}
      <div className="border-4 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 dark:border-white pb-3">
          <div>
            <h3 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
              Preview Klasemen: {activeSheet.name}
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-steel-400">
              Kalkulasi resmi PMWC (1. Total Poin, 2. WWCD, 3. Elim Points, 4. Last Match Points, 5. Last Match Rank)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTournamentToExcel(tournament, sheetStandings, activeSheet.name)}
              className="border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-dark-base dark:text-white flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>EXPORT EXCEL (SEMUA LEMBAR)</span>
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto border-2 border-slate-900 dark:border-white">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-dark-void text-[11px] uppercase">
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">TIM</th>
                <th className="py-2.5 px-3 text-center">MATCHES</th>
                <th className="py-2.5 px-3 text-center">WWCD 🍗</th>
                <th className="py-2.5 px-4 text-right">PLACEMENT PTS</th>
                <th className="py-2.5 px-4 text-right">ELIM PTS</th>
                <th className="py-2.5 px-4 text-right bg-brand-blue text-white font-black">TOTAL PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-dark-border">
              {sheetStandings.map((s) => (
                <tr
                  key={s.teamId}
                  className={`hover:bg-slate-50 dark:hover:bg-dark-base ${
                    s.rank === 1 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-white dark:bg-dark-surface"
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-bold">
                    {s.rank === 1 ? "🥇 1" : s.rank === 2 ? "🥈 2" : s.rank === 3 ? "🥉 3" : s.rank}
                  </td>
                  <td className="py-2.5 px-3 font-display font-black uppercase text-slate-900 dark:text-white">
                    [{s.teamCode}] {s.teamName}
                  </td>
                  <td className="py-2.5 px-3 text-center">{s.matchesPlayed}</td>
                  <td className="py-2.5 px-3 text-center font-black text-amber-600 dark:text-amber-400">
                    {s.wwcd > 0 ? `${s.wwcd} WWCD` : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-700 dark:text-steel-300">
                    {s.rankPoints}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                    {s.elimPoints}
                  </td>
                  <td className="py-2.5 px-4 text-right font-display font-black text-base text-slate-900 dark:text-white bg-blue-50/50 dark:bg-blue-950/30">
                    {s.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. ARCHIVE TOURNAMENT BANNER                                 */}
      {/* ============================================================ */}
      <div className="border-2 border-red-600 bg-red-50/50 p-6 shadow-[4px_4px_0px_0px_#DC2626] dark:border-red-500 dark:bg-red-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-black uppercase text-red-600 dark:text-red-400 tracking-wider">
              [ DANGER ZONE // HALL OF FAME ]
            </span>
            <h4 className="mt-1 font-display text-xl font-black uppercase text-slate-900 dark:text-white">
              Arsipkan Turnamen "{tournament.title}"
            </h4>
            <p className="font-mono text-xs text-slate-600 dark:text-steel-400 max-w-xl">
              Turnamen yang sudah selesai dapat diarsipkan ke Hall of Fame. Seluruh statistik, pemenang juara, dan perolehan poin akan dibekukan secara permanen.
            </p>
          </div>

          <button
            onClick={handleArchive}
            disabled={saving}
            className="border-2 border-red-600 bg-red-600 px-4 py-2.5 font-mono text-xs font-black uppercase text-white hover:bg-red-700 shadow-[3px_3px_0px_0px_#000] flex items-center space-x-2"
          >
            <Archive className="h-4 w-4" />
            <span>ARSIPKAN SEKARANG</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: BUAT TURNAMEN BARU                                    */}
      {/* ============================================================ */}
      {isCreateTournamentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base rounded-none">
            <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
                <h3 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
                  Buat Turnamen Baru
                </h3>
              </div>
              <button
                onClick={() => setIsCreateTournamentModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
                  Nama / Judul Turnamen *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CEES FAST SCRIM SEASON 2"
                  value={newTourTitle}
                  onChange={(e) => setNewTourTitle(e.target.value.toUpperCase())}
                  className="w-full border-2 border-slate-900 p-2.5 font-display text-base font-black uppercase text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
                  Sub-judul / Tagline
                </label>
                <input
                  type="text"
                  value={newTourSubtitle}
                  onChange={(e) => setNewTourSubtitle(e.target.value)}
                  className="w-full border-2 border-slate-900 p-2 font-mono text-xs text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
                  Prizepool
                </label>
                <input
                  type="text"
                  value={newTourPrizePool}
                  onChange={(e) => setNewTourPrizePool(e.target.value)}
                  className="w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
                  Preset Struktur Pertandingan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewTourPreset("dual")}
                    className={`border-2 border-slate-900 p-3 text-left font-mono text-xs font-bold transition-all ${
                      newTourPreset === "dual"
                        ? "bg-slate-900 text-white shadow-[3px_3px_0px_0px_#0030FF] dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-dark-surface dark:text-steel-300"
                    }`}
                  >
                    <div className="font-black text-xs uppercase">2 GRUP + GRAND FINAL</div>
                    <div className="text-[10px] opacity-80 mt-1">
                      Kualifikasi Grup A & B (masing-masing 16 tim) + 1 Lembar Grand Final.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTourPreset("single")}
                    className={`border-2 border-slate-900 p-3 text-left font-mono text-xs font-bold transition-all ${
                      newTourPreset === "single"
                        ? "bg-slate-900 text-white shadow-[3px_3px_0px_0px_#0030FF] dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-dark-surface dark:text-steel-300"
                    }`}
                  >
                    <div className="font-black text-xs uppercase">SINGLE STAGE (1 LEMBAR)</div>
                    <div className="text-[10px] opacity-80 mt-1">
                      Turnamen langsung 1 lembar tanpa babak kualifikasi grup.
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2 border-t-2 border-slate-900 dark:border-white pt-4">
              <button
                onClick={() => setIsCreateTournamentModalOpen(false)}
                className="border-2 border-slate-900 px-4 py-2 font-mono text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white dark:text-steel-300"
              >
                BATAL
              </button>
              <button
                onClick={handleCreateTournament}
                disabled={saving}
                className="brutal-btn px-5 py-2 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
              >
                BUAT SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH LEMBAR / GRUP                                  */}
      {/* ============================================================ */}
      {isAddSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base rounded-none">
            <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
                <h3 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
                  Tambah Lembar / Grup Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddSheetModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
                  Nama Lembar / Grup *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grup B atau Grand Final"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  className="w-full border-2 border-slate-900 p-2.5 font-display text-sm font-black uppercase text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
                  Fase Pertandingan
                </label>
                <select
                  value={newSheetPhase}
                  onChange={(e) => setNewSheetPhase(e.target.value as TournamentPhase)}
                  className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs font-bold uppercase text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                >
                  <option value="QUALIFIER">KUALIFIKASI (QUALIFIERS)</option>
                  <option value="FINAL">GRAND FINAL</option>
                  <option value="SEMI_FINAL">SEMI FINAL</option>
                  <option value="PLAY_INS">PLAY-INS / LAST CHANCE</option>
                  <option value="CUSTOM">CUSTOM STAGE</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300 block mb-1">
                  Daftar Tim Peserta Awal
                </label>
                <select
                  value={newSheetCopySource}
                  onChange={(e) => setNewSheetCopySource(e.target.value)}
                  className="w-full border-2 border-slate-900 bg-slate-50 p-2.5 font-mono text-xs font-bold uppercase text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                >
                  <option value="default">16 Tim Preset PMWC Baru</option>
                  <option value="active">Salin Seluruh Tim dari Lembar Saat Ini ({activeSheet.name})</option>
                  <option value="top8">Salin Top 8 Teratas dari {activeSheet.name} (Khusus Final)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2 border-t-2 border-slate-900 dark:border-white pt-4">
              <button
                onClick={() => setIsAddSheetModalOpen(false)}
                className="border-2 border-slate-900 px-4 py-2 font-mono text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white dark:text-steel-300"
              >
                BATAL
              </button>
              <button
                onClick={handleAddSheet}
                disabled={saving}
                className="brutal-btn px-5 py-2 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
              >
                TAMBAH LEMBAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Poster Modal */}
      <TournamentShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tournament={tournament}
        standings={sheetStandings}
        sheetName={activeSheet.name}
      />

      {/* Archive Modal */}
      <TournamentArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archives={archives}
      />
    </div>
  );
}
