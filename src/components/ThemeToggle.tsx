"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

/**
 * Segmented text switch instead of the generic sun/moon icon button.
 * Reads like a label on a streetwear hang-tag: TERANG / GELAP.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  const segment = (active: boolean) =>
    `flex items-center justify-center px-2 sm:px-2.5 transition-colors duration-150 leading-none select-none text-[10px] sm:text-[11px] ${
      active
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black"
        : "text-slate-600 hover:text-slate-900 dark:text-steel-400 dark:hover:text-white"
    }`;

  return (
    <div
      role="group"
      aria-label="Pilih tema tampilan"
      className={`inline-flex h-9 items-stretch border-2 border-slate-900 bg-white font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-dark-surface dark:shadow-[2px_2px_0px_0px_#FFFFFF] ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        className={segment(!isDark)}
      >
        Terang
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        className={`border-l-2 border-slate-900 dark:border-white ${segment(isDark)}`}
      >
        Gelap
      </button>
    </div>
  );
}
