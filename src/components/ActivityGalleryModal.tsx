"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images, ZoomIn } from "lucide-react";

interface ActivityGalleryModalProps {
  title: string;
  subtitle: string;
  photos: string[];
}

export default function ActivityGalleryModal({
  title,
  subtitle,
  photos,
}: ActivityGalleryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, photos.length]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="mt-6 border-t-2 border-slate-200 pt-5 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-600 dark:text-steel-400">
          <Images className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
          <span>ARSIP DOKUMENTASI LENGKAP ({photos.length} FOTO)</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setCurrentIndex(0);
            setIsOpen(true);
          }}
          className="inline-flex items-center space-x-2 border-2 border-slate-900 bg-brand-blue px-3.5 py-1.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_0px_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-white dark:bg-brand-blue dark:shadow-[2px_2px_0px_0px_#FFFFFF]"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          <span>Lihat Galeri Foto</span>
        </button>
      </div>

      {/* Thumbnail Bar */}
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {photos.slice(0, 8).map((photo, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setCurrentIndex(idx);
              setIsOpen(true);
            }}
            className="group relative aspect-square overflow-hidden border-2 border-slate-900 bg-slate-950 transition-all hover:scale-105 dark:border-slate-700"
          >
            <Image
              src={photo}
              alt={`${title} foto ${idx + 1}`}
              fill
              className="object-cover transition-opacity group-hover:opacity-80"
              sizes="120px"
            />
            {idx === 7 && photos.length > 8 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 font-mono text-xs font-black text-white">
                +{photos.length - 8}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 border-2 border-white bg-slate-900 p-2 text-white shadow-[2px_2px_0px_0px_#0030FF] transition-transform hover:scale-110"
            aria-label="Tutup galeri"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Modal Header */}
          <div className="absolute top-4 left-4 z-40 max-w-md border-2 border-slate-900 bg-white/95 px-4 py-2 font-mono shadow-[3px_3px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface">
            <h3 className="font-display text-sm font-black uppercase text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-[11px] font-bold text-brand-blue dark:text-brand-cyan">
              {subtitle} • Foto {currentIndex + 1} dari {photos.length}
            </p>
          </div>

          {/* Main Photo View */}
          <div className="relative flex h-[75vh] w-full max-w-5xl items-center justify-center">
            <div className="relative h-full w-full">
              <Image
                src={photos[currentIndex]}
                alt={`${title} - Foto ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Prev Button */}
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 border-2 border-white bg-slate-900/80 p-3 text-white transition-all hover:scale-110 hover:bg-brand-blue"
              aria-label="Foto Sebelumnya"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % photos.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 border-2 border-white bg-slate-900/80 p-3 text-white transition-all hover:scale-110 hover:bg-brand-blue"
              aria-label="Foto Selanjutnya"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Thumbnails */}
          <div className="absolute bottom-4 left-1/2 max-w-3xl -translate-x-1/2 overflow-x-auto px-4 py-2">
            <div className="flex space-x-2">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-14 w-14 flex-shrink-0 overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? "border-brand-cyan scale-110 shadow-[0_0_12px_#00F0FF]"
                      : "border-slate-700 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={p}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
