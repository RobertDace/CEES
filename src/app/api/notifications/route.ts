// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readNotificationsData } from "@/lib/notifications/notificationServer";
import { AppNotification } from "@/lib/notifications/notificationTypes";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        success: true,
        notifications: [],
        unreadCount: 0,
      });
    }

    // 1. Ambil dari Firestore jika aktif
    let firestoreNotifs: AppNotification[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const notifCol = collection(db, "user_notifications");
        const q = query(
          notifCol,
          where("recipientId", "==", userId),
          limit(50)
        );
        const snapshot = await getDocs(q);
        firestoreNotifs = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as AppNotification),
          id: docSnap.id,
        }));
      } catch (fbErr) {
        console.warn("Firestore query notifications fallback to local:", fbErr);
      }
    }

    // 2. Ambil dari local data (tmp / seed / memory)
    const localData = readNotificationsData();
    const localUserNotifs = (localData.notifications || []).filter(
      (n: AppNotification) => n.recipientId === userId
    );

    // Gabungkan jika Firestore aktif, prioritaskan data yang ada
    const notifsMap = new Map<string, AppNotification>();
    localUserNotifs.forEach((n) => notifsMap.set(n.id, n));
    firestoreNotifs.forEach((n) => notifsMap.set(n.id, n));

    const allNotifs = Array.from(notifsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = allNotifs.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications: allNotifs,
      unreadCount,
    });
  } catch (err: any) {
    console.error("Error in GET /api/notifications:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengambil notifikasi" },
      { status: 500 }
    );
  }
}
