"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Trophy,
  Swords,
  Share2,
  Download,
  Copy,
  Check,
  Archive,
  RefreshCw,
  Eye,
  EyeOff,
  Crosshair,
  ShieldAlert,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  LiveTournamentData,
  TournamentStanding,
  ArchivedTournament,
  calculatePUBGMStandings,
  PMWC_RANK_POINTS,
} from "@/lib/tournament/pubgmCalculator";
import {
  subscribeToLiveTournament,
} from "@/lib/tournament/tournamentHelper";
import {
  exportTournamentToExcel,
  generateWhatsAppShareText,
} from "@/lib/tournament/exportTournamentUtils";
import TournamentShareModal from "./TournamentShareModal";
import initialTournamentData from "@/data/tournamentData.json";

export default function LiveTournamentSection() {
  const [tournament, setTournament] = useState<LiveTournamentData | null>(
    (initialTournamentData?.liveTournament as unknown as LiveTournamentData) || null
  );
  const [activeTab, setActiveTab] = useState<"overall" | number>("overall");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  useEffect(() => {
    // 1. Subscribe realtime data turnamen (Firestore / API polling fallback)
    const unsubscribe = subscribeToLiveTournament((data) => {
      if (data) {
        setTournament(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Jika tidak ada data turnamen, atau admin mengatur isVisible === false (sembunyikan di beranda)
  if (!tournament) return null;
  if (!tournament.isVisible) {
    // Hidden mode: Tidak merender apapun di halaman beranda pengunjung umum
    return null;
  }

  const standings: TournamentStanding[] = calculatePUBGMStandings(
    tournament.teams,
    tournament.matches
  );

  const leader = standings[0];
  const topEliminator = [...standings].sort((a, b) => b.elimPoints - a.elimPoints)[0];

  const handleCopyWA = () => {
    const text = generateWhatsAppShareText(tournament, standings);
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const handleExcelExport = () => {
    exportTournamentToExcel(tournament, standings);
  };

  // Cek match spesifik jika user klik tab match tertentu
  const selectedMatch =
    typeof activeTab === "number"
      ? tournament.matches.find((m) => m.matchNumber === activeTab)
      : null;

  return (
    <section
      id="live-event"
      className="relative border-b-4 border-slate-900 bg-slate-100 py-12 transition-colors duration-200 dark:border-dark-border dark:bg-[#070913] lg:py-16 overflow-hidden"
    >
      {/* Industrial Background Grid Lines */}
      <div className="absolute inset-0 bg-industrial-grid opacity-20 pointer-events-none" />

      {/* Cyber Diagonal Caution Accent Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-amber-400 to-brand-cyan" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Streetwear Header Box */}
        <div className="border-2 sm:border-4 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {/* Tactical Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-red-600 px-2.5 py-0.5 text-xs font-mono font-black text-white uppercase rounded-none shadow-[2px_2px_0px_0px_#000] animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>{tournament.status}</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-amber-400 px-2.5 py-0.5 text-xs font-mono font-black text-slate-950 uppercase rounded-none shadow-[2px_2px_0px_0px_#000]">
                  <Crosshair className="h-3.5 w-3.5" />
                  <span>MATCH {tournament.currentMatch} OF {tournament.totalMatches}</span>
                </span>
                <span className="inline-flex items-center space-x-1 border-2 border-slate-900 bg-white px-2.5 py-0.5 text-xs font-mono font-bold text-slate-900 uppercase rounded-none shadow-[2px_2px_0px_0px_#000] dark:bg-dark-base dark:text-white dark:border-white">
                  <span>MAP:</span>
                  <span className="text-brand-blue font-black dark:text-brand-cyan">
                    {tournament.currentMap}
                  </span>
                </span>
                <span className="hidden sm:inline-block font-mono text-[11px] font-bold text-slate-500 dark:text-steel-400 uppercase">
                  // {tournament.scoringSystem}
                </span>
              </div>

              {/* Tournament Title */}
              <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-5xl dark:text-white leading-none">
                {tournament.title}
              </h2>
              <p className="mt-1 font-mono text-xs font-bold text-brand-blue uppercase tracking-wider dark:text-brand-cyan">
                {tournament.subtitle}
              </p>
            </div>

            {/* Quick Action Tools */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="brutal-btn flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-none"
                title="Generate poster klasemen untuk Instagram Story / Feed / TikTok"
              >
                <Share2 className="h-4 w-4" />
                <span>KARTU IG / TIKTOK</span>
              </button>

              <button
                onClick={handleCopyWA}
                className="border-2 border-slate-900 bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center space-x-1.5 rounded-none dark:border-white"
                title="Salin ringkasan klasemen ke format pesan WhatsApp"
              >
                {copiedWA ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedWA ? "TERSALIN!" : "SHARE WA"}</span>
              </button>

              <button
                onClick={handleExcelExport}
                className="border-2 border-slate-900 bg-slate-100 px-3 py-2.5 font-mono text-xs font-bold text-slate-800 hover:bg-slate-200 shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center space-x-1.5 rounded-none dark:border-white dark:bg-dark-base dark:text-white"
                title="Unduh rekap turnamen (.xlsx)"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">EXCEL</span>
              </button>
            </div>
          </div>

          {/* Highlights Mini Banner: Leader & Top Eliminator */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 border-t-2 border-slate-900 pt-5 dark:border-white">
            {leader && (
              <div className="border-2 border-slate-900 bg-amber-50 p-3 shadow-[3px_3px_0px_0px_#F59E0B] dark:border-amber-400 dark:bg-amber-950/20">
                <div className="flex items-center justify-between font-mono text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">
                  <span className="flex items-center space-x-1">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>CURRENT LEADER // #1</span>
                  </span>
                  <span>{leader.wwcd} WWCD 🍗</span>
                </div>
                <div className="mt-1 font-display font-black text-lg uppercase text-slate-900 dark:text-white truncate">
                  [{leader.teamCode}] {leader.teamName}
                </div>
                <div className="font-mono text-xs text-slate-700 dark:text-steel-300">
                  Total Skor: <strong className="font-black text-slate-900 dark:text-white">{leader.totalPoints} Pts</strong> ({leader.rankPoints} Rank + {leader.elimPoints} Kills)
                </div>
              </div>
            )}

            {topEliminator && (
              <div className="border-2 border-slate-900 bg-red-50 p-3 shadow-[3px_3px_0px_0px_#EF4444] dark:border-red-400 dark:bg-red-950/20">
                <div className="flex items-center justify-between font-mono text-[10px] font-black text-red-600 dark:text-red-400 uppercase">
                  <span className="flex items-center space-x-1">
                    <Flame className="h-3.5 w-3.5" />
                    <span>TOP ELIMINATOR // TERMINATOR</span>
                  </span>
                  <span>{topEliminator.elimPoints} KILLS 🔥</span>
                </div>
                <div className="mt-1 font-display font-black text-lg uppercase text-slate-900 dark:text-white truncate">
                  [{topEliminator.teamCode}] {topEliminator.teamName}
                </div>
                <div className="font-mono text-xs text-slate-700 dark:text-steel-300">
                  Total Kill Pts: <strong className="font-black text-slate-900 dark:text-white">{topEliminator.elimPoints}</strong> ({topEliminator.matchesPlayed} Matches)
                </div>
              </div>
            )}

            <div className="border-2 border-slate-900 bg-blue-50 p-3 shadow-[3px_3px_0px_0px_#0030FF] sm:col-span-2 lg:col-span-1 dark:border-brand-blue dark:bg-blue-950/20">
              <div className="font-mono text-[10px] font-black text-brand-blue dark:text-brand-cyan uppercase">
                INFORMASI ARENA // SAMARINDA
              </div>
              <div className="mt-1 font-display font-black text-lg uppercase text-slate-900 dark:text-white">
                {tournament.prizePool || "PRIZEPOOL & GLORY"}
              </div>
              <div className="font-mono text-xs text-slate-700 dark:text-steel-300">
                {tournament.location || "Samarinda Battle Arena"} • {tournament.date}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Overall vs Per-Match) */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("overall")}
            className={`border-2 border-slate-900 px-4 py-2 font-mono text-xs font-black uppercase transition-all rounded-none dark:border-white ${
              activeTab === "overall"
                ? "bg-slate-900 text-white shadow-[4px_4px_0px_0px_#0030FF] dark:bg-white dark:text-slate-950"
                : "bg-white text-slate-800 hover:bg-slate-100 dark:bg-dark-surface dark:text-steel-300"
            }`}
          >
            🏆 OVERALL STANDINGS
          </button>

          {tournament.matches.map((m) => (
            <button
              key={m.matchId}
              onClick={() => setActiveTab(m.matchNumber)}
              className={`border-2 border-slate-900 px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all rounded-none dark:border-white ${
                activeTab === m.matchNumber
                  ? "bg-brand-blue text-white shadow-[4px_4px_0px_0px_#000] dark:bg-brand-cyan dark:text-slate-950"
                  : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-dark-surface dark:text-steel-300"
              }`}
            >
              M{m.matchNumber}: {m.mapName} {m.isCompleted ? "✓" : "⏳"}
            </button>
          ))}
        </div>

        {/* Leaderboard Table Container */}
        <div className="mt-4 border-2 sm:border-4 border-slate-900 bg-white shadow-[6px_6px_0px_0px_#000] overflow-x-auto dark:border-white dark:bg-dark-base rounded-none">
          {activeTab === "overall" ? (
            /* Tab: OVERALL STANDINGS */
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-dark-void text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 sm:px-4 text-center w-12 sm:w-16"># POS</th>
                  <th className="py-3 px-3 sm:px-4">TIM / CLAN</th>
                  <th className="py-3 px-2 sm:px-3 text-center">MATCH</th>
                  <th className="py-3 px-2 sm:px-3 text-center">WWCD</th>
                  <th className="py-3 px-2 sm:px-3 text-right">RANK PTS</th>
                  <th className="py-3 px-2 sm:px-3 text-right">ELIMS</th>
                  <th className="py-3 px-3 sm:px-4 text-right bg-brand-blue text-white font-black text-sm">
                    TOTAL PTS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-dark-border">
                {standings.map((team, idx) => {
                  const rank = team.rank ?? idx + 1;
                  const isTop1 = rank === 1;
                  const isTop3 = rank > 1 && rank <= 3;
                  const isSafeZone = rank > 3 && rank <= 8;

                  let rankBg = "bg-white dark:bg-dark-surface";
                  if (isTop1) rankBg = "bg-amber-100/60 dark:bg-amber-950/30";
                  else if (isTop3) rankBg = "bg-blue-50/70 dark:bg-blue-950/20";

                  return (
                    <tr
                      key={team.teamId}
                      className={`hover:bg-slate-100 dark:hover:bg-dark-void transition-colors ${rankBg}`}
                    >
                      {/* POS */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center font-display font-black text-xs h-6 w-6 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#000] dark:border-white ${
                            isTop1
                              ? "bg-amber-400 text-slate-950 font-bold"
                              : isTop3
                              ? "bg-brand-blue text-white"
                              : isSafeZone
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-800 dark:bg-dark-base dark:text-white"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* TIM */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center space-x-2">
                          <span className="border border-slate-900 bg-slate-900 px-1.5 py-0.5 text-[10px] font-black text-white dark:border-white dark:bg-white dark:text-slate-950">
                            {team.teamCode}
                          </span>
                          <span className="font-display font-black text-sm sm:text-base text-slate-900 uppercase dark:text-white">
                            {team.teamName}
                          </span>
                        </div>
                      </td>

                      {/* MATCH */}
                      <td className="py-3 px-2 sm:px-3 text-center font-bold text-slate-600 dark:text-steel-400">
                        {team.matchesPlayed}
                      </td>

                      {/* WWCD */}
                      <td className="py-3 px-2 sm:px-3 text-center">
                        {team.wwcd > 0 ? (
                          <span className="inline-flex items-center space-x-0.5 font-black text-amber-600 dark:text-amber-400">
                            <span>🍗</span>
                            <span>{team.wwcd}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* RANK PTS */}
                      <td className="py-3 px-2 sm:px-3 text-right font-bold text-slate-700 dark:text-steel-300">
                        {team.rankPoints}
                      </td>

                      {/* ELIMS */}
                      <td className="py-3 px-2 sm:px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {team.elimPoints}
                      </td>

                      {/* TOTAL PTS */}
                      <td className="py-3 px-3 sm:px-4 text-right font-display font-black text-base sm:text-lg text-slate-950 bg-blue-50/50 dark:bg-blue-950/30 dark:text-white">
                        {team.totalPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : selectedMatch ? (
            /* Tab: PER-MATCH LOGS */
            <div>
              <div className="border-b-2 border-slate-900 bg-slate-100 p-4 font-mono text-xs dark:border-white dark:bg-dark-void flex items-center justify-between">
                <div>
                  <span className="font-black uppercase text-brand-blue dark:text-brand-cyan">
                    MATCH #{selectedMatch.matchNumber} // MAP: {selectedMatch.mapName}
                  </span>
                  <span className="ml-3 font-bold text-slate-600 dark:text-steel-400">
                    STATUS: {selectedMatch.isCompleted ? "SELESAI (COMPLETED)" : "SEDANG BERLANGSUNG"}
                  </span>
                </div>
                <div className="font-bold text-slate-500">
                  {selectedMatch.time || ""}
                </div>
              </div>

              {selectedMatch.teamResults && selectedMatch.teamResults.length > 0 ? (
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-dark-void text-[11px] uppercase">
                      <th className="py-2.5 px-4 text-center w-16">RANK</th>
                      <th className="py-2.5 px-4">TIM</th>
                      <th className="py-2.5 px-4 text-right">PLACEMENT PTS</th>
                      <th className="py-2.5 px-4 text-right">KILLS</th>
                      <th className="py-2.5 px-4 text-right bg-brand-blue text-white font-black">
                        MATCH PTS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200 dark:divide-dark-border">
                    {selectedMatch.teamResults
                      .sort((a, b) => a.rank - b.rank)
                      .map((res) => {
                        const team = tournament.teams.find((t) => t.id === res.teamId);
                        const rankPts = PMWC_RANK_POINTS[res.rank] ?? 0;
                        const matchPts = rankPts + res.kills;
                        return (
                          <tr
                            key={res.teamId}
                            className={`hover:bg-slate-100 dark:hover:bg-dark-surface ${
                              res.rank === 1 ? "bg-amber-100/50 dark:bg-amber-950/20" : ""
                            }`}
                          >
                            <td className="py-2.5 px-4 text-center font-bold">
                              #{res.rank} {res.rank === 1 && "🍗 WWCD"}
                            </td>
                            <td className="py-2.5 px-4 font-display font-black uppercase text-slate-900 dark:text-white">
                              [{team?.code || ""}] {team?.name || res.teamId}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-700 dark:text-steel-300">
                              {rankPts} Pts
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                              {res.kills} Kills
                            </td>
                            <td className="py-2.5 px-4 text-right font-display font-black text-sm text-slate-950 dark:text-white bg-blue-50/30 dark:bg-blue-950/20">
                              {matchPts} Pts
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center font-mono text-xs text-slate-500 dark:text-steel-400">
                  Belum ada input hasil untuk Match #{selectedMatch.matchNumber} ({selectedMatch.mapName}). Skor akan muncul otomatis saat admin menginput hasil match.
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Bottom Legend & Streetwear Footnote */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-600 dark:text-steel-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center space-x-1">
              <span className="h-3 w-3 bg-amber-400 border border-black inline-block" />
              <span>Rank 1: 10 Pts (WWCD)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-3 w-3 bg-brand-blue border border-black inline-block" />
              <span>Rank 2-3: 6-5 Pts</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-3 w-3 bg-emerald-500 border border-black inline-block" />
              <span>Rank 4-8: 4-1 Pts</span>
            </span>
            <span>• 1 Kill = 1 Pts</span>
          </div>

          <div className="flex items-center space-x-2">
            <span>TERAKHIR DISINKRONISASI:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {new Date(tournament.updatedAt).toLocaleTimeString("id-ID")} WITA
            </span>
          </div>
        </div>
      </div>

      {/* Share Poster Modal */}
      <TournamentShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tournament={tournament}
        standings={standings}
      />
    </section>
  );
}
