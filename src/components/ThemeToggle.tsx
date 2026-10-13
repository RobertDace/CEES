"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-none border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_#0030FF] dark:border-white dark:bg-dark-surface ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-none border-2 transition-all duration-150 ${
        isDark
          ? "border-white bg-dark-surface text-amber-300 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-dark-base hover:text-amber-200"
          : "border-slate-900 bg-white text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-slate-50 hover:text-brand-blue"
      } ${className}`}
      aria-label={isDark ? "Aktifkan Mode Terang (Light Mode)" : "Aktifkan Mode Gelap (Dark Mode)"}
      title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
}
