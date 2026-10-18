// src/lib/tournament/pubgmCalculator.ts

export interface TournamentTeam {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
}

export interface MatchTeamResult {
  teamId: string;
  rank: number; // 1 to 16 (or up to 20)
  kills: number;
}

export interface TournamentMatch {
  matchId: string;
  matchNumber: number;
  mapName: string; // "Erangel" | "Miramar" | "Sanhok" | "Vikendi" | string
  time?: string;
  isCompleted: boolean;
  teamResults: MatchTeamResult[];
}

export interface TournamentStanding {
  rank?: number;
  teamId: string;
  teamName: string;
  teamCode: string;
  logoUrl?: string;
  matchesPlayed: number;
  wwcd: number;
  rankPoints: number;
  elimPoints: number;
  totalPoints: number;
  lastMatchPoints: number;
  lastMatchRank: number;
}

export type TournamentPhase =
  | "QUALIFIER"
  | "FINAL"
  | "SEMI_FINAL"
  | "PLAY_INS"
  | "CUSTOM";

export interface TournamentSheet {
  id: string;
  name: string; // e.g. "Grup A", "Grup B", "Grand Final"
  phase: TournamentPhase;
  isVisible: boolean; // Show/Hide toggle khusus lembar ini
  totalMatches: number;
  currentMatch: number;
  currentMap: string;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
}

export interface LiveTournamentData {
  id: string;
  title: string;
  subtitle: string;
  status: "LIVE" | "UPCOMING" | "BREAK" | "COMPLETED";
  isVisible: boolean; // Show/Hide toggle on Homepage
  totalMatches: number;
  currentMatch: number;
  currentMap: string;
  scoringSystem: string;
  prizePool?: string;
  date: string;
  location?: string;
  updatedAt: string;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
  activeSheetId?: string;
  sheets?: TournamentSheet[];
}

export interface ArchivedTournament {
  id: string;
  archivedAt: string;
  title: string;
  date: string;
  champion: TournamentStanding;
  runnerUp?: TournamentStanding;
  thirdPlace?: TournamentStanding;
  data?: LiveTournamentData;
  standings?: TournamentStanding[];
}

/**
 * Aturan Poin Resmi PMWC (PUBG Mobile World Cup / Global 10-Point System)
 */
export const PMWC_RANK_POINTS: Record<number, number> = {
  1: 10, // WWCD
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
};

export const OFFICIAL_MAPS = [
  "Erangel",
  "Miramar",
  "Sanhok",
  "Vikendi",
  "Rondo",
] as const;

/**
 * Hitung Klasemen Akumulasi Battle Royale (PMWC 10-Point Rules)
 */
export function calculatePUBGMStandings(
  teams: TournamentTeam[],
  matches: TournamentMatch[]
): TournamentStanding[] {
  const standingsMap: Record<string, TournamentStanding> = {};

  teams.forEach((team) => {
    standingsMap[team.id] = {
      teamId: team.id,
      teamName: team.name,
      teamCode: team.code,
      logoUrl: team.logoUrl,
      matchesPlayed: 0,
      wwcd: 0,
      rankPoints: 0,
      elimPoints: 0,
      totalPoints: 0,
      lastMatchPoints: 0,
      lastMatchRank: 99,
    };
  });

  // Urutkan matches berdasarkan matchNumber
  const completedMatches = matches
    .filter((m) => m.isCompleted)
    .sort((a, b) => a.matchNumber - b.matchNumber);

  completedMatches.forEach((match) => {
    match.teamResults.forEach((res) => {
      const standing = standingsMap[res.teamId];
      if (!standing) return;

      const rankPts = PMWC_RANK_POINTS[res.rank] ?? 0;
      const elimPts = Math.max(0, Number(res.kills) || 0);
      const matchPts = rankPts + elimPts;

      standing.matchesPlayed += 1;
      if (res.rank === 1) {
        standing.wwcd += 1;
      }
      standing.rankPoints += rankPts;
      standing.elimPoints += elimPts;
      standing.totalPoints += matchPts;

      standing.lastMatchPoints = matchPts;
      standing.lastMatchRank = res.rank;
    });
  });

  const standingsList = Object.values(standingsMap);

  // Sorting Tie-Breaker Resmi PUBGM PMWC:
  // 1. Total Points
  // 2. WWCD
  // 3. Elimination Points (Kills)
  // 4. Last Match Points
  // 5. Last Match Rank
  standingsList.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.wwcd !== a.wwcd) {
      return b.wwcd - a.wwcd;
    }
    if (b.elimPoints !== a.elimPoints) {
      return b.elimPoints - a.elimPoints;
    }
    if (b.lastMatchPoints !== a.lastMatchPoints) {
      return b.lastMatchPoints - a.lastMatchPoints;
    }
    return a.lastMatchRank - b.lastMatchRank;
  });

  return standingsList.map((team, index) => ({
    ...team,
    rank: index + 1,
  }));
}

