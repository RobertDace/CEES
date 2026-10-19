"use client";

import React, { useState } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  HelpCircle,
  Edit3,
  X,
  Type,
  FileText,
  MousePointerClick,
  Info,
} from "lucide-react";
import {
  HomeSectionItem,
  DEFAULT_HOME_SECTIONS,
  HomeSectionsContent,
  DEFAULT_HOME_CONTENT,
} from "@/lib/homeSections";
import { ceesAlert } from "@/lib/ceesAlert";

interface HomeSectionReorderPanelProps {
  sections: HomeSectionItem[];
  onChange: (newSections: HomeSectionItem[]) => void;
  homeContent: HomeSectionsContent;
  onHomeContentChange: (newContent: HomeSectionsContent) => void;
}

export default function HomeSectionReorderPanel({
  sections,
  onChange,
  homeContent,
  onHomeContentChange,
}: HomeSectionReorderPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Helper update copy
  const updateField = (key: keyof HomeSectionsContent, val: string) => {
    onHomeContentChange({
      ...homeContent,
      [key]: val,
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", `${index}`);
    } catch (err) {}
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...sections];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    onChange(updated);

    ceesAlert.toast({
      type: "info",
      title: "URUTAN SECTION DIUBAH",
      message: `Posisi "${movedItem.label}" berhasil digeser ke urutan #${targetIndex + 1}.`,
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move up or down via buttons
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    onChange(updated);

    ceesAlert.toast({
      type: "info",
      title: "URUTAN SECTION DIPINDAH",
      message: `"${movedItem.label}" dipindahkan ke urutan #${targetIndex + 1}.`,
    });
  };

  // Toggle visibility (Show / Hide)
  const handleToggleVisibility = (index: number) => {
    const item = sections[index];
    const newStatus = !item.enabled;

    const updated = sections.map((sec, i) =>
      i === index ? { ...sec, enabled: newStatus } : sec
    );

    onChange(updated);

    ceesAlert.toast({
      type: newStatus ? "success" : "warning",
      title: newStatus ? "SECTION DIAKTIFKAN" : "SECTION DISEMBUNYIKAN",
      message: newStatus
        ? `"${item.label}" sekarang aktif & tampil di beranda.`
        : `"${item.label}" disembunyikan dari beranda publik.`,
    });
  };

  // Reset to default order and content
  const handleResetDefault = async () => {
    const confirmed = await ceesAlert.confirm({
      title: "RESET KE URUTAN BAWAAN?",
      message:
        "Susunan urutan section di beranda akan dikembalikan ke urutan default awal (8 section aktif). Lanjutkan?",
      confirmText: "YA, RESET KE DEFAULT",
      cancelText: "BATALKAN",
    });

    if (confirmed) {
      onChange(DEFAULT_HOME_SECTIONS);
      ceesAlert.toast({
        type: "success",
        title: "LAYOUT DIRESET",
        message: "Urutan section berhasil dikembalikan ke standar awal.",
      });
    }
  };

  // Count active sections
  const activeCount = sections.filter((s) => s.enabled).length;

  return (
    <div className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
      {/* Header bar */}
      <div className="flex flex-col justify-between gap-4 border-b-2 border-slate-900 pb-5 dark:border-white sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
            <Layers className="h-4 w-4" />
            <span>VISUAL LAYOUT BUILDER & CONTENT CMS</span>
          </div>
          <h3 className="mt-1 font-display text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white">
            Pengatur Urutan & Editor Kata-Kata Per Section
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-steel-400">
            Seret (drag) baris untuk mengubah tata letak posisi beranda. Klik tombol <strong>EDIT KATA-KATA</strong> pada tiap kartu section untuk mengubah teks judul, deskripsi, dan tombolnya secara langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold uppercase text-slate-800 dark:border-white dark:bg-dark-surface dark:text-steel-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{activeCount} / {sections.length} Tampil</span>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 border-2 border-slate-900 bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase text-slate-900 transition-colors hover:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:hover:bg-dark-void shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#FFFFFF]"
            title="Kembalikan layout ke urutan standar"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-700 dark:text-steel-300" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="mt-4 flex items-start gap-2.5 border border-brand-blue/30 bg-brand-blue/5 p-3 text-xs text-slate-700 dark:border-brand-cyan/30 dark:bg-brand-cyan/5 dark:text-steel-300 font-mono">
        <Sparkles className="h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-white">FITUR LENGKAP:</span> Klik tombol{" "}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-blue text-white font-bold text-[11px]">
            <Edit3 className="h-3 w-3" /> EDIT KATA-KATA
          </span>{" "}
          pada section mana pun untuk membuka formulir pengeditan teks judul, subjudul, dan tombol. Jangan lupa klik <strong>SIMPAN SEMUA PERUBAHAN</strong> di kanan atas setelah selesai mengedit!
        </div>
      </div>

      {/* Drag & Drop Reorderable List */}
      <div className="mt-6 space-y-3">
        {sections.map((section, index) => {
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;
          const isFirst = index === 0;
          const isLast = index === sections.length - 1;
          const isExpanded = expandedSectionId === section.id;

          return (
            <div
              key={section.id}
              className={`border-2 transition-all duration-150 ${
                isDragging
                  ? "opacity-40 scale-[0.99] border-dashed border-brand-blue bg-blue-50/50 dark:border-brand-cyan dark:bg-dark-void"
                  : isOver
                  ? "border-brand-blue bg-blue-50 ring-2 ring-brand-blue dark:border-brand-cyan dark:bg-dark-void dark:ring-brand-cyan shadow-[4px_4px_0px_0px_#00F0FF]"
                  : section.enabled
                  ? isExpanded
                    ? "border-brand-blue bg-white shadow-[6px_6px_0px_0px_#0030FF] dark:border-brand-cyan dark:bg-dark-surface dark:shadow-[6px_6px_0px_0px_#00F0FF]"
                    : "border-slate-900 bg-white hover:border-brand-blue hover:shadow-[4px_4px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface dark:hover:border-brand-cyan dark:hover:shadow-[4px_4px_0px_0px_#00F0FF]"
                  : "border-slate-400 bg-slate-100 opacity-70 hover:opacity-90 dark:border-steel-700 dark:bg-dark-void"
              }`}
            >
              {/* Card Header Bar */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 select-none cursor-default"
              >
                {/* Left Column: Drag Handle, Number, Title & Subtitle */}
                <div className="flex items-start sm:items-center gap-3">
                  {/* Drag Grip Handle */}
                  <div
                    className="mt-0.5 sm:mt-0 flex h-9 w-9 shrink-0 cursor-grab active:cursor-grabbing items-center justify-center border-2 border-slate-900 bg-slate-100 hover:bg-brand-blue hover:text-white transition-colors dark:border-white dark:bg-dark-base dark:hover:bg-brand-cyan dark:hover:text-slate-900"
                    title="Klik dan seret untuk memindahkan urutan"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Sequence Number */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-slate-900 bg-brand-blue font-mono text-xs font-black text-white dark:border-white dark:bg-brand-cyan dark:text-slate-900 shadow-[2px_2px_0px_0px_#000000]">
                    #{String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Section Details */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-cyan">
                        [{section.badge}]
                      </span>
                      <span
                        className={`font-display text-sm sm:text-base font-black uppercase tracking-tight ${
                          section.enabled
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 line-through dark:text-steel-400"
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-steel-400 line-clamp-1">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Column: Edit Text Button, Quick Move Up/Down, & Visibility Toggle */}
                <div className="flex items-center justify-end gap-2 border-t pt-2 sm:border-t-0 sm:pt-0 border-slate-200 dark:border-dark-border">
                  {/* EDIT KATA-KATA BUTTON */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSectionId(isExpanded ? null : section.id)
                    }
                    className={`flex h-8 items-center gap-1.5 border-2 px-3 font-mono text-xs font-bold transition-all ${
                      isExpanded
                        ? "border-brand-blue bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000] dark:border-brand-cyan dark:bg-brand-cyan dark:text-slate-950"
                        : "border-slate-900 bg-slate-50 text-slate-900 hover:bg-brand-blue hover:text-white dark:border-white dark:bg-dark-base dark:text-white dark:hover:bg-brand-cyan dark:hover:text-slate-950 shadow-[2px_2px_0px_0px_#000]"
                    }`}
                    title="Ubah teks, judul, subjudul, dan tombol section ini"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>{isExpanded ? "Tutup Editor" : "Edit Kata-Kata"}</span>
                  </button>

                  {/* Move Up Button */}
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMove(index, "up")}
                    className="flex h-8 w-8 items-center justify-center border-2 border-slate-900 bg-slate-50 transition-colors hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-50 dark:border-white dark:bg-dark-base dark:hover:bg-dark-void"
                    title="Pindahkan ke atas"
                  >
                    <ChevronUp className="h-4 w-4 text-slate-800 dark:text-white" />
                  </button>

                  {/* Move Down Button */}
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMove(index, "down")}
                    className="flex h-8 w-8 items-center justify-center border-2 border-slate-900 bg-slate-50 transition-colors hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-50 dark:border-white dark:bg-dark-base dark:hover:bg-dark-void"
                    title="Pindahkan ke bawah"
                  >
                    <ChevronDown className="h-4 w-4 text-slate-800 dark:text-white" />
                  </button>

                  {/* Show / Hide Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(index)}
                    className={`flex h-8 items-center gap-1.5 border-2 px-2.5 font-mono text-xs font-bold transition-all ${
                      section.enabled
                        ? "border-slate-900 bg-white text-slate-900 hover:bg-slate-100 dark:border-white dark:bg-dark-base dark:text-white dark:hover:bg-dark-void"
                        : "border-slate-900 bg-rose-500 text-white hover:bg-rose-600 dark:border-white"
                    }`}
                    title={
                      section.enabled
                        ? "Sembunyikan section ini"
                        : "Tampilkan section ini"
                    }
                  >
                    {section.enabled ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                        <span className="hidden sm:inline">Aktif</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Nonaktif</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* EXPANDABLE SECTION COPY EDITOR */}
              {isExpanded && (
                <div className="border-t-2 border-slate-900 bg-slate-50 p-4 sm:p-6 dark:border-white dark:bg-dark-void">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-3 dark:border-dark-border">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-brand-blue dark:text-brand-cyan">
                      <Type className="h-4 w-4" />
                      <span>Formulir Pengeditan Kata-Kata // {section.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedSectionId(null)}
                      className="text-xs font-mono font-bold text-slate-500 hover:text-slate-900 dark:text-steel-400 dark:hover:text-white"
                    >
                      [TUTUP]
                    </button>
                  </div>

                  {/* 1. HERO SECTION FORM */}
                  {section.id === "hero" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Sticker Tag / Badge Kecil Atas
                        </label>
                        <input
                          type="text"
                          value={homeContent.heroSticker ?? DEFAULT_HOME_CONTENT.heroSticker}
                          onChange={(e) => updateField("heroSticker", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-brand-blue dark:border-white dark:bg-dark-surface dark:text-brand-cyan"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                            Judul Baris 1 (Besar)
                          </label>
                          <input
                            type="text"
                            value={homeContent.heroTitleLine1 ?? DEFAULT_HOME_CONTENT.heroTitleLine1}
                            onChange={(e) => updateField("heroTitleLine1", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                            Judul Baris 2 (Outline)
                          </label>
                          <input
                            type="text"
                            value={homeContent.heroTitleLine2 ?? DEFAULT_HOME_CONTENT.heroTitleLine2}
                            onChange={(e) => updateField("heroTitleLine2", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                            Judul Baris 3 (Highlight Biru)
                          </label>
                          <input
                            type="text"
                            value={homeContent.heroTitleLine3 ?? DEFAULT_HOME_CONTENT.heroTitleLine3}
                            onChange={(e) => updateField("heroTitleLine3", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Paragraf Pengantar Hero
                        </label>
                        <textarea
                          rows={3}
                          value={homeContent.heroDescription ?? DEFAULT_HOME_CONTENT.heroDescription}
                          onChange={(e) => updateField("heroDescription", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed text-slate-900 dark:border-white dark:bg-dark-surface dark:text-steel-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                            Teks Tombol Utama (Primer)
                          </label>
                          <input
                            type="text"
                            value={homeContent.heroPrimaryBtn ?? DEFAULT_HOME_CONTENT.heroPrimaryBtn}
                            onChange={(e) => updateField("heroPrimaryBtn", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                            Teks Tombol Kedua (Kenalan)
                          </label>
                          <input
                            type="text"
                            value={homeContent.heroSecondaryBtn ?? DEFAULT_HOME_CONTENT.heroSecondaryBtn}
                            onChange={(e) => updateField("heroSecondaryBtn", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. TOURNAMENT SECTION NOTICE */}
                  {section.id === "tournament" && (
                    <div className="mt-4 flex items-start gap-3 border-2 border-amber-500 bg-amber-50 p-4 font-mono text-xs text-amber-900 dark:border-amber-400 dark:bg-amber-950/30 dark:text-amber-200">
                      <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <strong className="block font-bold">INFO PENGELOLAAN TURNAMEN:</strong>
                        Seluruh judul turnamen, lembar fase, bagan match, poin kalkulator PMWC, dan status live turnamen dikelola secara mendalam dan realtime pada <strong>Tab "07. Turnamen Live & PUBGM"</strong>.
                      </div>
                    </div>
                  )}

                  {/* 3. MOTTO SECTION FORM */}
                  {section.id === "motto" && (
                    <div className="mt-4 space-y-4">
                      {/* Kartu 1 */}
                      <div className="border-2 border-slate-900 p-3 bg-white dark:border-white dark:bg-dark-surface">
                        <span className="font-mono text-xs font-bold text-brand-blue uppercase dark:text-brand-cyan">
                          [ KARTU 1: FILOSOFI KAMI ]
                        </span>
                        <input
                          type="text"
                          value={homeContent.filosofiTitle ?? DEFAULT_HOME_CONTENT.filosofiTitle}
                          onChange={(e) => updateField("filosofiTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-sm font-bold text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
                        />
                        <textarea
                          rows={2}
                          value={homeContent.filosofiText ?? DEFAULT_HOME_CONTENT.filosofiText}
                          onChange={(e) => updateField("filosofiText", e.target.value)}
                          className="mt-2 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-base dark:text-steel-200"
                        />
                      </div>

                      {/* Kartu 2 */}
                      <div className="border-2 border-slate-900 p-3 bg-white dark:border-white dark:bg-dark-surface">
                        <span className="font-mono text-xs font-bold text-brand-blue uppercase dark:text-brand-cyan">
                          [ KARTU 2: AKAR REGIONAL ]
                        </span>
                        <input
                          type="text"
                          value={homeContent.regionalTitle ?? DEFAULT_HOME_CONTENT.regionalTitle}
                          onChange={(e) => updateField("regionalTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-sm font-bold text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
                        />
                        <textarea
                          rows={2}
                          value={homeContent.regionalText ?? DEFAULT_HOME_CONTENT.regionalText}
                          onChange={(e) => updateField("regionalText", e.target.value)}
                          className="mt-2 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-base dark:text-steel-200"
                        />
                      </div>

                      {/* Kartu 3 */}
                      <div className="border-2 border-slate-900 p-3 bg-white dark:border-white dark:bg-dark-surface">
                        <span className="font-mono text-xs font-bold text-amber-500 uppercase">
                          [ KARTU 3: SOLIDARITAS KOMUNITAS ]
                        </span>
                        <input
                          type="text"
                          value={homeContent.solidaritasTitle ?? DEFAULT_HOME_CONTENT.solidaritasTitle}
                          onChange={(e) => updateField("solidaritasTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-sm font-bold text-slate-900 dark:border-white dark:bg-dark-base dark:text-white"
                        />
                        <textarea
                          rows={2}
                          value={homeContent.solidaritasText ?? DEFAULT_HOME_CONTENT.solidaritasText}
                          onChange={(e) => updateField("solidaritasText", e.target.value)}
                          className="mt-2 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-base dark:text-steel-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. DIVISIONS SECTION FORM */}
                  {section.id === "divisions" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Badge Tag Kecil
                        </label>
                        <input
                          type="text"
                          value={homeContent.divisionsBadge ?? DEFAULT_HOME_CONTENT.divisionsBadge}
                          onChange={(e) => updateField("divisionsBadge", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-brand-blue dark:border-white dark:bg-dark-surface dark:text-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Judul Besar Section Divisi
                        </label>
                        <input
                          type="text"
                          value={homeContent.divisionsTitle ?? DEFAULT_HOME_CONTENT.divisionsTitle}
                          onChange={(e) => updateField("divisionsTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Deskripsi Paragraf
                        </label>
                        <textarea
                          rows={2}
                          value={homeContent.divisionsSubtitle ?? DEFAULT_HOME_CONTENT.divisionsSubtitle}
                          onChange={(e) => updateField("divisionsSubtitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-surface dark:text-steel-200"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Teks Tombol Aksi
                        </label>
                        <input
                          type="text"
                          value={homeContent.divisionsBtn ?? DEFAULT_HOME_CONTENT.divisionsBtn}
                          onChange={(e) => updateField("divisionsBtn", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. FOUNDER SECTION FORM */}
                  {section.id === "founder" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Index Label / Badge
                        </label>
                        <input
                          type="text"
                          value={homeContent.founderBadge ?? DEFAULT_HOME_CONTENT.founderBadge}
                          onChange={(e) => updateField("founderBadge", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-brand-blue dark:border-white dark:bg-dark-surface dark:text-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Judul Besar Section Founder
                        </label>
                        <input
                          type="text"
                          value={homeContent.founderTitle ?? DEFAULT_HOME_CONTENT.founderTitle}
                          onChange={(e) => updateField("founderTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Subjudul / Keterangan Singkat
                        </label>
                        <textarea
                          rows={2}
                          value={homeContent.founderSubtitle ?? DEFAULT_HOME_CONTENT.founderSubtitle}
                          onChange={(e) => updateField("founderSubtitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-surface dark:text-steel-200"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-steel-400">
                        <Info className="h-3.5 w-3.5" />
                        <span>Kutipan dan Visi Founder dapat juga dikelola pada Tab <strong>02. Quotes & Visi</strong>.</span>
                      </div>
                    </div>
                  )}

                  {/* 6. ACTIVITIES SECTION FORM */}
                  {section.id === "activities" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Badge Tag
                        </label>
                        <input
                          type="text"
                          value={homeContent.activitiesBadge ?? DEFAULT_HOME_CONTENT.activitiesBadge}
                          onChange={(e) => updateField("activitiesBadge", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-brand-blue dark:border-white dark:bg-dark-surface dark:text-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Judul Besar Section Kegiatan
                        </label>
                        <input
                          type="text"
                          value={homeContent.activitiesTitle ?? DEFAULT_HOME_CONTENT.activitiesTitle}
                          onChange={(e) => updateField("activitiesTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Teks Tombol Lihat Semua
                        </label>
                        <input
                          type="text"
                          value={homeContent.activitiesBtn ?? DEFAULT_HOME_CONTENT.activitiesBtn}
                          onChange={(e) => updateField("activitiesBtn", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-steel-400">
                        <Info className="h-3.5 w-3.5" />
                        <span>Foto dan rincian agenda acara dapat ditambah & diubah pada Tab <strong>04. Events & Galeri</strong>.</span>
                      </div>
                    </div>
                  )}

                  {/* 7. ROSTER SECTION FORM */}
                  {section.id === "roster" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Badge Tag Realtime
                        </label>
                        <input
                          type="text"
                          value={homeContent.rosterBadge ?? DEFAULT_HOME_CONTENT.rosterBadge}
                          onChange={(e) => updateField("rosterBadge", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-brand-blue dark:border-white dark:bg-dark-surface dark:text-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Judul Besar Section Roster
                        </label>
                        <input
                          type="text"
                          value={homeContent.rosterTitle ?? DEFAULT_HOME_CONTENT.rosterTitle}
                          onChange={(e) => updateField("rosterTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Deskripsi Subjudul
                        </label>
                        <textarea
                          rows={2}
                          value={homeContent.rosterSubtitle ?? DEFAULT_HOME_CONTENT.rosterSubtitle}
                          onChange={(e) => updateField("rosterSubtitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-surface dark:text-steel-200"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-steel-400">
                        <Info className="h-3.5 w-3.5" />
                        <span>Data dan verifikasi kartu member dikelola pada Tab <strong>06. Verifikasi Member</strong>.</span>
                      </div>
                    </div>
                  )}

                  {/* 8. CTA SECTION FORM */}
                  {section.id === "cta" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Badge Tag
                        </label>
                        <input
                          type="text"
                          value={homeContent.ctaBadge ?? DEFAULT_HOME_CONTENT.ctaBadge}
                          onChange={(e) => updateField("ctaBadge", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-brand-blue dark:border-white dark:bg-dark-surface dark:text-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Judul Utama Banner Ajakan
                        </label>
                        <input
                          type="text"
                          value={homeContent.ctaTitle ?? DEFAULT_HOME_CONTENT.ctaTitle}
                          onChange={(e) => updateField("ctaTitle", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 font-display text-base font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                          Deskripsi Paragraf
                        </label>
                        <textarea
                          rows={3}
                          value={homeContent.ctaDescription ?? DEFAULT_HOME_CONTENT.ctaDescription}
                          onChange={(e) => updateField("ctaDescription", e.target.value)}
                          className="mt-1 w-full border-2 border-slate-900 p-2 text-xs leading-relaxed dark:border-white dark:bg-dark-surface dark:text-steel-200"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                            Teks Tombol Pendaftaran
                          </label>
                          <input
                            type="text"
                            value={homeContent.ctaPrimaryBtn ?? DEFAULT_HOME_CONTENT.ctaPrimaryBtn}
                            onChange={(e) => updateField("ctaPrimaryBtn", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
                            Teks Tombol WhatsApp
                          </label>
                          <input
                            type="text"
                            value={homeContent.ctaSecondaryBtn ?? DEFAULT_HOME_CONTENT.ctaSecondaryBtn}
                            onChange={(e) => updateField("ctaSecondaryBtn", e.target.value)}
                            className="mt-1 w-full border-2 border-slate-900 p-2 font-mono text-xs font-bold text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mini Ladder / Visual Layout Pipeline */}
      <div className="mt-8 border-t-2 border-slate-900 pt-5 dark:border-white">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
          <HelpCircle className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
          <span>Alur Urutan Halaman Beranda (Dari Atas ke Bawah):</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {sections.map((sec, idx) => (
            <React.Fragment key={sec.id}>
              <div
                className={`flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-bold uppercase ${
                  sec.enabled
                    ? "border-slate-900 bg-slate-100 text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
                    : "border-dashed border-slate-400 bg-slate-50 text-slate-400 line-through dark:border-steel-700 dark:bg-dark-void"
                }`}
              >
                <span className="text-brand-blue dark:text-brand-cyan">#{idx + 1}</span>
                <span>{sec.id}</span>
              </div>
              {idx < sections.length - 1 && (
                <span className="font-mono text-xs text-slate-400">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
