// src/app/api/forum/threads/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
    const userId = body.userId || "anonymous";

    const localData = readForumData();
    const thread = (localData.threads || []).find((t: any) => t.id === id);

    let isLiked = false;
    let newLikesCount = 1;

    if (thread) {
      thread.likedBy = thread.likedBy || [];
      const userIndex = thread.likedBy.indexOf(userId);

      if (userIndex > -1) {
        // Unlike
        thread.likedBy.splice(userIndex, 1);
        thread.likes = Math.max(0, (thread.likes || 1) - 1);
        isLiked = false;
      } else {
        // Like
        thread.likedBy.push(userId);
        thread.likes = (thread.likes || 0) + 1;
        isLiked = true;
      }

      newLikesCount = thread.likes;
      writeForumData(localData);

      // Buat notifikasi jika like baru dan bukan ke thread sendiri
      if (isLiked && thread.authorId && thread.authorId !== userId) {
        try {
          const { createServerNotification } = await import("@/lib/notifications/notificationServer");
          await createServerNotification({
            recipientId: thread.authorId,
            actorId: userId,
            actorName: body.actorName || body.authorName || "Member CEES",
            actorNickname: body.actorNickname || body.authorNickname || "Member",
            actorAvatar: body.actorAvatar || body.authorAvatar || "",
            actorVerified: Boolean(body.actorVerified),
            type: "LIKE",
            title: "menyukai thread kamu",
            message: thread.title,
            targetUrl: `/news?tab=forum&thread=${thread.id}`,
            threadId: thread.id,
          });
        } catch (notifErr) {
          console.warn("Gagal membuat notifikasi like:", notifErr);
        }
      }
    }

    // Update di Firestore jika aktif
    if (isFirebaseConfigured && db && thread) {
      try {
        const threadDocRef = doc(db, "forum_threads", id);
        await updateDoc(threadDocRef, {
          likes: thread.likes,
          likedBy: thread.likedBy,
        });
      } catch (fbErr) {
        console.warn("Gagal updateDoc Firestore likes:", fbErr);
      }
    }

    return NextResponse.json({
      success: true,
      likes: newLikesCount,
      isLiked,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
