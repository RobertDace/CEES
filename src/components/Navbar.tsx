"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight, ShieldCheck, Sliders, Gamepad2, User, LogIn } from "lucide-react";
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
  { name: "Market", href: "/market", code: "05" },
  { name: "Let's Join Us!", href: "/join", code: "06" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
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

  // Global Shortcut: Ctrl + Shift + A atau Ctrl + Alt + L untuk membuka Terminal Login Staf
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        router.push("/login");
      }
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "L" || e.key === "l")) {
        e.preventDefault();
        router.push("/login");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="relative flex shrink-0 items-center">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5 sm:gap-3 select-none"
            aria-label="CEES AREA — Beranda (Klik 3x untuk Akses Admin)"
          >
            <BrandLogo width={120} height={42} priority className="h-8 w-auto max-h-9 sm:h-9" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-slate-900 transition-colors group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan whitespace-nowrap">
                CEES AREA
              </span>
              <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-steel-400 hidden sm:block whitespace-nowrap">
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
        <nav aria-label="Navigasi utama" className="hidden items-stretch lg:flex lg:gap-0.5 xl:gap-1.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-baseline gap-1 px-2 py-2 font-display text-[13px] xl:px-3 xl:text-[14px] 2xl:text-[15px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${
                  active
                    ? "text-brand-blue dark:text-brand-cyan"
                    : "text-slate-800 hover:text-brand-blue dark:text-steel-200 dark:hover:text-white"
                }`}
              >
                <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-steel-500 shrink-0">{link.code}</span>
                <span className="whitespace-nowrap">{link.name}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-2 xl:inset-x-3 bottom-0 h-[3px] bg-brand-blue transition-transform duration-150 origin-left dark:bg-brand-cyan ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Action Area */}
        <div className="hidden shrink-0 items-center gap-2.5 xl:gap-3 lg:flex">
          <ThemeToggle />
          {user ? (
            user.role === "admin" ? (
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
                  className="brutal-btn flex items-center gap-2 border-2 border-slate-900 bg-brand-cyan px-3.5 py-2 text-xs font-bold text-slate-900 shadow-[4px_4px_0px_0px_#0030FF] hover:bg-white hover:text-slate-900 dark:border-white dark:bg-brand-cyan dark:text-slate-900 dark:hover:bg-white whitespace-nowrap"
                  title="Akses CMS & Editor Halaman Web"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Admin Tools</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <>
                {/* Member Active Session Tag */}
                <Link
                  href="/member"
                  className="flex items-center gap-1.5 border-2 border-slate-900 bg-brand-cyan/20 px-2.5 py-2 font-mono text-xs font-bold text-slate-800 transition-colors hover:bg-brand-cyan hover:text-slate-900 dark:border-white dark:bg-dark-surface dark:text-steel-200 dark:hover:bg-brand-cyan dark:hover:text-slate-900"
                  title="Kartu Member & Profil"
                >
                  <Gamepad2 className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                  <span className="max-w-[95px] truncate uppercase">{user.gameNickname || user.displayName}</span>
                </Link>

                {/* Member Hub Corner Button */}
                <Link
                  href="/member"
                  className="brutal-btn flex items-center gap-2 border-2 border-slate-900 bg-brand-cyan px-3.5 py-2 text-xs font-bold text-slate-900 shadow-[4px_4px_0px_0px_#0030FF] hover:bg-white hover:text-slate-900 dark:border-white dark:bg-brand-cyan dark:text-slate-900 dark:hover:bg-white whitespace-nowrap"
                  title="Kartu Tanda Anggota & Profil"
                >
                  <User className="h-4 w-4" />
                  <span>Kartu Member</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )
          ) : (
            <div className="flex items-center gap-2">
              {/* Tombol Sign In */}
              <Link
                href="/login"
                className="flex items-center gap-1.5 border-2 border-slate-900 bg-white px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 transition-all dark:border-white dark:bg-dark-surface dark:text-white dark:shadow-[2px_2px_0px_0px_#FFFFFF] dark:hover:bg-dark-void whitespace-nowrap"
                title="Masuk ke Portal Member atau Staf"
              >
                <LogIn className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                <span>Sign In</span>
              </Link>

              {/* Default Corner Button: Join Member */}
              <Link href="/join" className="brutal-btn px-4 py-2 text-xs whitespace-nowrap">
                <span>Join Member</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
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
        <div className="border-t-2 border-slate-900 bg-white dark:border-white dark:bg-dark-base lg:hidden">
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
                    <span className="whitespace-nowrap">{link.name}</span>
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
                  href={user.role === "admin" ? "/admin" : "/member"}
                  className="flex items-center justify-between border-2 border-slate-900 bg-brand-cyan p-3 font-display text-sm font-bold uppercase text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] dark:border-white dark:bg-brand-cyan dark:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    {user.role === "admin" ? <Sliders className="h-4 w-4" /> : <Gamepad2 className="h-4 w-4" />}
                    <span>{user.role === "admin" ? "BUKA ADMIN TOOLS" : "BUKA KARTU MEMBER"}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-steel-300 px-1">
                  <span className="flex items-center gap-1.5">
                    {user.role === "admin" ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                    ) : (
                      <Gamepad2 className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan" />
                    )}
                    <span>
                      {user.role === "admin" ? "ADMIN" : "MEMBER"}: {user.gameNickname || user.displayName}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      window.location.href = "/";
                    }}
                    className="text-brand-blue underline dark:text-brand-cyan cursor-pointer font-bold"
                    title="Keluar Akun dan Kembali ke Beranda"
                  >
                    [ LOGOUT ]
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 border-2 border-slate-900 bg-white py-3 text-sm font-display font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white dark:shadow-[3px_3px_0px_0px_#FFFFFF]"
                >
                  <LogIn className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
                  <span>SIGN IN / MASUK PORTAL</span>
                </Link>
                <Link
                  href="/join"
                  className="brutal-btn flex items-center justify-center gap-2 py-3 text-sm"
                >
                  <span>JOIN MEMBER SEKARANG</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
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
