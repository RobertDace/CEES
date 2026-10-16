// src/app/api/forum/threads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";

const seedFilePath = path.join(process.cwd(), "src", "data", "forumSeedData.json");
const tmpFilePath = path.join(os.tmpdir(), "cees_forumData.json");

declare global {
  var __cees_forum_data: any;
}

function readForumData(): any {
  if (globalThis.__cees_forum_data && Array.isArray(globalThis.__cees_forum_data.threads)) {
    return globalThis.__cees_forum_data;
  }
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

  try {
    if (fs.existsSync(seedFilePath)) {
      const raw = fs.readFileSync(seedFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis.__cees_forum_data = parsed;
      return parsed;
    }
  } catch (err) {}
  return { threads: [] };
}

function writeForumData(data: any): boolean {
  globalThis.__cees_forum_data = data;
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
  try {
    fs.writeFileSync(seedFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {}
  return true;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Cek Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const threadDocRef = doc(db, "forum_threads", id);
        const snap = await getDoc(threadDocRef);
        if (snap.exists()) {
          const thread = { id: snap.id, ...snap.data() };
          return NextResponse.json({ success: true, data: thread });
        }
      } catch (fbErr) {
        console.warn("Gagal getDoc Firestore:", fbErr);
      }
    }

    // 2. Cek local / tmp / memory
    const localData = readForumData();
    const thread = (localData.threads || []).find((t: any) => t.id === id);

    if (!thread) {
      return NextResponse.json(
        { success: false, error: "Thread tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: thread });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, title, content } = body;

    const localData = readForumData();
    const idx = (localData.threads || []).findIndex((t: any) => t.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: "Thread tidak ditemukan." },
        { status: 404 }
      );
    }

    const currentThread = localData.threads[idx];

    if (action === "pin") {
      currentThread.isPinned = !currentThread.isPinned;
    } else if (action === "lock") {
      currentThread.isLocked = !currentThread.isLocked;
    } else if (title || content) {
      if (title) currentThread.title = title.toUpperCase();
      if (content) currentThread.content = content;
    }

    currentThread.updatedAt = new Date().toISOString();

    // Simpan ke Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const threadDocRef = doc(db, "forum_threads", id);
        await setDoc(threadDocRef, currentThread, { merge: true });
      } catch (fbErr) {
        console.warn("Gagal update Firestore thread:", fbErr);
      }
    }

    writeForumData(localData);

    return NextResponse.json({
      success: true,
      data: currentThread,
      message: "Status thread berhasil diperbarui.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const localData = readForumData();
    localData.threads = (localData.threads || []).filter((t: any) => t.id !== id);
    writeForumData(localData);

    if (isFirebaseConfigured && db) {
      try {
        const threadDocRef = doc(db, "forum_threads", id);
        await deleteDoc(threadDocRef);
      } catch (fbErr) {
        console.warn("Gagal deleteDoc Firestore:", fbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thread berhasil dihapus dari forum.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
