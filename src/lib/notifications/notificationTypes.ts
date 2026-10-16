// src/lib/notifications/notificationTypes.ts

export type NotificationType = "LIKE" | "COMMENT" | "SYSTEM" | "BADGE";

export interface AppNotification {
  id: string;
  recipientId: string;       // User ID yang menerima notifikasi (misal: pembuat thread)
  actorId: string;           // User ID yang melakukan aksi (yang like / comment)
  actorName: string;
  actorNickname: string;
  actorAvatar?: string;
  actorVerified?: boolean;
  type: NotificationType;
  title: string;             // Contoh: "menyukai thread kamu" atau "mengomentari diskusi kamu"
  message?: string;          // Cuplikan komentar atau judul thread
  targetUrl: string;         // Link tujuan (e.g. /news?tab=forum&thread=thread-tactics-03)
  threadId?: string;
  commentId?: string;
  read: boolean;
  createdAt: string;         // ISO timestamp
}

/**
 * Utility: Format waktu relatif dalam Bahasa Indonesia
 */
export function formatTimeAgo(isoDate: string): string {
  try {
    const now = new Date();
    const date = new Date(isoDate);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return "Baru saja";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}j lalu`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}h lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch (e) {
    return "Baru saja";
  }
}
