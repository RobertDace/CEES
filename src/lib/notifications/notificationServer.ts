// src/lib/notifications/notificationServer.ts
import fs from "fs";
import path from "path";
import os from "os";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { AppNotification, NotificationType } from "./notificationTypes";

const seedFilePath = path.join(process.cwd(), "src", "data", "notificationsSeedData.json");
const tmpFilePath = path.join(os.tmpdir(), "cees_notifications.json");

declare global {
  var __cees_notifications_data: any;
}

/**
 * Membaca data notifikasi dari memori / tmp / seed JSON
 */
export function readNotificationsData(): { notifications: AppNotification[] } {
  if (globalThis.__cees_notifications_data && Array.isArray(globalThis.__cees_notifications_data.notifications)) {
    return globalThis.__cees_notifications_data;
  }

  try {
    if (fs.existsSync(tmpFilePath)) {
      const raw = fs.readFileSync(tmpFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.notifications)) {
        globalThis.__cees_notifications_data = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  try {
    if (fs.existsSync(seedFilePath)) {
      const raw = fs.readFileSync(seedFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis.__cees_notifications_data = parsed;
      return parsed;
    }
  } catch (err) {}

  const initial = { notifications: [] };
  globalThis.__cees_notifications_data = initial;
  return initial;
}

/**
 * Menyimpan data notifikasi
 */
export function writeNotificationsData(data: { notifications: AppNotification[] }): boolean {
  globalThis.__cees_notifications_data = data;
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
  try {
    fs.writeFileSync(seedFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {}
  return true;
}

/**
 * Server-side helper untuk membuat notifikasi baru (disimpan ke cache + firestore)
 */
export async function createServerNotification(payload: {
  recipientId: string;
  actorId: string;
  actorName: string;
  actorNickname: string;
  actorAvatar?: string;
  actorVerified?: boolean;
  type: NotificationType;
  title: string;
  message?: string;
  targetUrl: string;
  threadId?: string;
  commentId?: string;
}): Promise<AppNotification | null> {
  // Cegah notifikasi ke diri sendiri
  if (payload.recipientId === payload.actorId) {
    return null;
  }

  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...payload,
    read: false,
    createdAt: new Date().toISOString(),
  };

  // 1. Simpan ke local / memory
  const localData = readNotificationsData();
  localData.notifications.unshift(newNotif);
  // Pertahankan max 200 notifikasi terakhir di cache
  if (localData.notifications.length > 200) {
    localData.notifications = localData.notifications.slice(0, 200);
  }
  writeNotificationsData(localData);

  // 2. Simpan ke Firestore jika aktif
  if (isFirebaseConfigured && db) {
    try {
      const notifDocRef = doc(db, "user_notifications", newNotif.id);
      await setDoc(notifDocRef, newNotif);
    } catch (fbErr) {
      console.warn("Gagal simpan notifikasi ke Firestore:", fbErr);
    }
  }

  return newNotif;
}