/**
 * Default preset tim untuk turnamen baru (16 Tim Standar PMWC)
 */
export const DEFAULT_PRESET_TEAMS: TournamentTeam[] = [
  { id: "t1", code: "CEES", name: "CEES GANK PRIME" },
  { id: "t2", code: "PAW", name: "PAWPAW SAMARINDA" },
  { id: "t3", code: "BOR", name: "BORNEO PREDATORS" },
  { id: "t4", code: "MHK", name: "MAHAKAM WOLVES" },
  { id: "t5", code: "EVO", name: "EVO SAMARINDA" },
  { id: "t6", code: "SMD", name: "SAMARINDA ROAR" },
  { id: "t7", code: "KTI", name: "KUTAI WARRIORS" },
  { id: "t8", code: "BPP", name: "BALIKPAPAN ELITE" },
  { id: "t9", code: "TGR", name: "TENGGARONG FORCE" },
  { id: "t10", code: "SGT", name: "SANGATTA VIPERS" },
  { id: "t11", code: "BER", name: "BERAU PHANTOM" },
  { id: "t12", code: "NVA", name: "NOVA REBELS" },
  { id: "t13", code: "BTR", name: "BONTANG TITANS" },
  { id: "t14", code: "APX", name: "APEX HUNTERS" },
  { id: "t15", code: "DKS", name: "DARK KNIGHTS" },
  { id: "t16", code: "RRQ", name: "RRQ ACADEMY" },
];

/**
 * Generate lembar baru (Sheet / Grup / Fase)
 */
