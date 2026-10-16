"use client";

import React, { useState } from "react";
import { X, Trophy, Calendar, Award, ChevronRight, Archive, Shield } from "lucide-react";
import { ArchivedTournament } from "@/lib/tournament/pubgmCalculator";

interface TournamentArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archives: ArchivedTournament[];
}

export default function TournamentArchiveModal({
  isOpen,
  onClose,
  archives,
}: TournamentArchiveModalProps) {
  const [selectedArchive, setSelectedArchive] = useState<ArchivedTournament | null>(
    archives[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl border-2 sm:border-4 border-slate-900 bg-white p-4 sm:p-6 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-slate-900 text-amber-400 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-none shadow-[2px_2px_0px_0px_#0030FF] dark:bg-white dark:text-slate-950">
              <Archive className="h-3 w-3" />
              <span>HALL OF FAME // ARSIP TURNAMEN</span>
            </div>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white">
              REKAM JEJAK & JUARA TURNAMEN CEES AREA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-slate-900 bg-slate-100 p-2 text-slate-900 hover:bg-rose-500 hover:text-white transition-colors dark:border-white dark:bg-dark-base dark:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {archives.length === 0 ? (
          <div className="py-12 text-center font-mono text-sm text-slate-600 dark:text-steel-400">
            Belum ada turnamen yang diarsipkan. Turnamen yang selesai akan disimpan di sini oleh admin.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List Tournaments */}
            <div className="md:col-span-1 border-2 border-slate-900 p-3 bg-slate-50 dark:border-white dark:bg-dark-base divide-y-2 divide-slate-200 dark:divide-dark-border space-y-2">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-500 dark:text-steel-400 block pb-2">
                PILIH TURNAMEN:
              </span>
              {archives.map((arch) => {
                const isSelected = selectedArchive?.id === arch.id;
                return (
                  <button
                    key={arch.id}
                    onClick={() => setSelectedArchive(arch)}
                    className={`w-full text-left p-3 pt-3 transition-all border-2 ${
                      isSelected
                        ? "border-slate-900 bg-brand-blue text-white shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-brand-blue"
                        : "border-transparent hover:border-slate-400 bg-white dark:bg-dark-surface text-slate-800 dark:text-steel-200"
                    }`}
                  >
                    <div className="font-mono text-[10px] font-bold opacity-80">
                      {arch.date}
                    </div>
                    <div className="font-display font-black text-sm uppercase leading-snug">
                      {arch.title}
                    </div>
                    {arch.champion && (
                      <div className="mt-1 flex items-center space-x-1 font-mono text-[11px] font-bold text-amber-300">
                        <Trophy className="h-3 w-3" />
                        <span>JUARA: {arch.champion.teamName}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detail Snapshot */}
            <div className="md:col-span-2 border-2 border-slate-900 p-4 bg-white dark:border-white dark:bg-dark-base">
              {selectedArchive ? (
                <div>
                  <div className="border-b-2 border-slate-900 dark:border-white pb-3">
                    <span className="font-mono text-xs font-bold text-brand-blue dark:text-brand-cyan">
                      ARSIP TANGGAL: {selectedArchive.date}
                    </span>
                    <h4 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
                      {selectedArchive.title}
                    </h4>
                  </div>

                  {/* Podium Juara */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Champion */}
                    {selectedArchive.champion && (
                      <div className="border-2 border-slate-900 bg-amber-50 p-3 shadow-[3px_3px_0px_0px_#F59E0B] dark:border-amber-400 dark:bg-amber-950/30">
                        <div className="flex items-center space-x-1 font-mono text-[10px] font-black text-amber-600 dark:text-amber-400">
                          <Trophy className="h-4 w-4" />
                          <span>CHAMPION // #1</span>
                        </div>
                        <div className="mt-1 font-display font-black text-base uppercase text-slate-900 dark:text-white truncate">
                          {selectedArchive.champion.teamName}
                        </div>
                        <div className="font-mono text-xs text-slate-700 dark:text-steel-300 mt-1">
                          {selectedArchive.champion.totalPoints} Pts • {selectedArchive.champion.wwcd} WWCD
                        </div>
                      </div>
                    )}

                    {/* Runner Up */}
                    {selectedArchive.runnerUp && (
                      <div className="border-2 border-slate-900 bg-slate-50 p-3 shadow-[3px_3px_0px_0px_#64748B] dark:border-slate-400 dark:bg-slate-900/50">
                        <div className="flex items-center space-x-1 font-mono text-[10px] font-black text-slate-600 dark:text-slate-300">
                          <Award className="h-4 w-4" />
                          <span>RUNNER-UP // #2</span>
                        </div>
                        <div className="mt-1 font-display font-black text-base uppercase text-slate-900 dark:text-white truncate">
                          {selectedArchive.runnerUp.teamName}
                        </div>
                        <div className="font-mono text-xs text-slate-700 dark:text-steel-300 mt-1">
                          {selectedArchive.runnerUp.totalPoints} Pts • {selectedArchive.runnerUp.wwcd} WWCD
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {selectedArchive.thirdPlace && (
                      <div className="border-2 border-slate-900 bg-orange-50 p-3 shadow-[3px_3px_0px_0px_#D97706] dark:border-orange-500 dark:bg-orange-950/20">
                        <div className="flex items-center space-x-1 font-mono text-[10px] font-black text-orange-600 dark:text-orange-400">
                          <Award className="h-4 w-4" />
                          <span>3RD PLACE // #3</span>
                        </div>
                        <div className="mt-1 font-display font-black text-base uppercase text-slate-900 dark:text-white truncate">
                          {selectedArchive.thirdPlace.teamName}
                        </div>
                        <div className="font-mono text-xs text-slate-700 dark:text-steel-300 mt-1">
                          {selectedArchive.thirdPlace.totalPoints} Pts • {selectedArchive.thirdPlace.wwcd} WWCD
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary / Total Teams */}
                  <div className="mt-5 border-t-2 border-slate-200 dark:border-dark-border pt-4">
                    <p className="font-mono text-xs text-slate-600 dark:text-steel-400 leading-relaxed">
                      Turnamen ini diselenggarakan oleh komunitas CEES AREA (CEES GANK) Samarinda dengan format PMWC Battle Royale 10-Point. Seluruh data skor dan match tersimpan di database arsip komunitas.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="border-2 border-slate-900 bg-slate-100 px-5 py-2 font-mono text-xs font-bold text-slate-800 hover:bg-slate-200 dark:border-white dark:bg-dark-base dark:text-white"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
}
