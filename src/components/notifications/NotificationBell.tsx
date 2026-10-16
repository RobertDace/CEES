// src/components/notifications/NotificationBell.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  MessageCircle,
  CheckCheck,
  Radio,
  ExternalLink,
  ShieldCheck,
  X,
  Volume2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  AppNotification,
  fetchUserNotifications,
  markNotificationsRead,
  formatTimeAgo,
} from "@/lib/notifications/notificationHelper";
import { ceesAlert } from "@/lib/ceesAlert";

interface NotificationBellProps {
  className?: string;
  isMobileCompact?: boolean;
}

export default function NotificationBell({ className = "", isMobileCompact = false }: NotificationBellProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userId = user?.uid || user?.memberId || (user?.role === "admin" ? "admin_hq" : "");

  // Load notifikasi saat user terautentikasi
  const loadNotifications = async (silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      const data = await fetchUserNotifications(userId);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      // ignore
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    loadNotifications();

    // Auto-refresh interval (polling setiap 20 detik)
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 20000);

    const handleFocus = () => loadNotifications(true);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId]);

  // Handle klik di luar dropdown untuk menutup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    ceesAlert.playClick();
    if (!user) {
      ceesAlert.warning({
        title: "LOGIN DIPERLUKAN",
        message: "Silakan login sebagai member untuk menerima notifikasi like dan komentar secara real-time.",
      });
      return;
    }
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      loadNotifications(true);
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId || unreadCount === 0) return;
    ceesAlert.playClick();
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    await markNotificationsRead(userId, undefined, true);
    ceesAlert.toast({
      type: "success",
      title: "SEMUA TERBACA",
      message: "Seluruh notifikasi telah ditandai sudah dibaca.",
    });
  };

  const handleItemClick = async (notif: AppNotification) => {
    ceesAlert.playClick();
    if (!notif.read && userId) {
      // Mark as read
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationsRead(userId, notif.id, false);
    }

    setIsOpen(false);
    if (notif.targetUrl) {
      router.push(notif.targetUrl);
    }
  };

  const filteredNotifs = filter === "UNREAD" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Tombol Bell Icon Trigger */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`relative flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-white transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 dark:border-white dark:bg-dark-surface cursor-pointer select-none shrink-0 ${
          unreadCount > 0
            ? "shadow-[2px_2px_0px_0px_#FF0055] text-rose-600 dark:text-rose-400"
            : "shadow-[2px_2px_0px_0px_#000000] text-slate-800 hover:text-brand-blue dark:text-steel-200 dark:shadow-[2px_2px_0px_0px_#FFFFFF] dark:hover:text-brand-cyan"
        }`}
        aria-label={`Notifikasi Sosial (${unreadCount} belum dibaca)`}
        title={user ? `Radar Notifikasi: ${unreadCount} belum dibaca` : "Masuk untuk melihat notifikasi"}
      >
        <Bell className={`h-4.5 w-4.5 ${unreadCount > 0 ? "animate-[bounce_2s_infinite]" : ""}`} />

        {/* Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[19px] h-[19px] px-1 border-2 border-slate-900 bg-rose-600 font-mono text-[10px] font-black text-white shadow-[1px_1px_0px_0px_#000000] dark:border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[410px] max-w-[94vw] z-[60] border-3 border-slate-900 bg-white shadow-[8px_8px_0px_0px_#0030FF] transition-all duration-150 dark:border-white dark:bg-dark-base dark:shadow-[8px_8px_0px_0px_#00F0FF] animate-in fade-in zoom-in-95">
          {/* Header Strip */}
          <div className="border-b-2 border-slate-900 bg-slate-900 px-3.5 py-2.5 text-white dark:border-white dark:bg-dark-void">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="h-4 w-4 text-brand-cyan animate-pulse" />
                <span className="font-mono text-xs font-black uppercase tracking-wider text-brand-cyan">
                  RADAR // NOTIFIKASI
                </span>
                {unreadCount > 0 && (
                  <span className="bg-rose-600 px-1.5 py-0.2 font-mono text-[9px] font-black uppercase text-white">
                    {unreadCount} BARU
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white dark:text-steel-400 dark:hover:text-white"
                title="Tutup Notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 bg-slate-50 px-3 py-2 text-xs font-bold dark:border-white dark:bg-dark-surface">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1 font-mono text-[11px]">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-2 py-1 uppercase transition-colors ${
                  filter === "ALL"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black"
                    : "text-slate-600 hover:text-slate-900 dark:text-steel-400 dark:hover:text-white"
                }`}
              >
                SEMUA ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("UNREAD")}
                className={`px-2 py-1 uppercase transition-colors ${
                  filter === "UNREAD"
                    ? "bg-rose-600 text-white font-black"
                    : "text-slate-600 hover:text-rose-600 dark:text-steel-400 dark:hover:text-rose-400"
                }`}
              >
                BELUM DIBACA ({unreadCount})
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center space-x-1 font-mono text-[10px] font-bold text-brand-blue hover:underline dark:text-brand-cyan uppercase"
                title="Tandai semua sebagai sudah dibaca"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>BACA SEMUA</span>
              </button>
            )}
          </div>

          {/* Notifications Feed */}
          <div className="max-h-[380px] overflow-y-auto divide-y-2 divide-slate-100 dark:divide-dark-surface/60">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-slate-500 dark:text-steel-400">
                <div className="inline-block h-5 w-5 animate-spin border-2 border-brand-blue border-t-transparent dark:border-brand-cyan mb-2" />
                <p>MEMINDAI RADAR AKTIVITAS...</p>
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border-2 border-slate-900 bg-slate-100 dark:border-white dark:bg-dark-surface">
                  <Bell className="h-5 w-5 text-slate-400 dark:text-steel-500" />
                </div>
                <p className="font-display text-xs font-black uppercase text-slate-900 dark:text-white">
                  RADAR TENANG // TIDAK ADA NOTIFIKASI
                </p>
                <p className="mt-1 font-mono text-[10px] text-slate-500 dark:text-steel-400">
                  {filter === "UNREAD"
                    ? "Semua notifikasi sudah kamu baca."
                    : "Belum ada respon baru. Mulai diskusi atau berikan respon di War Room!"}
                </p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const isLike = notif.type === "LIKE";
                const isComment = notif.type === "COMMENT";

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`group relative flex items-start space-x-3 p-3.5 transition-colors cursor-pointer select-none ${
                      notif.read
                        ? "bg-white hover:bg-slate-50 dark:bg-dark-base dark:hover:bg-dark-surface/60"
                        : "bg-blue-50/70 hover:bg-blue-100/60 dark:bg-brand-blue/15 dark:hover:bg-brand-blue/25"
                    }`}
                  >
                    {/* Unread indicator bar on left edge */}
                    {!notif.read && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue dark:bg-brand-cyan" />
                    )}

                    {/* Actor Avatar with Action Icon Badge */}
                    <div className="relative shrink-0">
                      {notif.actorAvatar ? (
                        <img
                          src={notif.actorAvatar}
                          alt={notif.actorNickname}
                          className="h-10 w-10 border-2 border-slate-900 object-cover dark:border-white"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center border-2 border-slate-900 bg-brand-blue font-black text-xs uppercase text-white dark:border-white dark:bg-brand-cyan dark:text-slate-950">
                          {notif.actorNickname.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Mini Action Tag Overlay */}
                      <span
                        className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center border border-slate-900 text-white shadow-[1px_1px_0px_0px_#000] dark:border-white ${
                          isLike ? "bg-rose-600" : "bg-brand-blue dark:bg-brand-cyan dark:text-slate-950"
                        }`}
                      >
                        {isLike ? (
                          <Heart className="h-2.5 w-2.5 fill-white" />
                        ) : (
                          <MessageCircle className="h-2.5 w-2.5" />
                        )}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center space-x-1 truncate">
                          <span className="font-display font-black text-xs uppercase text-slate-900 dark:text-white truncate">
                            {notif.actorNickname}
                          </span>
                          {notif.actorVerified && (
                            <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-slate-400 dark:text-steel-400 shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[12px] text-slate-700 dark:text-steel-200 leading-tight">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {notif.title}
                        </span>
                        {notif.message && (
                          <span className="block mt-1 font-mono text-[11px] text-slate-600 dark:text-steel-300 bg-black/5 dark:bg-white/5 p-1.5 border border-slate-200 dark:border-steel-700 line-clamp-2">
                            &ldquo;{notif.message}&rdquo;
                          </span>
                        )}
                      </p>

                      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-brand-blue dark:text-brand-cyan">
                        <span className="flex items-center space-x-1 group-hover:underline">
                          <span>BUKA THREAD</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-brand-blue dark:bg-brand-cyan animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Strip */}
          <div className="border-t-2 border-slate-900 bg-slate-100 p-2 text-center font-mono text-[10px] font-bold text-slate-600 dark:border-white dark:bg-dark-void dark:text-steel-400">
            <span className="text-brand-blue dark:text-brand-cyan">CEES RADAR SYSTEM</span> // OTOMATIS TERSINKRON
          </div>
        </div>
      )}
    </div>
  );
}
