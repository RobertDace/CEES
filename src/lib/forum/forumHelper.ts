// src/lib/forum/forumHelper.ts
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { UserSession } from "@/context/AuthContext";

export type ForumCategory =
  | "ALL"
  | "SCRIM_LFT"
  | "TACTICS_META"
  | "TOURNAMENT"
  | "LOUNGE"
  | "HQ_ANNOUNCEMENT";

export interface ForumComment {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorNickname: string;
  authorAvatar?: string;
  authorDivision?: string;
  authorRole: "admin" | "member";
  authorVerified: boolean;
  content: string;
  createdAt: string;
  likes: number;
}

export interface ForumThread {
  id: string;
  title: string;
  slug: string;
  category: "SCRIM_LFT" | "TACTICS_META" | "TOURNAMENT" | "LOUNGE" | "HQ_ANNOUNCEMENT";
  gameDivision?: "PUBGM" | "MLBB" | "ROBLOX" | "GENERAL";
  content: string;
  image?: string;
  tags: string[];
  isPinned?: boolean;
  isLocked?: boolean;
  authorId: string;
  authorName: string;
  authorNickname: string;
  authorAvatar?: string;
  authorDivision?: string;
  authorCity?: string;
  authorRole: "admin" | "member";
  authorVerified: boolean;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  comments?: ForumComment[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const FORUM_CATEGORIES: {
  id: ForumCategory;
  name: string;
  code: string;
  desc: string;
  badgeColor: string;
}[] = [
  {
    id: "ALL",
    name: "SEMUA KANAL",
    code: "00",
    desc: "Seluruh arsip diskusi aktif komunitas CEES",
    badgeColor: "bg-slate-900 text-white dark:bg-white dark:text-slate-950",
  },
  {
    id: "HQ_ANNOUNCEMENT",
    name: "HQ ANNOUNCEMENT",
    code: "01",
    desc: "Pengumuman & agenda resmi dari pengurus CEES GANK",
    badgeColor: "bg-amber-400 text-slate-950 border border-slate-950",
  },
  {
    id: "SCRIM_LFT",
    name: "SCRIM & CARI TIM (LFT)",
    code: "02",
    desc: "Buka room scrim, cari squad mabar & open recruitment",
    badgeColor: "bg-brand-blue text-white",
  },
  {
    id: "TACTICS_META",
    name: "TAKTIK & META GAME",
    code: "03",
    desc: "Sensitivitas, rotasi map, build hero, dan panduan bermain",
    badgeColor: "bg-emerald-600 text-white",
  },
  {
    id: "TOURNAMENT",
    name: "DISKUSI TURNAMEN",
    code: "04",
    desc: "Kilas balik hasil match, klasemen, dan persiapan turnamen",
    badgeColor: "bg-purple-600 text-white",
  },
  {
    id: "LOUNGE",
    name: "LOUNGE & KOPDAR",
    code: "05",
    desc: "Nongkrong santai, cerita regional, dan foto agenda komunitas",
    badgeColor: "bg-rose-600 text-white",
  },
];

/**
 * Fetch thread list dari API backend
 */
export async function fetchForumThreads(
  category?: string,
  search?: string,
  sort?: "newest" | "hot" | "comments"
): Promise<ForumThread[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== "ALL") params.set("category", category);
    if (search) params.set("q", search);
    if (sort) params.set("sort", sort);
    params.set("t", Date.now().toString());

    const res = await fetch(`/api/forum/threads?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error("Gagal fetch forum threads:", err);
    return [];
  }
}

/**
 * Fetch detail thread tunggal beserta komentarnya
 */
export async function fetchForumThreadDetail(id: string): Promise<ForumThread | null> {
  try {
    const res = await fetch(`/api/forum/threads/${id}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error("Gagal fetch forum thread detail:", err);
    return null;
  }
}

/**
 * Buat thread baru (Khusus verified member / admin)
 */
export async function createForumThread(
  payload: {
    title: string;
    category: ForumCategory;
    gameDivision?: string;
    content: string;
    image?: string;
    tags?: string[];
  },
  user: UserSession
): Promise<{ success: boolean; data?: ForumThread; error?: string }> {
  try {
    // Validasi izin client
    if (!user.verified && user.role !== "admin") {
      return {
        success: false,
        error: "Hanya Member Terverifikasi dan Admin HQ yang dapat membuat thread baru.",
      };
    }

    const threadPayload: Partial<ForumThread> = {
      title: payload.title.trim().toUpperCase(),
      slug: payload.title.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 50),
      category: payload.category as any,
      gameDivision: (payload.gameDivision as any) || "GENERAL",
      content: payload.content.trim(),
      image: payload.image || "",
      tags: payload.tags || [],
      authorId: user.uid || user.memberId || "user_" + Date.now(),
      authorName: user.displayName || user.gameNickname || "Member CEES",
      authorNickname: user.gameNickname || user.displayName || "Member",
      authorAvatar: user.avatarUrl || "",
      authorDivision: user.division || "GENERAL",
      authorRole: user.role,
      authorVerified: Boolean(user.verified || user.role === "admin"),
      likes: 1,
      likedBy: [user.uid || user.memberId || "author"],
      commentsCount: 0,
      views: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Simpan ke Firestore jika aktif di client
    if (isFirebaseConfigured && db) {
      try {
        const threadDocRef = doc(collection(db, "forum_threads"));
        threadPayload.id = threadDocRef.id;
        await setDoc(threadDocRef, threadPayload);
      } catch (fbErr) {
        console.warn("Gagal simpan thread ke Firestore client (fallback ke API):", fbErr);
      }
    }

    // 2. Simpan via API backend
    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(threadPayload),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error("Gagal createForumThread:", err);
    return { success: false, error: err.message || "Gagal membuat thread baru." };
  }
}

/**
 * Tambah komentar / balasan pada thread
 */
export async function addForumComment(
  threadId: string,
  content: string,
  user: UserSession
): Promise<{ success: boolean; data?: ForumComment; error?: string }> {
  try {
    if (!content.trim()) {
      return { success: false, error: "Isi komentar tidak boleh kosong." };
    }

    const commentPayload: Partial<ForumComment> = {
      threadId,
      authorId: user.uid || user.memberId || "user_" + Date.now(),
      authorName: user.displayName || user.gameNickname || "Member CEES",
      authorNickname: user.gameNickname || user.displayName || "Member",
      authorAvatar: user.avatarUrl || "",
      authorDivision: user.division || "GENERAL",
      authorRole: user.role,
      authorVerified: Boolean(user.verified || user.role === "admin"),
      content: content.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch(`/api/forum/threads/${threadId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentPayload),
    });

    return await res.json();
  } catch (err: any) {
    console.error("Gagal addForumComment:", err);
    return { success: false, error: err.message || "Gagal mengirimkan komentar." };
  }
}

/**
 * Toggle like/upvote pada thread
 */
export async function toggleForumThreadLike(
  threadId: string,
  userId: string,
  actor?: {
    name?: string;
    nickname?: string;
    avatar?: string;
    verified?: boolean;
  }
): Promise<{ success: boolean; likes?: number; isLiked?: boolean }> {
  try {
    const res = await fetch(`/api/forum/threads/${threadId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        actorName: actor?.name,
        actorNickname: actor?.nickname,
        actorAvatar: actor?.avatar,
        actorVerified: actor?.verified,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("Gagal toggle like:", err);
    return { success: false };
  }
}

/**
 * Moderasi thread (Pin, Lock, Delete) - Khusus Admin
 */
export async function moderateForumThread(
  threadId: string,
  action: "pin" | "lock" | "delete",
  user: UserSession
): Promise<{ success: boolean; data?: ForumThread; message?: string; error?: string }> {
  try {
    if (user.role !== "admin") {
      return { success: false, error: "Hanya Admin HQ yang dapat memoderasi thread." };
    }

    if (action === "delete") {
      const res = await fetch(`/api/forum/threads/${threadId}`, {
        method: "DELETE",
      });
      return await res.json();
    } else {
      const res = await fetch(`/api/forum/threads/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      return await res.json();
    }
  } catch (err: any) {
    console.error("Gagal moderate thread:", err);
    return { success: false, error: err.message || "Gagal memproses aksi moderasi." };
  }
}
