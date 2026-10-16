// src/app/api/forum/threads/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: "Isi komentar tidak boleh kosong." },
        { status: 400 }
      );
    }

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      threadId: id,
      authorId: body.authorId || "user_guest",
      authorName: body.authorName || "Member CEES",
      authorNickname: body.authorNickname || "Member",
      authorAvatar: body.authorAvatar || "",
      authorDivision: body.authorDivision || "GENERAL",
      authorRole: body.authorRole || "member",
      authorVerified: Boolean(body.authorVerified),
      content: body.content.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    // 1. Update di local / tmp / memory
    const localData = readForumData();
    const thread = (localData.threads || []).find((t: any) => t.id === id);

    if (thread) {
      if (thread.isLocked) {
        return NextResponse.json(
          { success: false, error: "Thread ini telah dikunci oleh admin. Komentar baru ditutup." },
          { status: 403 }
        );
      }
      thread.comments = thread.comments || [];
      thread.comments.push(newComment);
      thread.commentsCount = thread.comments.length;
      thread.updatedAt = new Date().toISOString();
      writeForumData(localData);
    }

    // 2. Buat notifikasi untuk pemilik thread (jika bukan pengomentar sendiri)
    if (thread && thread.authorId && thread.authorId !== newComment.authorId) {
      try {
        const { createServerNotification } = await import("@/lib/notifications/notificationServer");
        await createServerNotification({
          recipientId: thread.authorId,
          actorId: newComment.authorId,
          actorName: newComment.authorName,
          actorNickname: newComment.authorNickname,
          actorAvatar: newComment.authorAvatar,
          actorVerified: newComment.authorVerified,
          type: "COMMENT",
          title: "mengomentari thread kamu",
          message: newComment.content.length > 80 ? newComment.content.slice(0, 80) + "..." : newComment.content,
          targetUrl: `/news?tab=forum&thread=${thread.id}`,
          threadId: thread.id,
          commentId: newComment.id,
        });
      } catch (notifErr) {
        console.warn("Gagal membuat notifikasi komentar:", notifErr);
      }
    }

    // 3. Update di Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const threadDocRef = doc(db, "forum_threads", id);
        await updateDoc(threadDocRef, {
          comments: arrayUnion(newComment),
          updatedAt: new Date().toISOString(),
        });
      } catch (fbErr) {
        console.warn("Gagal updateDoc Firestore comments:", fbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: newComment,
      message: "Komentar berhasil dikirimkan!",
    });
  } catch (err: any) {
    console.error("Error POST comment:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
