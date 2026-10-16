// src/lib/notifications/notificationHelper.ts
export * from "./notificationTypes";
import { AppNotification } from "./notificationTypes";

/**
 * Client API Bridge: Mengambil notifikasi user saat ini
 */
export async function fetchUserNotifications(userId: string): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  if (!userId) return { notifications: [], unreadCount: 0 };
  try {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { notifications: [], unreadCount: 0 };
    const data = await res.json();
    return {
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
      unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : 0,
    };
  } catch (err) {
    console.error("Gagal fetchUserNotifications:", err);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Client API Bridge: Menandai notifikasi sebagai terbaca
 */
export async function markNotificationsRead(
  userId: string,
  notificationId?: string,
  markAll: boolean = false
): Promise<{ success: boolean; unreadCount?: number }> {
  if (!userId) return { success: false };
  try {
    const res = await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, notificationId, markAll }),
    });
    return await res.json();
  } catch (err) {
    console.error("Gagal markNotificationsRead:", err);
    return { success: false };
  }
}
