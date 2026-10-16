// src/components/forum/ForumWarRoom.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Flame,
  Clock,
  Pin,
  Heart,
  Share2,
  ShieldCheck,
  Radio,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Send,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ceesAlert } from "@/lib/ceesAlert";
import {
  ForumThread,
  ForumCategory,
  FORUM_CATEGORIES,
  fetchForumThreads,
  toggleForumThreadLike,
} from "@/lib/forum/forumHelper";
import CreateThreadModal from "./CreateThreadModal";
import ThreadDetailModal from "./ThreadDetailModal";

export default function ForumWarRoom() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<ForumCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "hot" | "comments">("newest");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);

  // Load threads from API
  const loadThreads = async () => {
    setLoading(true);
    const data = await fetchForumThreads(activeCategory, searchQuery, sortBy);
    setThreads(data);
    setLoading(false);
  };

  useEffect(() => {
    loadThreads();
  }, [activeCategory, sortBy]);

  // Deep link check from URL (?thread=id)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const threadId = params.get("thread");
      if (threadId && threads.length > 0) {
        const found = threads.find((t) => t.id === threadId);
        if (found) setSelectedThread(found);
      }
    }
  }, [threads]);

  // Handle Search on Enter or Click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadThreads();
  };

  // Open Create Thread
  const handleOpenCreateModal = () => {
    ceesAlert.playClick();
    if (!user) {
      ceesAlert.warning({
        title: "LOGIN DIPERLUKAN",
        message: "Kamu harus login sebagai member terverifikasi terlebih dahulu untuk membuat thread baru.",
      });
      return;
    }

    if (!user.verified && user.role !== "admin") {
      ceesAlert.warning({
        title: "AKUN BELUM DIVERIFIKASI",
        message: "Hanya Member Terverifikasi yang dapat membuat thread baru di War Room. Silakan verifikasi nomor WhatsApp akunmu di menu Passport Member.",
      });
      return;
    }

    setIsCreateOpen(true);
  };

  // Quick Like directly from card
  const handleQuickLike = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!user) {
      ceesAlert.warning({
        title: "LOGIN DIPERLUKAN",
        message: "Silakan login sebagai member terlebih dahulu untuk memberikan upvote/reaksi.",
      });
      return;
    }

    ceesAlert.playClick();
    const userId = user.uid || user.memberId || "user";
    const res = await toggleForumThreadLike(threadId, userId, {
      nickname: user.gameNickname || user.displayName,
      name: user.displayName,
      avatar: user.avatarUrl,
      verified: Boolean(user.verified),
    });

    if (res.success && res.likes !== undefined) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                likes: res.likes || t.likes,
                likedBy: res.isLiked
                  ? [...(t.likedBy || []), userId]
                  : (t.likedBy || []).filter((id) => id !== userId),
              }
            : t
        )
      );
    }
  };

  // Quick Share WhatsApp directly from card
  const handleQuickShare = (e: React.MouseEvent, t: ForumThread) => {
    e.stopPropagation();
    const text = `🔥 [WAR ROOM CEES AREA] ${t.title}\n\nTopik diskusi oleh ${t.authorNickname} (${t.gameDivision}):\n"${t.content.slice(0, 100)}..."\n\nYuk ikutan nimbrung di website resmi CEES:\n${window.location.origin}/news?tab=forum&thread=${t.id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Total stats calculations
  const totalCommentsCount = threads.reduce((acc, t) => acc + (t.commentsCount || 0), 0);
  const pinnedThreads = threads.filter((t) => t.isPinned);
  const regularThreads = threads.filter((t) => !t.isPinned);

  return (
    <section className="mt-8 space-y-8 font-sans">
      {/* 1. Tactical Command Header Banner */}
      <div className="border-3 border-slate-900 bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base relative overflow-hidden">
        {/* Background Decorative Grid */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-blue-100 dark:bg-blue-950/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 border-2 border-slate-900 bg-brand-blue px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-white dark:border-white">
              <Radio className="h-3.5 w-3.5 animate-pulse text-amber-300" />
              <span>WAR ROOM // CEES COMM-LINK FORUM</span>
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Pusat Diskusi, Scrim & Taktik Gamers
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-steel-300 max-w-2xl leading-relaxed">
              Kanal koordinasi resmi member CEES GANK Samarinda dan player se-Kaltim. Buka room scrim, cari tim LFT, diskusikan meta hero/rotasi map, dan koordinasi turnamen.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="brutal-btn flex items-center justify-center space-x-2 px-6 py-3.5 text-xs font-black bg-brand-blue text-white shadow-[4px_4px_0px_0px_#000] hover:bg-blue-600 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>BUAT THREAD BARU</span>
            </button>
          </div>
        </div>

        {/* Live Counters Strip */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-300 pt-4 dark:border-steel-700 font-mono text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1 border border-slate-900 dark:border-steel-700 dark:bg-dark-surface">
            <span className="font-bold text-slate-500 dark:text-steel-400">TOTAL THREAD:</span>
            <span className="font-black text-brand-blue dark:text-brand-cyan">{threads.length}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1 border border-slate-900 dark:border-steel-700 dark:bg-dark-surface">
            <span className="font-bold text-slate-500 dark:text-steel-400">TOTAL BALASAN:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">{totalCommentsCount}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1 border border-slate-900 dark:border-steel-700 dark:bg-dark-surface">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800 dark:text-steel-200">REALTIME COMM-LINK</span>
          </div>
        </div>
      </div>

      {/* 2. Channel Category Filter Pills (Swipeable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 touch-pan-x border-b-2 border-slate-900 dark:border-white">
        {FORUM_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                ceesAlert.playClick();
                setActiveCategory(cat.id);
              }}
              className={`flex shrink-0 whitespace-nowrap items-center space-x-2 border-2 border-slate-900 px-4 py-2 font-display text-xs font-black uppercase transition-all rounded-none dark:border-white ${
                isActive
                  ? "bg-brand-blue text-white shadow-[3px_3px_0px_0px_#00F0FF] dark:bg-brand-cyan dark:text-slate-950 dark:shadow-[3px_3px_0px_0px_#0030FF]"
                  : "bg-white text-slate-800 hover:bg-slate-100 dark:bg-dark-base dark:text-steel-200 dark:hover:bg-dark-surface"
              }`}
            >
              <span>[{cat.code}]</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar & Sort Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center border-2 border-slate-900 bg-white dark:border-white dark:bg-dark-base shadow-[3px_3px_0px_0px_#0030FF]">
          <Search className="h-4 w-4 text-slate-500 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Cari topik diskusi, tim scrim, atau nickname author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none uppercase"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                loadThreads();
              }}
              className="mr-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              [CLEAR]
            </button>
          )}
          <button
            type="submit"
            className="border-l-2 border-slate-900 px-4 py-2.5 font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-900 dark:border-white dark:bg-dark-surface dark:text-white"
          >
            Cari
          </button>
        </form>

        {/* Sort Controls */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0">
          <span className="font-bold text-slate-500 dark:text-steel-400 mr-1">SORT:</span>
          <button
            onClick={() => setSortBy("newest")}
            className={`border-2 border-slate-900 px-3 py-1.5 font-bold uppercase rounded-none dark:border-white ${
              sortBy === "newest"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-dark-base dark:text-steel-300"
            }`}
          >
            Terbaru
          </button>
          <button
            onClick={() => setSortBy("hot")}
            className={`flex items-center space-x-1 border-2 border-slate-900 px-3 py-1.5 font-bold uppercase rounded-none dark:border-white ${
              sortBy === "hot"
                ? "bg-rose-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-dark-base dark:text-steel-300"
            }`}
          >
            <Flame className="h-3 w-3" />
            <span>Hot</span>
          </button>
          <button
            onClick={() => setSortBy("comments")}
            className={`border-2 border-slate-900 px-3 py-1.5 font-bold uppercase rounded-none dark:border-white ${
              sortBy === "comments"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-dark-base dark:text-steel-300"
            }`}
          >
            Paling Ramai
          </button>
        </div>
      </div>

      {/* 4. Feed Grid (Loading State) */}
      {loading ? (
        <div className="border-3 border-dashed border-slate-300 p-12 text-center dark:border-steel-700">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-blue dark:text-brand-cyan mx-auto mb-3" />
          <p className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-steel-300">
            Mengambil data feed War Room...
          </p>
        </div>
      ) : threads.length === 0 ? (
        <div className="border-3 border-slate-900 bg-white p-12 text-center shadow-[6px_6px_0px_0px_#0030FF] dark:border-white dark:bg-dark-base">
          <MessageSquare className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
            Belum Ada Diskusi di Kanal Ini
          </h3>
          <p className="font-mono text-xs text-slate-500 dark:text-steel-400 mt-1 max-w-md mx-auto">
            Jadilah yang pertama membuka obrolan, mengundang tim scrim, atau berbagi tips taktik bermain!
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="brutal-btn inline-flex items-center space-x-2 px-6 py-2.5 mt-5 text-xs font-black bg-brand-blue text-white"
          >
            <Plus className="h-4 w-4" />
            <span>BUAT THREAD PERTAMA</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* PINNED SECTION HIGHLIGHT (IF ANY) */}
          {pinnedThreads.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 font-mono text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                <Pin className="h-4 w-4" />
                <span>PENGUMUMAN RESMI HQ (DISEMATKAN)</span>
              </div>

              {pinnedThreads.map((t) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  isPinnedStyle
                  onOpen={() => setSelectedThread(t)}
                  onLike={(e) => handleQuickLike(e, t.id)}
                  onShare={(e) => handleQuickShare(e, t)}
                />
              ))}
            </div>
          )}

          {/* REGULAR THREADS FEED */}
          {regularThreads.map((t) => (
            <ThreadCard
              key={t.id}
              thread={t}
              onOpen={() => setSelectedThread(t)}
              onLike={(e) => handleQuickLike(e, t.id)}
              onShare={(e) => handleQuickShare(e, t)}
            />
          ))}
        </div>
      )}

      {/* 5. Modals */}
      <CreateThreadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onThreadCreated={(newT) => {
          setThreads([newT, ...threads]);
          setSelectedThread(newT);
        }}
      />

      <ThreadDetailModal
        thread={selectedThread}
        isOpen={Boolean(selectedThread)}
        onClose={() => setSelectedThread(null)}
        onThreadUpdated={(updated) => {
          setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setSelectedThread(updated);
        }}
        onThreadDeleted={(deletedId) => {
          setThreads((prev) => prev.filter((t) => t.id !== deletedId));
          setSelectedThread(null);
        }}
      />
    </section>
  );
}

// Subcomponent: Individual Brutalist Thread Card
function ThreadCard({
  thread,
  isPinnedStyle = false,
  onOpen,
  onLike,
  onShare,
}: {
  thread: ForumThread;
  isPinnedStyle?: boolean;
  onOpen: () => void;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}) {
  const { user } = useAuth();
  const categoryMeta = FORUM_CATEGORIES.find((c) => c.id === thread.category);
  const isLiked = Boolean(user && (thread.likedBy || []).includes(user.uid || user.memberId || ""));

  return (
    <div
      onClick={onOpen}
      className={`group cursor-pointer border-3 border-slate-900 bg-white p-5 sm:p-6 transition-all rounded-none hover:-translate-y-0.5 dark:border-white dark:bg-dark-base relative ${
        isPinnedStyle
          ? "border-amber-400 shadow-[6px_6px_0px_0px_#F59E0B] dark:border-amber-400"
          : "shadow-[5px_5px_0px_0px_#0030FF] hover:shadow-[7px_7px_0px_0px_#000000] dark:hover:shadow-[7px_7px_0px_0px_#0030FF]"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-dashed border-slate-300 pb-3 dark:border-steel-700">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Chip */}
          <span
            className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 ${
              categoryMeta?.badgeColor || "bg-slate-900 text-white"
            }`}
          >
            [{categoryMeta?.code || "00"}] {categoryMeta?.name}
          </span>

          {/* Division Chip */}
          {thread.gameDivision && (
            <span className="font-mono text-[10px] font-black uppercase px-1.5 py-0.5 border border-slate-900 bg-slate-100 text-slate-800 dark:border-white dark:bg-dark-surface dark:text-white">
              {thread.gameDivision}
            </span>
          )}

          {thread.isPinned && (
            <span className="flex items-center space-x-1 font-mono text-[10px] font-black uppercase px-1.5 py-0.5 bg-amber-400 text-slate-950 border border-slate-950">
              <Pin className="h-3 w-3" />
              <span>PINNED</span>
            </span>
          )}
        </div>

        {/* Date Time */}
        <span className="font-mono text-[11px] text-slate-500 dark:text-steel-400">
          {new Date(thread.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          WITA
        </span>
      </div>

      {/* Main Content Info */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan transition-colors leading-snug">
            {thread.title}
          </h3>
          <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </div>

        <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-steel-300 line-clamp-2 leading-relaxed">
          {thread.content}
        </p>
      </div>

      {/* Author & Interaction Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-steel-800 font-mono text-xs">
        {/* Author info */}
        <div className="flex items-center space-x-2">
          {thread.authorAvatar ? (
            <img
              src={thread.authorAvatar}
              alt={thread.authorNickname}
              className="h-6 w-6 border border-slate-900 object-cover dark:border-white"
            />
          ) : (
            <div className="h-6 w-6 border border-slate-900 bg-brand-blue text-white flex items-center justify-center font-black text-[10px] dark:border-white dark:bg-brand-cyan dark:text-slate-950">
              {thread.authorNickname.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-display font-black text-xs uppercase text-slate-900 dark:text-white">
            {thread.authorNickname}
          </span>
          {thread.authorVerified && (
            <span title="Verified Member">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            </span>
          )}
        </div>

        {/* Counter buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onLike}
            className={`flex items-center space-x-1 font-bold text-xs transition-colors ${
              isLiked ? "text-rose-600" : "text-slate-600 hover:text-rose-600 dark:text-steel-400"
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
            <span>{thread.likes || 0}</span>
          </button>

          <div className="flex items-center space-x-1 font-bold text-xs text-slate-600 dark:text-steel-400">
            <MessageSquare className="h-4 w-4" />
            <span>{thread.commentsCount || 0}</span>
          </div>

          <button
            onClick={onShare}
            className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            title="Bagikan ke WhatsApp"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
