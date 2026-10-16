// src/components/MobileBottomNav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Trophy,
  Flame,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ceesAlert } from "@/lib/ceesAlert";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Route matcher
  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  // Dynamic 5th tab based on auth state
  const memberTab = user
    ? user.role === "admin"
      ? {
          name: "ADMIN",
          code: "05",
          href: "/admin",
          Icon: ShieldCheck,
          accent: "text-amber-400",
        }
      : {
          name: "PASSPORT",
          code: "05",
          href: "/member",
          Icon: CreditCard,
          accent: "text-brand-cyan",
        }
    : {
        name: "JOIN",
        code: "05",
        href: "/join",
        Icon: User,
        accent: "text-brand-cyan",
      };

  const TABS = [
    {
      name: "BERANDA",
      code: "01",
      href: "/",
      Icon: Home,
    },
    {
      name: "AGENDA",
      code: "02",
      href: "/activities",
      Icon: Trophy,
    },
    {
      name: "FLASH",
      code: "03",
      href: "/news",
      Icon: Flame,
    },
    {
      name: "MARKET",
      code: "04",
      href: "/market",
      Icon: ShoppingBag,
    },
    memberTab,
  ];

  const handleTabClick = () => {
    // Tactile audio feedback & haptic vibration if available
    ceesAlert.playClick();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(8);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t-3 border-slate-900 bg-white/95 dark:border-white dark:bg-dark-base/95 backdrop-blur-md shadow-[0px_-4px_0px_0px_#0030FF] pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5 px-2 select-none transition-colors"
    >
      <div className="grid grid-cols-5 gap-1 items-stretch max-w-lg mx-auto">
        {TABS.map((tab) => {
          const active = isTabActive(tab.href);
          const IconComp = tab.Icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={handleTabClick}
              aria-current={active ? "page" : undefined}
              className={`group flex flex-col items-center justify-center py-1.5 px-0.5 transition-all rounded-none text-center relative ${
                active
                  ? "border-2 border-slate-900 bg-brand-blue text-white shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-brand-cyan dark:text-slate-950 dark:shadow-[2px_2px_0px_0px_#0030FF]"
                  : "border-2 border-transparent text-slate-700 hover:text-slate-950 dark:text-steel-400 dark:hover:text-white active:scale-95"
              }`}
            >
              {/* Tactical Top Mini Indicator */}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-3 bg-amber-400 dark:bg-slate-950" />
              )}

              {/* Icon with micro animation */}
              <div className="relative">
                <IconComp
                  className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform ${
                    active ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
              </div>

              {/* Text Label in Tactical Monospace & Display */}
              <span
                className={`mt-1 font-mono text-[9px] sm:text-[10px] font-black tracking-wider uppercase leading-none truncate max-w-full ${
                  active
                    ? "text-white dark:text-slate-950"
                    : "text-slate-700 dark:text-steel-300"
                }`}
              >
                {tab.name}
              </span>

              {/* Mini Code index */}
              <span
                className={`text-[7px] font-mono font-bold leading-none mt-0.5 ${
                  active
                    ? "text-blue-200 dark:text-slate-800"
                    : "text-slate-400 dark:text-steel-500"
                }`}
              >
                [{tab.code}]
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
