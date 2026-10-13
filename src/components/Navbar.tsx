"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, MapPin } from "lucide-react";
import { COMMUNITY_INFO } from "@/data/community";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

// Authentic navigation links matching the original CEES AREA website
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Activity", href: "/activities" },
  { name: "E-Sport Flash", href: "/news" },
  { name: "Let's Join Us!", href: "/join" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-slate-900 bg-white/95 backdrop-blur-md transition-colors duration-200 dark:border-white dark:bg-dark-base/90">
      {/* Top Telemetry & Origin Bar */}
      <div className="hidden border-b-2 border-slate-900 bg-slate-100 px-4 py-1 text-xs text-slate-700 dark:border-dark-border dark:bg-dark-void dark:text-steel-400 sm:flex sm:items-center sm:justify-between font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 font-bold text-brand-blue dark:text-brand-cyan">
            <MapPin className="h-3.5 w-3.5" />
            <span>SAMARINDA, KALTIM</span>
          </span>
          <span className="text-slate-400 dark:text-dark-border">/</span>
          <span>EST. {COMMUNITY_INFO.establishedDate.toUpperCase()}</span>
          <span className="text-slate-400 dark:text-dark-border">/</span>
          <span className="font-bold text-slate-900 dark:text-white">
            MOTTO: &quot;{COMMUNITY_INFO.tagline}&quot;
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            MEMBERS: <strong className="font-bold text-brand-blue dark:text-white">90+ ACTIVE</strong>
          </span>
          <span className="text-slate-400 dark:text-dark-border">/</span>
          <span>
            SPONSOR: <strong className="text-slate-900 dark:text-white">PAWPAW SAMARINDA</strong>
          </span>
        </div>
      </div>

      {/* Main Brutalist Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand Logo with strict bounding height */}
        <Link href="/" className="group flex items-center space-x-3">
          <BrandLogo width={120} height={42} priority className="h-8 sm:h-9 w-auto max-h-9" />
          <div className="flex flex-col">
            <span className="font-display text-xl font-black tracking-wider text-slate-900 transition-colors group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan">
              CEES AREA
            </span>
            <span className="font-mono text-[10px] font-bold tracking-widest text-brand-blue dark:text-brand-cyan uppercase">
              SAMARINDA ESPORTS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center space-x-2 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3.5 py-1.5 font-display text-sm font-bold tracking-wider uppercase transition-all rounded-none ${
                  isActive
                    ? "border-2 border-slate-900 bg-brand-blue text-white shadow-[2px_2px_0px_0px_#0F172A] dark:border-white dark:shadow-[2px_2px_0px_0px_#FFFFFF]"
                    : "border-2 border-transparent text-slate-800 hover:border-slate-900 hover:bg-slate-100 hover:shadow-[2px_2px_0px_0px_#0030FF] dark:text-steel-200 dark:hover:border-white dark:hover:bg-dark-surface dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & CTA Actions */}
        <div className="hidden items-center space-x-3 md:flex">
          <ThemeToggle />

          <Link
            href="/join"
            className="brutal-btn flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-none"
          >
            <span>JOIN MEMBER</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-2 border-slate-900 bg-white p-2 text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface dark:text-white"
            aria-label="Buka Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-brand-blue dark:text-brand-cyan" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b-2 border-slate-900 bg-white px-4 pt-3 pb-6 dark:border-white dark:bg-dark-base md:hidden">
          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between border-2 p-3 font-display text-sm font-bold tracking-wider uppercase rounded-none ${
                    isActive
                      ? "border-slate-900 bg-brand-blue text-white shadow-[3px_3px_0px_0px_#0F172A] dark:border-white"
                      : "border-slate-900 bg-slate-50 text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] dark:border-dark-border dark:bg-dark-surface dark:text-white"
                  }`}
                >
                  <span>{link.name}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </Link>
              );
            })}
          </div>

          <div className="mt-5 border-t-2 border-slate-900 pt-4 dark:border-dark-border font-mono">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-steel-400">
              <span>MOTTO:</span>
              <span className="font-bold text-brand-blue dark:text-brand-cyan">
                {COMMUNITY_INFO.tagline}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={COMMUNITY_INFO.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex-1 border-2 border-slate-900 bg-slate-50 py-2 text-center font-display text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface dark:text-white"
              >
                WHATSAPP
              </a>
              <a
                href={COMMUNITY_INFO.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex-1 border-2 border-slate-900 bg-slate-50 py-2 text-center font-display text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface dark:text-white"
              >
                INSTAGRAM
              </a>
              <a
                href={COMMUNITY_INFO.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                className="flex-1 border-2 border-slate-900 bg-slate-50 py-2 text-center font-display text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface dark:text-white"
              >
                TIKTOK
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Brand Accent Bottom Stripe */}
      <div className="h-1 w-full bg-brand-blue" />
    </header>
  );
}
