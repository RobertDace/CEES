// src/app/api/notifications/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readNotificationsData, writeNotificationsData } from "@/lib/notifications/notificationServer";
import { AppNotification } from "@/lib/notifications/notificationTypes";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, updateDoc, writeBatch, collection, query, where, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, notificationId, markAll } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId diperlukan" },
        { status: 400 }
      );
    }

    const localData = readNotificationsData();
    const notifications = localData.notifications || [];

    if (markAll) {
      // Tandai semua notifikasi milik user ini sebagai sudah dibaca
      notifications.forEach((n: AppNotification) => {
        if (n.recipientId === userId) {
          n.read = true;
        }
      });
      writeNotificationsData(localData);

      // Update di Firestore
      if (isFirebaseConfigured && db) {
        try {
          const notifCol = collection(db, "user_notifications");
          const q = query(notifCol, where("recipientId", "==", userId));
          const snapshot = await getDocs(q);
          const batch = writeBatch(db);
          let hasUpdates = false;
          snapshot.docs.forEach((docSnap) => {
            if (docSnap.data().read === false) {
              batch.update(docSnap.ref, { read: true });
              hasUpdates = true;
            }
          });
          if (hasUpdates) {
            await batch.commit();
          }
        } catch (fbErr) {
          console.warn("Firestore batch mark read error:", fbErr);
        }
      }
    } else if (notificationId) {
      // Tandai 1 notifikasi tertentu
      const target = notifications.find(
        (n: AppNotification) => n.id === notificationId && n.recipientId === userId
      );
      if (target) {
        target.read = true;
        writeNotificationsData(localData);
      }

      if (isFirebaseConfigured && db) {
        try {
          const notifDocRef = doc(db, "user_notifications", notificationId);
          await updateDoc(notifDocRef, { read: true });
        } catch (fbErr) {
          console.warn("Firestore single mark read error:", fbErr);
        }
      }
    }

    // Hitung sisa unread count
    const remainingUnread = notifications.filter(
      (n: AppNotification) => n.recipientId === userId && !n.read
    ).length;

    return NextResponse.json({
      success: true,
      unreadCount: remainingUnread,
    });
  } catch (err: any) {
    console.error("Error in POST /api/notifications/read:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memperbarui notifikasi" },
      { status: 500 }
    );
  }
}
