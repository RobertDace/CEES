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
