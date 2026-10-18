// src/lib/tournament/exportTournamentUtils.ts
import * as XLSX from "xlsx";
import {
  LiveTournamentData,
  TournamentStanding,
  TournamentSheet,
  PMWC_RANK_POINTS,
  calculatePUBGMStandings,
  normalizeTournamentData,
} from "./pubgmCalculator";

/**
 * Export Klasemen Turnamen ke format Microsoft Excel (.xlsx)
 * Mendukung multi-sheet (Grup A, Grup B, Grand Final, dll.) dalam 1 workbook Excel!
 */
export function exportTournamentToExcel(
  tournament: LiveTournamentData,
  currentStandings?: TournamentStanding[],
  activeSheetName?: string
) {
  const normalized = normalizeTournamentData(tournament);
  const wb = XLSX.utils.book_new();

  const sheets = normalized.sheets && normalized.sheets.length > 0
    ? normalized.sheets
    : [
        {
          id: "sheet-default",
          name: activeSheetName || "Overall Leaderboard",
          phase: "FINAL" as const,
          isVisible: true,
          totalMatches: normalized.totalMatches,
          currentMatch: normalized.currentMatch,
          currentMap: normalized.currentMap,
          teams: normalized.teams,
          matches: normalized.matches,
        },
      ];

  sheets.forEach((sheet, sheetIdx) => {
    const sheetStandings = calculatePUBGMStandings(sheet.teams, sheet.matches);
    const sanitizedSheetTitle = sheet.name.replace(/[:\\/?*\[\]]/g, "_").slice(0, 25);

    // Sheet Leaderboard
    const sheetRows: any[][] = [
      [`CEES AREA ESPORTS // ${normalized.title.toUpperCase()}`],
      [`Fase/Lembar: ${sheet.name.toUpperCase()} (${sheet.phase})`],
      [`Sub-title: ${normalized.subtitle}`],
      [`Format: ${normalized.scoringSystem} // Tanggal: ${normalized.date}`],
      [`Status: ${normalized.status} (Match ${sheet.currentMatch}/${sheet.totalMatches})`],
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

    sheetStandings.forEach((team) => {
      const rank = team.rank ?? 0;
      const keterangan =
        rank === 1
          ? "🏆 CHAMPION (WWCD LEADER)"
          : rank <= 3
          ? "TOP 3 PODIUM"
          : rank <= 8
          ? "QUALIFIED / ADVANCE"
          : "RED ZONE / ELIMINATED";

      sheetRows.push([
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

    const ws = XLSX.utils.aoa_to_sheet(sheetRows);
    ws["!cols"] = [
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
    XLSX.utils.book_append_sheet(wb, ws, `${sanitizedSheetTitle} - Klasemen`);

    // Sheet Log Matches
    if (sheet.matches && sheet.matches.length > 0) {
      const logRows: any[][] = [
        [`LOG HASIL PERTANDINGAN // ${sheet.name.toUpperCase()} (${normalized.title.toUpperCase()})`],
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

      sheet.matches.forEach((m) => {
        if (m.teamResults && m.teamResults.length > 0) {
          m.teamResults.forEach((res) => {
            const teamObj = sheet.teams.find((t) => t.id === res.teamId);
            const rankPts = PMWC_RANK_POINTS[res.rank] ?? 0;
            const totalPts = rankPts + (Number(res.kills) || 0);

            logRows.push([
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

      const wsLog = XLSX.utils.aoa_to_sheet(logRows);
      wsLog["!cols"] = [
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 26 },
        { wch: 16 },
        { wch: 10 },
        { wch: 10 },
        { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(wb, wsLog, `${sanitizedSheetTitle} - Match Log`);
    }
  });

  const cleanFileName = normalized.title
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
  XLSX.writeFile(wb, `Rekap_${cleanFileName}_CEES_AREA.xlsx`);
}

/**
 * Format teks rekap klasemen untuk disiarkan ke WhatsApp Group
 */
export function generateWhatsAppShareText(
  tournament: LiveTournamentData,
  standings: TournamentStanding[],
  sheetName?: string
): string {
  const leader = standings[0];
  const sheetHeader = sheetName ? `📌 *Lembar / Grup:* ${sheetName.toUpperCase()}` : "";
  const lines: string[] = [
    `🔥 *CEES AREA BATTLE ROYALE TELEMETRY* 🔥`,
    `🏆 *${tournament.title.toUpperCase()}*`,
    sheetHeader,
    `📍 Status: *${tournament.status}* | Match ${tournament.currentMatch}/${tournament.totalMatches} (${tournament.currentMap})`,
    `⚙️ Rules: *${tournament.scoringSystem}*`,
    ``,
    `📊 *KLASEMEN SEMENTARA:*`,
    `═════════════════════════`,
  ].filter(Boolean);

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