export function createNewTournamentSheet(
  name: string,
  phase: TournamentPhase = "QUALIFIER",
  teamList?: TournamentTeam[],
  totalMatches: number = 5
): TournamentSheet {
  const id = `sheet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const teams = teamList && teamList.length > 0 
    ? JSON.parse(JSON.stringify(teamList))
    : DEFAULT_PRESET_TEAMS.map((t, idx) => ({
        ...t,
        id: `team-${id}-${idx + 1}`,
      }));

  const mapsRotation = ["Erangel", "Miramar", "Sanhok", "Erangel", "Miramar", "Vikendi"];
  const matches: TournamentMatch[] = Array.from({ length: totalMatches }, (_, i) => ({
    matchId: `m-${id}-${i + 1}`,
    matchNumber: i + 1,
    mapName: mapsRotation[i % mapsRotation.length] || "Erangel",
    isCompleted: false,
    teamResults: teams.map((team: TournamentTeam, rankIndex: number) => ({
      teamId: team.id,
      rank: rankIndex + 1,
      kills: 0,
    })),
  }));

  return {
    id,
    name,
    phase,
    isVisible: true,
    totalMatches,
    currentMatch: 1,
    currentMap: matches[0]?.mapName || "Erangel",
    teams,
    matches,
  };
}

/**
 * Buat turnamen baru lengkap (dengan opsi preset 2 Grup Kualifikasi + 1 Grand Final)
 */
export function createNewTournament(
  title: string,
  subtitle: string = "SAMARINDA BATTLE ROYALE SHOWDOWN // PMWC RULES",
  withDualQualifiers: boolean = true
): LiveTournamentData {
  const id = `tour-${Date.now()}`;
  let sheets: TournamentSheet[] = [];

  if (withDualQualifiers) {
    // Buat Grup A
    const sheetA = createNewTournamentSheet("Grup A", "QUALIFIER", undefined, 5);
    // Buat Grup B (dengan tim clone/beda ID)
    const teamsB: TournamentTeam[] = DEFAULT_PRESET_TEAMS.map((t, idx) => ({
      id: `t-b-${idx + 1}`,
      code: `B${t.code.slice(0, 3)}`,
      name: `${t.name} (B)`,
    }));
    const sheetB = createNewTournamentSheet("Grup B", "QUALIFIER", teamsB, 5);
    // Buat Grand Final (awalnya hidden)
    const sheetFinal = createNewTournamentSheet("Grand Final", "FINAL", undefined, 6);
    sheetFinal.isVisible = false; // Tersembunyi sampai kualifikasi selesai

    sheets = [sheetA, sheetB, sheetFinal];
  } else {
    // Single sheet standard
    const singleSheet = createNewTournamentSheet("Grand Final", "FINAL", DEFAULT_PRESET_TEAMS, 5);
    sheets = [singleSheet];
  }

  const primarySheet = sheets[0];

  return {
    id,
    title: title.toUpperCase(),
    subtitle: subtitle.toUpperCase(),
    status: "UPCOMING",
    isVisible: true,
    totalMatches: primarySheet.totalMatches,
    currentMatch: primarySheet.currentMatch,
    currentMap: primarySheet.currentMap,
    scoringSystem: "PMWC 10-Point Official",
    prizePool: "Rp 2.000.000 + Trophy",
    date: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    location: "Samarinda Gaming Hub & Online Room",
    updatedAt: new Date().toISOString(),
    teams: primarySheet.teams,
    matches: primarySheet.matches,
    activeSheetId: primarySheet.id,
    sheets,
  };
}

/**
 * Normalisasi data turnamen agar backward-compatible dengan struktur flat lama
 */
export function normalizeTournamentData(raw: any): LiveTournamentData {
  if (!raw) {
    return createNewTournament("CEES BATTLE ROYALE SHOWDOWN", "PMWC 10-POINT OFFICIAL", true);
  }

  const data: LiveTournamentData = { ...raw };

  // Jika belum punya sheets atau array sheets kosong, migrasikan data flat lama ke Sheet 1
  if (!Array.isArray(data.sheets) || data.sheets.length === 0) {
    const legacyTeams: TournamentTeam[] = Array.isArray(data.teams) && data.teams.length > 0
      ? data.teams
      : DEFAULT_PRESET_TEAMS;

    const legacyMatches: TournamentMatch[] = Array.isArray(data.matches) && data.matches.length > 0
      ? data.matches
      : [];

    const defaultSheet: TournamentSheet = {
      id: "sheet-qual-a",
      name: "Grup A (Kualifikasi)",
      phase: "QUALIFIER",
      isVisible: true,
      totalMatches: data.totalMatches || legacyMatches.length || 5,
      currentMatch: data.currentMatch || 1,
      currentMap: data.currentMap || "Erangel",
      teams: legacyTeams,
      matches: legacyMatches,
    };

    data.sheets = [defaultSheet];
    data.activeSheetId = defaultSheet.id;
  }

  // Pastikan activeSheetId valid
  const currentActiveSheet = data.sheets.find((s) => s.id === data.activeSheetId) || data.sheets[0];
  data.activeSheetId = currentActiveSheet.id;

  // Sinkronkan top-level legacy fields dengan activeSheet untuk kompatibilitas penuh
  data.teams = currentActiveSheet.teams || [];
  data.matches = currentActiveSheet.matches || [];
  data.totalMatches = currentActiveSheet.totalMatches || 5;
  data.currentMatch = currentActiveSheet.currentMatch || 1;
  data.currentMap = currentActiveSheet.currentMap || "Erangel";

  return data;
}

/**
 * Ambil lembar aktif saat ini atau lembar pertama yang tersedia
 */
export function getActiveOrFirstSheet(
  tournament: LiveTournamentData,
  includeHidden: boolean = false
): TournamentSheet | null {
  const normalized = normalizeTournamentData(tournament);
  const sheets = normalized.sheets || [];
  const filtered = includeHidden ? sheets : sheets.filter((s) => s.isVisible);

  if (filtered.length === 0) {
    return sheets[0] || null;
  }

  const foundActive = filtered.find((s) => s.id === normalized.activeSheetId);
  return foundActive || filtered[0] || null;
}

