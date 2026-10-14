"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight, ShieldCheck, Sliders } from "lucide-react";
import { COMMUNITY_INFO } from "@/data/community";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

// Authentic navigation links matching the original CEES AREA website
const NAV_LINKS = [
  { name: "Home", href: "/", code: "01" },
  { name: "About Us", href: "/about", code: "02" },
  { name: "Our Activity", href: "/activities", code: "03" },
  { name: "E-Sport Flash", href: "/news", code: "04" },
  { name: "Let's Join Us!", href: "/join", code: "05" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Easter egg: Click CEES logo 3x to redirect to Admin Terminal (/login)
  const handleLogoClick = (e: React.MouseEvent) => {
    const nextClicks = secretClicks + 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (nextClicks >= 3) {
      e.preventDefault();
      e.stopPropagation();
      setSecretClicks(0);
      router.push("/login");
      return;
    }

    setSecretClicks(nextClicks);
    clickTimerRef.current = setTimeout(() => {
      setSecretClicks(0);
    }, 1500);
  };

  // Close the mobile sheet whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-slate-900 bg-white transition-colors duration-200 dark:border-white dark:bg-dark-base">
      {/* Top info strip */}
      <div className="hidden border-b-2 border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-dark-void sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="text-brand-cyan">SMD / KALTIM</span>
            <span className="text-white/40">EST. {COMMUNITY_INFO.establishedDate.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{COMMUNITY_INFO.totalMembers}+ member aktif</span>
            <span className="text-white/40">/</span>
            <span>
              Supported by <span className="text-brand-cyan">PAWPAW Samarinda</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <div className="relative flex items-center">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-3 select-none"
            aria-label="CEES AREA — Beranda (Klik 3x untuk Akses Admin)"
          >
            <BrandLogo width={120} height={42} priority className="h-8 w-auto max-h-9 sm:h-9" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold tracking-wide text-slate-900 transition-colors group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan">
                CEES AREA
              </span>
              <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-steel-400">
                {COMMUNITY_INFO.tagline}
              </span>
            </div>
          </Link>
          {/* Subtle secret clicks indicator for easter egg */}
          {secretClicks > 0 && (
            <span className="absolute -top-1.5 -right-5 flex items-center gap-0.5 rounded-none border border-slate-900 bg-brand-cyan px-1 py-0.5 font-mono text-[8px] font-black tracking-tighter text-slate-900 shadow-[1px_1px_0px_0px_#0030FF] animate-pulse">
              [{secretClicks}/3]
            </span>
          )}
        </div>

        {/* Desktop navigation */}
        <nav aria-label="Navigasi utama" className="hidden items-stretch md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-baseline gap-1.5 px-3 py-2 font-display text-[15px] font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? "text-brand-blue dark:text-brand-cyan"
                    : "text-slate-800 hover:text-brand-blue dark:text-steel-200 dark:hover:text-white"
                }`}
              >
                <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-steel-500">{link.code}</span>
                <span>{link.name}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-3 bottom-0 h-[3px] bg-brand-blue transition-transform duration-150 origin-left dark:bg-brand-cyan ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Action Area */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              {/* Operator Active Session Tag */}
              <Link
                href="/login"
                className="flex items-center gap-1.5 border-2 border-slate-900 bg-slate-100 px-2.5 py-2 font-mono text-xs font-bold text-slate-800 transition-colors hover:bg-slate-900 hover:text-white dark:border-white dark:bg-dark-surface dark:text-steel-200 dark:hover:bg-white dark:hover:text-slate-900"
                title="Sesi Pengurus: Buka Terminal / Logout"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                <span className="max-w-[85px] truncate uppercase">{user.displayName || "ADMIN"}</span>
              </Link>

              {/* Dynamic Corner Button: Admin Tools */}
              <Link
                href="/admin"
                className="brutal-btn flex items-center gap-2 border-2 border-slate-900 bg-brand-cyan px-4 py-2 text-xs font-bold text-slate-900 shadow-[4px_4px_0px_0px_#0030FF] hover:bg-white hover:text-slate-900 dark:border-white dark:bg-brand-cyan dark:text-slate-900 dark:hover:bg-white"
                title="Akses CMS & Editor Halaman Web"
              >
                <Sliders className="h-4 w-4" />
                <span>Admin Tools</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            /* Default Corner Button: Join Member */
            <Link href="/join" className="brutal-btn px-4 py-2 text-xs">
              <span>Join Member</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="border-2 border-slate-900 bg-white p-2 text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileMenuOpen && (
        <div className="border-t-2 border-slate-900 bg-white dark:border-white dark:bg-dark-base md:hidden">
          <nav aria-label="Navigasi mobile" className="flex flex-col">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between border-b-2 border-slate-900 px-4 py-4 font-display text-2xl font-bold uppercase dark:border-white ${
                    active ? "bg-brand-blue text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  <span className="flex items-baseline gap-3">
                    <span className={`font-mono text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{link.code}</span>
                    {link.name}
                  </span>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              );
            })}
          </nav>

          {/* Action Area (Mobile) */}
          <div className="border-b-2 border-slate-900 bg-slate-50 p-4 dark:border-white dark:bg-dark-surface">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/admin"
                  className="flex items-center justify-between border-2 border-slate-900 bg-brand-cyan p-3 font-display text-sm font-bold uppercase text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] dark:border-white dark:bg-brand-cyan dark:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span>BUKA ADMIN TOOLS</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-steel-300 px-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                    <span>SESI: {user.displayName}</span>
                  </span>
                  <Link href="/login" className="text-brand-blue underline dark:text-brand-cyan">
                    [ TERMINAL / LOGOUT ]
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                href="/join"
                className="brutal-btn flex items-center justify-center gap-2 py-3 text-sm"
              >
                <span>JOIN MEMBER SEKARANG</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 font-mono text-[11px] font-bold uppercase">
            {[
              { label: "WhatsApp", href: COMMUNITY_INFO.socials.whatsapp },
              { label: "Instagram", href: COMMUNITY_INFO.socials.instagram },
              { label: "TikTok", href: COMMUNITY_INFO.socials.tiktok },
            ].map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={`py-3 text-center text-slate-900 hover:bg-slate-900 hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900 ${
                  i > 0 ? "border-l-2 border-slate-900 dark:border-white" : ""
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
