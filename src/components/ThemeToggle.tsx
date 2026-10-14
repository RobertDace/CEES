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
    `px-2 py-1 transition-colors duration-150 ${
      active
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
        : "text-slate-500 hover:text-slate-900 dark:text-steel-400 dark:hover:text-white"
    }`;

  return (
    <div
      role="group"
      aria-label="Pilih tema tampilan"
      className={`inline-flex items-stretch border-2 border-slate-900 bg-white font-mono text-[10px] font-bold uppercase tracking-wider dark:border-white dark:bg-dark-surface ${className}`}
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
