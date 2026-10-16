"use client";

import React, { useState, useRef } from "react";
import { toPng } from "html-to-image";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Flame,
  Trophy,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  LiveTournamentData,
  TournamentStanding,
} from "@/lib/tournament/pubgmCalculator";
import { generateWhatsAppShareText } from "@/lib/tournament/exportTournamentUtils";
import { ceesAlert } from "@/lib/ceesAlert";

interface TournamentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: LiveTournamentData;
  standings: TournamentStanding[];
}

export default function TournamentShareModal({
  isOpen,
  onClose,
  tournament,
  standings,
}: TournamentShareModalProps) {
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "9:16">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    ceesAlert.toast({
      type: "info",
      title: "GENERATING PNG CARD...",
      message: "Sedang merender kartu grafis resolusi tinggi...",
      duration: 2500,
    });
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const cleanName = tournament.title.replace(/\s+/g, "_");
      link.download = `CEES_AREA_${cleanName}_${aspectRatio === "1:1" ? "Feed_1x1" : "Story_9x16"}.png`;
      link.href = dataUrl;
      link.click();
      ceesAlert.toast({
        type: "success",
        title: "KARTU BERHASIL DIUNDUH",
        message: `Gambar ${aspectRatio} siap diupload ke Instagram & TikTok!`,
        duration: 3500,
      });
    } catch (err) {
      console.error("Gagal generate gambar:", err);
      ceesAlert.error({
        title: "RENDER GAGAL",
        message: "Gagal merender dan mengunduh kartu grafis klasemen.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyWA = () => {
    const text = generateWhatsAppShareText(tournament, standings);
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    ceesAlert.toast({
      type: "success",
      title: "FORMAT WA TERSALIN",
      message: "Teks rekap turnamen siap ditempel ke grup WhatsApp!",
      duration: 3000,
    });
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const topFragger = [...standings].sort((a, b) => b.elimPoints - a.elimPoints)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl border-2 sm:border-4 border-slate-900 bg-white p-4 sm:p-6 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface my-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-brand-blue text-white px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-none shadow-[2px_2px_0px_0px_#000]">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>STREETWEAR TELEMETRY EXPORT</span>
            </div>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white">
              SHARE KARTU KLASEMEN // IG & TIKTOK
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-slate-900 bg-slate-100 p-2 text-slate-900 hover:bg-rose-500 hover:text-white transition-colors dark:border-white dark:bg-dark-base dark:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar Kontrol */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-steel-400 uppercase shrink-0">
              Rasio:
            </span>
            <div className="grid grid-cols-2 gap-1.5 flex-1 sm:flex-initial">
              <button
                onClick={() => setAspectRatio("1:1")}
                className={`border-2 border-slate-900 px-3 py-1.5 font-mono text-xs font-bold transition-all rounded-none dark:border-white text-center ${
                  aspectRatio === "1:1"
                    ? "bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000] dark:bg-brand-cyan dark:text-slate-950"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-dark-base dark:text-steel-300"
                }`}
              >
                1:1 (FEED)
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`border-2 border-slate-900 px-3 py-1.5 font-mono text-xs font-bold transition-all rounded-none dark:border-white text-center ${
                  aspectRatio === "9:16"
                    ? "bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000] dark:bg-brand-cyan dark:text-slate-950"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-dark-base dark:text-steel-300"
                }`}
              >
                9:16 (STORY)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              onClick={handleCopyWA}
              className="border-2 border-slate-900 bg-emerald-500 px-3.5 py-2 font-mono text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-[2px_2px_0px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center justify-center space-x-1.5"
            >
              {copiedWA ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedWA ? "TERSALIN!" : "SALIN WA"}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="border-2 border-slate-900 bg-brand-blue px-4 py-2 font-mono text-xs font-bold text-white hover:bg-blue-600 shadow-[2px_2px_0px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isGenerating ? "MEMPROSES..." : "UNDUH PNG"}</span>
            </button>
          </div>
        </div>

        {/* Card Canvas Container (What gets screenshotted) */}
        <div className="mt-4 flex justify-center overflow-x-auto overflow-y-auto max-h-[60vh] bg-slate-900/95 p-3 sm:p-5 border-2 border-slate-900 dark:border-white">
          <div
            ref={cardRef}
            className={`relative flex flex-col justify-between border-4 border-white bg-[#060810] p-5 text-white shadow-2xl transition-all select-none overflow-hidden ${
              aspectRatio === "1:1"
                ? "w-[480px] h-[480px]"
                : "w-[390px] h-[690px]"
            }`}
            style={{
              backgroundImage:
                "radial-gradient(#0030FF20 1px, transparent 1px), radial-gradient(#ffffff0a 1px, #060810 1px)",
              backgroundSize: "24px 24px, 12px 12px",
            }}
          >
            {/* Corner Decorative Streetwear Stamps */}
            <div className="absolute top-2 right-2 text-[8px] font-mono text-white/30 uppercase tracking-widest pointer-events-none">
              [CEES-TELEMETRY // VER 2.6]
            </div>
            <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/30 uppercase tracking-widest pointer-events-none">
              INVICTUS MANEO // SAMARINDA KALTIM
            </div>

            {/* Top Brand Banner */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-white/20 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-brand-blue flex items-center justify-center font-display font-black text-white text-xs border border-white">
                    C
                  </div>
                  <div>
                    <span className="font-display font-black text-sm uppercase tracking-wider text-white">
                      CEES AREA
                    </span>
                    <span className="ml-2 font-mono text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1 border border-amber-400/30">
                      PUBGM BATTLE ROYALE
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono text-[9px] font-bold text-white/70">
                  <span className="bg-red-600 text-white px-1.5 py-0.5 font-black uppercase tracking-wider animate-pulse">
                    ● {tournament.status}
                  </span>
                </div>
              </div>

              {/* Title & Match Info */}
              <div className="mt-2.5 flex items-end justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-cyan font-bold">
                    OFFICIAL TOURNAMENT STANDINGS
                  </span>
                  <h2 className="font-display text-lg font-black uppercase text-white tracking-tight leading-tight">
                    {tournament.title}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] font-bold text-amber-400">
                    MATCH {tournament.currentMatch}/{tournament.totalMatches}
                  </div>
                  <div className="font-mono text-[9px] text-white/60 uppercase">
                    MAP: {tournament.currentMap}
                  </div>
                </div>
              </div>
            </div>

            {/* Standings Table in Card */}
            <div className="my-2 flex-1 overflow-hidden">
              <div className="grid grid-cols-12 gap-1 border-b-2 border-white/30 pb-1 font-mono text-[8px] sm:text-[9px] font-black uppercase text-white/60 tracking-wider">
                <span className="col-span-2 text-center">POS</span>
                <span className="col-span-5">TEAM</span>
                <span className="col-span-2 text-center">WWCD</span>
                <span className="col-span-3 text-right">TOTAL PTS</span>
              </div>

              <div className="divide-y divide-white/10 mt-1">
                {standings
                  .slice(0, aspectRatio === "1:1" ? 6 : 12)
                  .map((t, idx) => {
                    const isTop1 = idx === 0;
                    const isTop3 = idx < 3;
                    return (
                      <div
                        key={t.teamId}
                        className={`grid grid-cols-12 gap-1 py-1 sm:py-1.5 items-center font-mono text-[10px] ${
                          isTop1
                            ? "bg-amber-400/15 text-amber-300 font-bold"
                            : isTop3
                            ? "text-sky-300 font-semibold"
                            : "text-white/80"
                        }`}
                      >
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-block w-4 h-4 text-center leading-4 text-[9px] font-black ${
                              isTop1
                                ? "bg-amber-400 text-slate-950"
                                : isTop3
                                ? "bg-blue-600 text-white"
                                : "bg-white/10 text-white"
                            }`}
                          >
                            {t.rank}
                          </span>
                        </div>
                        <div className="col-span-5 truncate flex items-center space-x-1">
                          <span className="font-black">[{t.teamCode}]</span>
                          <span className="truncate">{t.teamName}</span>
                        </div>
                        <div className="col-span-2 text-center font-bold text-amber-400">
                          {t.wwcd > 0 ? `🍗 ${t.wwcd}` : "-"}
                        </div>
                        <div className="col-span-3 text-right font-display font-black text-sm text-white pr-1">
                          {t.totalPoints}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Highlights & Barcode */}
            <div className="border-t-2 border-white/20 pt-2 flex items-center justify-between">
              <div>
                {topFragger && (
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[8px] font-mono font-bold px-1 py-0.5 uppercase">
                      TOP ELIMINATOR
                    </span>
                    <span className="font-mono text-[9px] font-bold text-white">
                      [{topFragger.teamCode}] ({topFragger.elimPoints} Kills)
                    </span>
                  </div>
                )}
                <div className="font-mono text-[8px] text-white/50 mt-0.5">
                  RULES: {tournament.scoringSystem} // 10 PTS WWCD
                </div>
              </div>

              {/* Streetwear Faux-Barcode */}
              <div className="flex flex-col items-end">
                <div className="flex space-x-0.5 h-4 items-end opacity-60">
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[3px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[4px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                </div>
                <span className="font-mono text-[7px] text-white/40 tracking-widest mt-0.5">
                  CEES*ESPORTS*HUB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="border-2 border-slate-900 bg-slate-100 px-4 py-2 font-mono text-xs font-bold text-slate-800 hover:bg-slate-200 dark:border-white dark:bg-dark-base dark:text-white"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
}
