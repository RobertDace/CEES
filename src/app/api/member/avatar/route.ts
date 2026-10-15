import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifySessionToken, signSessionToken } from "@/lib/security";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  resolveMemberProfile,
  readLocalMembers,
  saveLocalMembers,
  readLocalAccounts,
  saveLocalAccounts,
  normalizeNickname,
} from "@/lib/memberHelper";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    ensureUploadsDir();

    // 1. Ekstraksi Token dari Cookie atau Authorization Header
    let token = req.cookies.get("cees_member_token")?.value;
    const adminToken = req.cookies.get("cees_admin_token")?.value;

    const authHeader = req.headers.get("authorization");
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    let memberId: string | null = null;
    let isAdmin = false;
    let verifiedSession: any = null;

    // Cek Sesi Admin
    if (adminToken) {
      try {
        const decoded = JSON.parse(Buffer.from(adminToken, "base64").toString("utf-8"));
        if (decoded && decoded.role === "admin") {
          isAdmin = true;
          memberId = "admin_hq";
        }
      } catch (e) {
        // Abaikan parse error, lanjut ke pengecekan token member
      }
    }

    // Cek Sesi Member
    if (!isAdmin && token) {
      const session = verifySessionToken(token);
      if (session) {
        verifiedSession = session;
        memberId = session.memberId || session.uid || null;
      }
    }

    // Jika tidak ada sesi valid
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan atau telah kedaluwarsa. Silakan login kembali." },
        { status: 401 }
      );
    }

    // 2. Ambil File dari FormData
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file foto yang dipilih." },
        { status: 400 }
      );
    }

    // 3. Validasi Format & Ekstensi Gambar (Toleran terhadap berbagai perangkat & browser)
    const rawExt = path.extname(file.name || "") || ".png";
    const ext = rawExt.toLowerCase();
    const isImageMime = Boolean(file.type && file.type.toLowerCase().startsWith("image/"));
    const isImageExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".jfif", ".bmp", ".svg"].includes(ext);

    if (!isImageMime && !isImageExt) {
      return NextResponse.json(
        { success: false, error: "Format file harus berupa gambar (JPG, PNG, atau WebP)." },
        { status: 400 }
      );
    }

    // 4. Batasan Ukuran Maksimal 15MB
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file foto maksimal adalah 15 MB." },
        { status: 400 }
      );
    }

    // 5. Simpan File ke Folder public/uploads
    const safeNick = verifiedSession?.gameNickname
      ? verifiedSession.gameNickname.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 15)
      : "avatar";
    const filename = `avatar_${safeNick}_${Date.now()}${ext === ".jfif" ? ".jpg" : ext}`;
    const destination = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(destination, buffer);

    const publicUrl = `/uploads/${filename}`;

    // 6. Sinkronisasi Avatar ke Data Member & Akun
    let realMemberId = memberId;
    let resolvedNick = verifiedSession?.gameNickname || "";

    if (!isAdmin) {
      const { member } = await resolveMemberProfile({
        memberId,
        gameNickname: verifiedSession?.gameNickname,
        email: verifiedSession?.email,
        accountId: verifiedSession?.uid,
      });

      if (member) {
        realMemberId = member.id;
        resolvedNick = member.gameNickname || resolvedNick;
      }

      // Perbarui di liveMembers.json
      const members = readLocalMembers();
      const memberIndex = members.findIndex(
        (m: any) =>
          m.id === realMemberId ||
          (resolvedNick && normalizeNickname(m.gameNickname || "") === normalizeNickname(resolvedNick))
      );

      if (memberIndex !== -1) {
        members[memberIndex].avatarUrl = publicUrl;
        members[memberIndex].updatedAt = new Date().toISOString();
        saveLocalMembers(members);
      }

      // Perbarui juga di memberAccounts.json
      const accounts = readLocalAccounts();
      const accIndex = accounts.findIndex(
        (a: any) =>
          a.id === verifiedSession?.uid ||
          a.memberId === realMemberId ||
          (resolvedNick && normalizeNickname(a.gameNickname || "") === normalizeNickname(resolvedNick))
      );

      if (accIndex !== -1) {
        accounts[accIndex].avatarUrl = publicUrl;
        accounts[accIndex].updatedAt = new Date().toISOString();
        saveLocalAccounts(accounts);
      }

      // Perbarui di Firestore jika terhubung
      if (isFirebaseConfigured && db && realMemberId && realMemberId !== "admin_hq") {
        try {
          const memberRef = doc(db, "members", realMemberId);
          await updateDoc(memberRef, {
            avatarUrl: publicUrl,
            updatedAt: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.warn("Gagal update avatar di Firestore:", fsErr);
        }
      }
    }

    // 7. Refresh Cookie Sesi Member jika login sebagai member
    const response = NextResponse.json({
      success: true,
      message: "Foto profil member berhasil diperbarui!",
      avatarUrl: publicUrl,
    });

    if (verifiedSession) {
      const refreshedSession = {
        ...verifiedSession,
        avatarUrl: publicUrl,
        memberId: realMemberId,
      };
      const newToken = signSessionToken(refreshedSession);
      response.cookies.set({
        name: "cees_member_token",
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Error pada upload avatar member:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses unggahan foto profil. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
