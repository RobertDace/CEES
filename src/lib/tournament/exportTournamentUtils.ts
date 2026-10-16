// src/lib/tournament/exportTournamentUtils.ts
import * as XLSX from "xlsx";
import {
  LiveTournamentData,
  TournamentStanding,
  PMWC_RANK_POINTS,
} from "./pubgmCalculator";

/**
 * Export Klasemen Turnamen ke format Microsoft Excel (.xlsx)
 */
export function exportTournamentToExcel(
  tournament: LiveTournamentData,
  standings: TournamentStanding[]
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overall Leaderboard
  const sheet1Rows: any[][] = [
    [`CEES AREA ESPORTS // ${tournament.title.toUpperCase()}`],
    [`Sub-title: ${tournament.subtitle}`],
    [`Format: ${tournament.scoringSystem} // Tanggal: ${tournament.date}`],
    [`Status: ${tournament.status} (Match ${tournament.currentMatch}/${tournament.totalMatches})`],
    [],
    [
      "POS",
      "KODE",
      "NAMA TIM",
      "MATCHES",
      "WWCD",
      "PLACEMENT PTS",
      "ELIM PTS",
      "TOTAL PTS",
      "KETERANGAN",
    ],
  ];

  standings.forEach((team) => {
    const rank = team.rank ?? 0;
    const keterangan =
      rank === 1
        ? "🏆 CHAMPION (WWCD LEADER)"
        : rank <= 3
        ? "TOP 3 PODIUM"
        : rank <= 8
        ? "QUALIFIED / UPPER BRACKET"
        : "RED ZONE / ELIMINATED";

    sheet1Rows.push([
      rank,
      team.teamCode,
      team.teamName,
      team.matchesPlayed,
      team.wwcd,
      team.rankPoints,
      team.elimPoints,
      team.totalPoints,
      keterangan,
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  ws1["!cols"] = [
    { wch: 6 },
    { wch: 8 },
    { wch: 26 },
    { wch: 10 },
    { wch: 8 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 26 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Overall Leaderboard");

  // Sheet 2: Log Hasil Per-Match
  const sheet2Rows: any[][] = [
    [`LOG HASIL PERTANDINGAN PER-MAP // ${tournament.title.toUpperCase()}`],
    [],
    [
      "MATCH #",
      "MAP",
      "STATUS",
      "TIM",
      "PLACEMENT RANK",
      "RANK PTS",
      "KILLS",
      "TOTAL PTS MATCH",
    ],
  ];

  tournament.matches.forEach((m) => {
    if (m.teamResults && m.teamResults.length > 0) {
      m.teamResults.forEach((res) => {
        const teamObj = tournament.teams.find((t) => t.id === res.teamId);
        const rankPts = PMWC_RANK_POINTS[res.rank] ?? 0;
        const totalPts = rankPts + (Number(res.kills) || 0);

        sheet2Rows.push([
          `Match #${m.matchNumber}`,
          m.mapName,
          m.isCompleted ? "COMPLETED" : "IN PROGRESS",
          teamObj ? `[${teamObj.code}] ${teamObj.name}` : res.teamId,
          `#${res.rank}`,
          rankPts,
          res.kills,
          totalPts,
        ]);
      });
    }
  });

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
  ws2["!cols"] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 26 },
    { wch: 16 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "Log Per-Match");

  const cleanFileName = tournament.title
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
  XLSX.writeFile(wb, `Rekap_${cleanFileName}_CEES_AREA.xlsx`);
}

/**
 * Format teks rekap klasemen untuk disiarkan ke WhatsApp Group
 */
export function generateWhatsAppShareText(
  tournament: LiveTournamentData,
  standings: TournamentStanding[]
): string {
  const leader = standings[0];
  const lines: string[] = [
    `🔥 *CEES AREA BATTLE ROYALE TELEMETRY* 🔥`,
    `🏆 *${tournament.title.toUpperCase()}*`,
    `📍 Status: *${tournament.status}* | Match ${tournament.currentMatch}/${tournament.totalMatches} (${tournament.currentMap})`,
    `⚙️ Rules: *${tournament.scoringSystem}*`,
    ``,
    `📊 *KLASEMEN SEMENTARA:*`,
    `═════════════════════════`,
  ];

  standings.forEach((team) => {
    const rank = team.rank ?? 0;
    const medal =
      rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
    const wwcdBadge = team.wwcd > 0 ? ` 🍗 ${team.wwcd} WWCD` : "";
    lines.push(
      `${medal} *[${team.teamCode}]* ${team.teamName} — *${team.totalPoints} Pts* (${team.elimPoints} Kills)${wwcdBadge}`
    );
  });

  lines.push(`═════════════════════════`);
  if (leader) {
    lines.push(`👑 *Current Leader:* ${leader.teamName} (${leader.totalPoints} Pts)`);
  }
  lines.push(``);
  lines.push(`⚡ *INVICTUS MANEO // TETAP TAK TERKALAHKAN*`);
  lines.push(`🌐 Pantau Live Score di: https://ceesarea.id`);

  return lines.join("\n");
}
