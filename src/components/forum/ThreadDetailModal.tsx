// src/components/forum/ThreadDetailModal.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  Heart,
  MessageSquare,
  Share2,
  Pin,
  Lock,
  Trash2,
  Send,
  User,
  ShieldCheck,
  Calendar,
  MapPin,
  Check,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ceesAlert } from "@/lib/ceesAlert";
import {
  ForumThread,
  ForumComment,
  FORUM_CATEGORIES,
  addForumComment,
  toggleForumThreadLike,
  moderateForumThread,
} from "@/lib/forum/forumHelper";

interface ThreadDetailModalProps {
  thread: ForumThread | null;
  isOpen: boolean;
  onClose: () => void;
  onThreadUpdated?: (updated: ForumThread) => void;
  onThreadDeleted?: (threadId: string) => void;
}

export default function ThreadDetailModal({
  thread,
  isOpen,
  onClose,
  onThreadUpdated,
  onThreadDeleted,
}: ThreadDetailModalProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    if (!thread || !user) return false;
    return (thread.likedBy || []).includes(user.uid || user.memberId || "");
  });
  const [likesCount, setLikesCount] = useState(thread?.likes || 0);
  const [commentsList, setCommentsList] = useState<ForumComment[]>(thread?.comments || []);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state when thread changes
  React.useEffect(() => {
    if (thread) {
      setCommentsList(thread.comments || []);
      setLikesCount(thread.likes || 0);
      setIsLiked(Boolean(user && (thread.likedBy || []).includes(user.uid || user.memberId || "")));
    }
  }, [thread, user]);

  if (!isOpen || !thread) return null;

  const categoryMeta = FORUM_CATEGORIES.find((c) => c.id === thread.category);

  // Handle Like
  const handleLike = async () => {
    if (!user) {
      ceesAlert.warning({
        title: "LOGIN DIPERLUKAN",
        message: "Silakan login sebagai member terlebih dahulu untuk memberikan upvote/reaksi.",
      });
      return;
    }

    ceesAlert.playClick();
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    const userId = user.uid || user.memberId || "anonymous";
    const res = await toggleForumThreadLike(thread.id, userId, {
      nickname: user.gameNickname || user.displayName,
      name: user.displayName,
      avatar: user.avatarUrl,
      verified: Boolean(user.verified),
    });

    if (res.success && res.likes !== undefined) {
      setLikesCount(res.likes);
      if (onThreadUpdated) {
        onThreadUpdated({
          ...thread,
          likes: res.likes,
          likedBy: nextIsLiked
            ? [...(thread.likedBy || []), userId]
            : (thread.likedBy || []).filter((id) => id !== userId),
        });
      }
    }
  };

  // Handle Submit Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      ceesAlert.warning({
        title: "LOGIN DIPERLUKAN",
        message: "Kamu harus login sebagai member untuk ikut berdiskusi dan menulis komentar.",
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingComment(true);
    const res = await addForumComment(thread.id, newComment, user);
    setSubmittingComment(false);

    if (res.success && res.data) {
      const updatedComments = [...commentsList, res.data];
      setCommentsList(updatedComments);
      setNewComment("");
      ceesAlert.toast({
        type: "success",
        title: "KOMENTAR TERKIRIM",
        message: "Balasanmu telah dipublikasikan ke diskusi ini.",
      });

      if (onThreadUpdated) {
        onThreadUpdated({
          ...thread,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        });
      }
    } else {
      ceesAlert.error("GAGAL MENGIRIM KOMENTAR", res.error || "Gagal memproses komentar.");
    }
  };

  // Handle Share WhatsApp
  const handleShareWhatsApp = () => {
    const text = `🔥 [WAR ROOM CEES AREA] ${thread.title}\n\nTopik diskusi oleh ${thread.authorNickname} (${thread.gameDivision}):\n"${thread.content.slice(0, 120)}..."\n\nYuk ikutan nimbrung di website resmi CEES:\n${window.location.origin}/news?tab=forum&thread=${thread.id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Handle Copy Link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/news?tab=forum&thread=${thread.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    ceesAlert.toast({
      type: "info",
      title: "TAUTAN DISALIN",
      message: "Link diskusi telah disalin ke clipboard.",
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Admin Moderation: Pin
  const handleTogglePin = async () => {
    if (!user || user.role !== "admin") return;
    const res = await moderateForumThread(thread.id, "pin", user);
    if (res.success && res.data) {
      ceesAlert.toast({
        type: "success",
        title: "STATUS PIN DIPERBARUI",
        message: res.data.isPinned ? "Thread berhasil disematkan di atas!" : "Sematkan thread dilepas.",
      });
      if (onThreadUpdated) onThreadUpdated(res.data);
    }
  };

  // Admin Moderation: Lock
  const handleToggleLock = async () => {
    if (!user || user.role !== "admin") return;
    const res = await moderateForumThread(thread.id, "lock", user);
    if (res.success && res.data) {
      ceesAlert.toast({
        type: "warning",
        title: "STATUS KUNCI DIPERBARUI",
        message: res.data.isLocked ? "Thread telah dikunci oleh admin." : "Kunci thread dibuka kembali.",
      });
      if (onThreadUpdated) onThreadUpdated(res.data);
    }
  };

  // Admin Moderation: Delete
  const handleDeleteThread = async () => {
    if (!user || user.role !== "admin") return;
    if (
      await ceesAlert.confirm({
        title: "HAPUS THREAD DISKUSI",
        message: `Yakin ingin menghapus thread "${thread.title}" secara permanen dari War Room?`,
        danger: true,
        confirmText: "YA, HAPUS PERMANEN",
        cancelText: "BATAL",
      })
    ) {
      const res = await moderateForumThread(thread.id, "delete", user);
      if (res.success) {
        ceesAlert.toast({
          type: "info",
          title: "THREAD DIHAPUS",
          message: "Thread telah dihapus dari sistem.",
        });
        if (onThreadDeleted) onThreadDeleted(thread.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl border-3 border-slate-900 bg-white p-5 sm:p-8 shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-base my-auto max-h-[90vh] flex flex-col transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Sticky Header Strip */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 dark:border-white shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              [ {categoryMeta?.code || "00"} ]
            </span>
            <span className="font-mono text-xs font-black uppercase text-brand-blue dark:text-brand-cyan">
              {categoryMeta?.name}
            </span>
            {thread.gameDivision && (
              <span className="font-mono text-[10px] font-black uppercase px-1.5 py-0.5 border border-slate-900 bg-slate-100 text-slate-800 dark:border-white dark:bg-dark-surface dark:text-white">
                {thread.gameDivision}
              </span>
            )}
            {thread.isPinned && (
              <span className="flex items-center space-x-1 font-mono text-[10px] font-black uppercase px-1.5 py-0.5 bg-amber-400 text-slate-950 border border-slate-950">
                <Pin className="h-3 w-3" />
                <span>PINNED</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="border-2 border-slate-900 p-1 hover:bg-rose-500 hover:text-white transition-colors dark:border-white dark:hover:bg-rose-600"
            title="Tutup Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto pr-1 mt-4 space-y-6 flex-1">
          {/* Thread Title */}
          <div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
              {thread.title}
            </h1>
          </div>

          {/* Author Strip & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y-2 border-dashed border-slate-300 py-3 dark:border-steel-700 font-mono text-xs">
            <div className="flex items-center space-x-3">
              {thread.authorAvatar ? (
                <img
                  src={thread.authorAvatar}
                  alt={thread.authorNickname}
                  className="h-10 w-10 border-2 border-slate-900 object-cover dark:border-white"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center border-2 border-slate-900 bg-brand-blue text-white font-black text-sm dark:border-white dark:bg-brand-cyan dark:text-slate-950">
                  {thread.authorNickname.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-display font-black text-sm uppercase text-slate-950 dark:text-white">
                    {thread.authorNickname}
                  </span>
                  {thread.authorVerified && (
                    <span className="flex items-center gap-0.5 bg-emerald-500 text-slate-950 px-1 py-0.2 text-[9px] font-black border border-slate-950">
                      <ShieldCheck className="h-3 w-3" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                  {thread.authorRole === "admin" && (
                    <span className="bg-brand-blue text-white px-1.5 py-0.2 text-[9px] font-black">
                      HQ ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-steel-400 mt-0.5">
                  <span>DIVISI: {thread.authorDivision || "GENERAL"}</span>
                  <span>•</span>
                  <span>{thread.authorCity || "Samarinda"}</span>
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500 dark:text-steel-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(thread.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WITA
                </span>
              </div>
              <div className="text-[10px] opacity-75 mt-0.5">{thread.views || 1} Views</div>
            </div>
          </div>

          {/* Thread Content Body */}
          <div className="font-sans text-sm sm:text-base text-slate-800 dark:text-steel-200 leading-relaxed whitespace-pre-line select-text">
            {thread.content}
          </div>

          {/* Attached Image if any */}
          {thread.image && (
            <div className="border-2 border-slate-900 bg-slate-100 p-2 dark:border-white dark:bg-dark-surface">
              <img
                src={thread.image}
                alt="Lampiran diskusi"
                className="w-full max-h-[380px] object-cover border border-slate-900 dark:border-steel-700"
              />
            </div>
          )}

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {thread.tags.map((tag, i) => (
                <span
                  key={i}
                  className="font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 border border-slate-400 text-slate-700 dark:bg-dark-surface dark:border-steel-700 dark:text-steel-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Interaction Bar & Admin Moderation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-900 pt-4 dark:border-white font-mono text-xs">
            <div className="flex items-center space-x-2">
              {/* Upvote Button */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1.5 border-2 px-3.5 py-1.5 font-bold uppercase transition-all rounded-none ${
                  isLiked
                    ? "border-rose-600 bg-rose-600 text-white shadow-[2px_2px_0px_0px_#000]"
                    : "border-slate-900 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-white dark:bg-dark-surface dark:text-white"
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
                <span>UPVOTE ({likesCount})</span>
              </button>

              {/* Share WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center space-x-1.5 border-2 border-slate-900 bg-emerald-50 text-emerald-800 px-3 py-1.5 font-bold uppercase hover:bg-emerald-100 shadow-[2px_2px_0px_0px_#059669] dark:border-white dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Share2 className="h-4 w-4" />
                <span>SHARE WA</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="border-2 border-slate-900 bg-slate-50 p-1.5 hover:bg-slate-100 dark:border-white dark:bg-dark-surface"
                title="Salin Tautan"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <ExternalLink className="h-4 w-4" />}
              </button>
            </div>

            {/* Admin Actions */}
            {user?.role === "admin" && (
              <div className="flex items-center space-x-1.5 bg-amber-50 p-1 border border-amber-400 dark:bg-amber-950/20 dark:border-amber-700">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 mr-1">
                  [ADMIN]:
                </span>
                <button
                  onClick={handleTogglePin}
                  className={`p-1 border border-slate-900 ${
                    thread.isPinned ? "bg-amber-400 text-slate-950" : "bg-white text-slate-800"
                  }`}
                  title={thread.isPinned ? "Lepas Pin" : "Sematkan di Atas"}
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleToggleLock}
                  className={`p-1 border border-slate-900 ${
                    thread.isLocked ? "bg-rose-500 text-white" : "bg-white text-slate-800"
                  }`}
                  title={thread.isLocked ? "Buka Kunci" : "Kunci Komentar"}
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDeleteThread}
                  className="p-1 border border-slate-900 bg-rose-600 text-white hover:bg-rose-700"
                  title="Hapus Thread"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* COMMENTS & DISCUSSION SECTION */}
          {/* ============================================================== */}
          <div className="mt-8 border-t-2 border-slate-900 pt-6 dark:border-white">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
              <h3 className="font-display text-lg font-black uppercase text-slate-900 dark:text-white">
                Balasan Komunitas ({commentsList.length})
              </h3>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {commentsList.length === 0 ? (
                <div className="border-2 border-dashed border-slate-300 p-6 text-center dark:border-steel-700">
                  <p className="font-mono text-xs text-slate-500 dark:text-steel-400">
                    Belum ada balasan pada topik ini. Jadilah yang pertama memberikan respons!
                  </p>
                </div>
              ) : (
                commentsList.map((c) => (
                  <div
                    key={c.id}
                    className="border-2 border-slate-900 bg-slate-50 p-3.5 shadow-[2px_2px_0px_0px_#000] dark:border-steel-700 dark:bg-dark-surface font-mono text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2 mb-2 dark:border-steel-700">
                      <div className="flex items-center space-x-2">
                        {c.authorAvatar ? (
                          <img
                            src={c.authorAvatar}
                            alt={c.authorNickname}
                            className="h-6 w-6 border border-slate-900 object-cover dark:border-white"
                          />
                        ) : (
                          <div className="h-6 w-6 border border-slate-900 bg-brand-blue text-white flex items-center justify-center font-black text-[10px] dark:border-white dark:bg-brand-cyan dark:text-slate-950">
                            {c.authorNickname.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-display font-black text-xs uppercase text-slate-900 dark:text-white">
                          {c.authorNickname}
                        </span>
                        {c.authorVerified && (
                          <span className="bg-emerald-500 text-slate-950 px-1 py-0.2 text-[8px] font-black border border-slate-950">
                            VERIFIED
                          </span>
                        )}
                        {c.authorRole === "admin" && (
                          <span className="bg-brand-blue text-white px-1 py-0.2 text-[8px] font-black">
                            HQ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-steel-500">
                        {new Date(c.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WITA
                      </span>
                    </div>

                    <div className="font-sans text-xs text-slate-800 dark:text-steel-200 leading-relaxed whitespace-pre-line pl-8">
                      {c.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            {thread.isLocked ? (
              <div className="mt-4 border-2 border-red-600 bg-red-50 p-3 font-mono text-xs font-bold text-red-800 dark:bg-red-950/30 dark:text-red-300">
                🔒 Topik diskusi ini telah dikunci oleh admin. Komentar baru telah ditutup.
              </div>
            ) : user ? (
              <form onSubmit={handleAddComment} className="mt-4">
                <div className="border-2 border-slate-900 p-2 bg-white dark:border-white dark:bg-dark-base shadow-[3px_3px_0px_0px_#0030FF]">
                  <textarea
                    rows={3}
                    placeholder={`Tulis balasan sebagai ${user.gameNickname || user.displayName}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-transparent p-1.5 font-sans text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-steel-700 pt-2 px-1">
                    <span className="font-mono text-[10px] text-slate-500 dark:text-steel-400">
                      Gunakan bahasa yang sopan & junjung sportivitas.
                    </span>
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="brutal-btn flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold bg-brand-blue text-white disabled:opacity-50"
                    >
                      <Send className="h-3 w-3" />
                      <span>{submittingComment ? "MENGIRIM..." : "KIRIM BALASAN"}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mt-4 border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-steel-700 dark:bg-dark-surface font-mono text-xs">
                <p className="text-slate-700 dark:text-steel-300 mb-2">
                  Kamu harus login sebagai member untuk ikut berdiskusi dan menulis balasan.
                </p>
                <a
                  href="/login"
                  className="inline-block border-2 border-slate-900 bg-brand-blue px-4 py-1.5 font-bold uppercase text-white shadow-[2px_2px_0px_0px_#000] hover:bg-blue-600 dark:border-white"
                >
                  Login Member
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
