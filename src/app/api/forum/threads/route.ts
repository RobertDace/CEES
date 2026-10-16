// src/app/api/forum/threads/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, setDoc, query, orderBy, where } from "firebase/firestore";

const seedFilePath = path.join(process.cwd(), "src", "data", "forumSeedData.json");
const tmpFilePath = path.join(os.tmpdir(), "cees_forumData.json");

declare global {
  var __cees_forum_data: any;
}

function readForumData(): any {
  // 1. Cek in-memory cache serverless instance
  if (globalThis.__cees_forum_data && Array.isArray(globalThis.__cees_forum_data.threads)) {
    return globalThis.__cees_forum_data;
  }

  // 2. Cek /tmp file writable di Vercel
  try {
    if (fs.existsSync(tmpFilePath)) {
      const raw = fs.readFileSync(tmpFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.threads)) {
        globalThis.__cees_forum_data = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  // 3. Fallback ke seed project
  try {
    if (fs.existsSync(seedFilePath)) {
      const raw = fs.readFileSync(seedFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis.__cees_forum_data = parsed;
      return parsed;
    }
  } catch (err) {
    console.error("Gagal membaca forumSeedData.json:", err);
  }

  return { threads: [] };
}

function writeForumData(data: any): boolean {
  globalThis.__cees_forum_data = data;
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Gagal menulis ke tmpFilePath forum:", e);
  }
  try {
    fs.writeFileSync(seedFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Normal pada runtime Vercel read-only
  }
  return true;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("q")?.toLowerCase();
    const sort = searchParams.get("sort") || "newest";

    // 1. Ambil dari Firestore jika aktif
    let allThreads: any[] = [];
    let fromFirestore = false;

    if (isFirebaseConfigured && db) {
      try {
        const threadsCol = collection(db, "forum_threads");
        const snap = await getDocs(threadsCol);
        if (!snap.empty) {
          snap.forEach((d) => {
            allThreads.push({ id: d.id, ...d.data() });
          });
          fromFirestore = true;
        }
      } catch (fbErr) {
        console.warn("Firestore getDocs forum_threads failed, fallback:", fbErr);
      }
    }

    // 2. Fallback ke local / tmp / memory jika Firestore kosong / offline
    if (allThreads.length === 0) {
      const localData = readForumData();
      allThreads = Array.isArray(localData.threads) ? [...localData.threads] : [];
    }

    // Filter Kategori
    if (category && category !== "ALL") {
      allThreads = allThreads.filter((t) => t.category === category);
    }

    // Filter Search
    if (searchQuery) {
      allThreads = allThreads.filter((t) => {
        const titleMatch = t.title?.toLowerCase().includes(searchQuery);
        const contentMatch = t.content?.toLowerCase().includes(searchQuery);
        const tagMatch = Array.isArray(t.tags) && t.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery));
        const authorMatch = t.authorNickname?.toLowerCase().includes(searchQuery) || t.authorName?.toLowerCase().includes(searchQuery);
        return titleMatch || contentMatch || tagMatch || authorMatch;
      });
    }

    // Sorting (Pinned always first)
    allThreads.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sort === "hot") {
        return (b.likes || 0) + (b.commentsCount || 0) * 2 - ((a.likes || 0) + (a.commentsCount || 0) * 2);
      }
      if (sort === "comments") {
        return (b.commentsCount || 0) - (a.commentsCount || 0);
      }
      // default newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return NextResponse.json(
      {
        success: true,
        data: allThreads,
        total: allThreads.length,
        source: fromFirestore ? "firestore" : "local_cache",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Error GET /api/forum/threads:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload.title || !payload.content || !payload.category) {
      return NextResponse.json(
        { success: false, error: "Judul, kategori, dan isi diskusi wajib diisi." },
        { status: 400 }
      );
    }

    const newThread = {
      id: payload.id || `thread-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title.trim().toUpperCase(),
      slug: payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 50),
      category: payload.category,
      gameDivision: payload.gameDivision || "GENERAL",
      content: payload.content.trim(),
      image: payload.image || "",
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      isPinned: Boolean(payload.isPinned),
      isLocked: false,
      authorId: payload.authorId || "anonymous",
      authorName: payload.authorName || "Member CEES",
      authorNickname: payload.authorNickname || "Member",
      authorAvatar: payload.authorAvatar || "",
      authorDivision: payload.authorDivision || "GENERAL",
      authorCity: payload.authorCity || "Samarinda",
      authorRole: payload.authorRole || "member",
      authorVerified: Boolean(payload.authorVerified),
      likes: 1,
      likedBy: [payload.authorId || "author"],
      commentsCount: 0,
      comments: [],
      views: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Simpan ke Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const threadDocRef = doc(db, "forum_threads", newThread.id);
        await setDoc(threadDocRef, newThread);
      } catch (fbErr) {
        console.warn("Gagal simpan thread ke Firestore di API:", fbErr);
      }
    }

    // 2. Simpan ke local / tmp / memory
    const localData = readForumData();
    localData.threads = localData.threads || [];
    localData.threads.unshift(newThread);
    writeForumData(localData);

    return NextResponse.json(
      {
        success: true,
        data: newThread,
        message: "Thread berhasil dipublikasikan ke War Room!",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Error POST /api/forum/threads:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
