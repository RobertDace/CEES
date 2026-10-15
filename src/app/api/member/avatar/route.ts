import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifySessionToken, signSessionToken } from "@/lib/security";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import {
  resolveMemberProfile,
  readLocalMembers,
  saveLocalMembers,
  readLocalAccounts,
  saveLocalAccounts,
  normalizeNickname,
} from "@/lib/memberHelper";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    // 2. Ambil File & Data URI dari FormData
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    const clientDataUrl = (formData.get("avatarDataUrl") as string | null) || "";
    const formNickname = (formData.get("nickname") as string | null) || "";
    const formMemberId = (formData.get("memberId") as string | null) || "";

    // Fallback ID jika cookie sempat tertunda di browser
    if (!memberId) {
      memberId = formMemberId || formNickname || null;
    }

    // Jika tidak ada sesi valid sama sekali
    if (!memberId && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan atau telah kedaluwarsa. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (!file && !clientDataUrl) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file foto yang dipilih." },
        { status: 400 }
      );
    }

    // 3. Validasi Format & Ekstensi Gambar
    const rawExt = file ? path.extname(file.name || "") || ".jpg" : ".jpg";
    const ext = rawExt.toLowerCase();
    const isImageMime = Boolean(file?.type && file.type.toLowerCase().startsWith("image/"));
    const isImageExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".jfif", ".bmp", ".svg"].includes(ext);
    const isDataUrlImage = clientDataUrl.startsWith("data:image/");

    if (!isImageMime && !isImageExt && !isDataUrlImage) {
      return NextResponse.json(
        { success: false, error: "Format file harus berupa gambar (JPG, PNG, atau WebP)." },
        { status: 400 }
      );
    }

    // 4. Siapkan URL Foto (Kompatibel Vercel Serverless & Localhost)
    let publicUrl = clientDataUrl;

    if (!publicUrl && file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = isImageMime ? file.type.toLowerCase() : "image/jpeg";
      publicUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    // Jika bukan di lingkungan Vercel dan file tersedia, coba simpan juga ke public/uploads/
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (!isVercel && file) {
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const safeNick = (verifiedSession?.gameNickname || formNickname || "avatar")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .slice(0, 15);
        const filename = `avatar_${safeNick}_${Date.now()}${ext === ".jfif" ? ".jpg" : ext}`;
        const destination = path.join(uploadsDir, filename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(destination, buffer);
        publicUrl = `/uploads/${filename}`;
      } catch (fsErr) {
        console.warn("Lingkungan read-only / filesystem tidak writable, fallback ke Data URI:", fsErr);
        // Tetap gunakan publicUrl berbasis Data URI
      }
    }

    // 5. Sinkronisasi Avatar ke Data Member & Akun
    let realMemberId = memberId;
    let resolvedNick = verifiedSession?.gameNickname || formNickname || "";

    if (!isAdmin) {
      const { member } = await resolveMemberProfile({
        memberId,
        gameNickname: verifiedSession?.gameNickname || formNickname,
        email: verifiedSession?.email,
        accountId: verifiedSession?.uid,
      });

      if (member) {
        realMemberId = member.id;
        resolvedNick = member.gameNickname || resolvedNick;
      }

      // Perbarui di liveMembers.json jika filesystem mengizinkan
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

      // Perbarui juga di memberAccounts.json jika filesystem mengizinkan
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

      // 6. Perbarui di Cloud Firestore (Ini yang membuat data persisten di Vercel!)
      if (isFirebaseConfigured && db && realMemberId && realMemberId !== "admin_hq") {
        try {
          const memberRef = doc(db, "members", realMemberId);
          await setDoc(
            memberRef,
            {
              avatarUrl: publicUrl,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (fsErr) {
          console.warn("Gagal update avatar di Firestore:", fsErr);
        }
      }
    }

    // 7. Refresh Cookie Sesi Member
    const response = NextResponse.json({
      success: true,
      message: "Foto profil member berhasil diperbarui!",
      avatarUrl: publicUrl,
    });

    if (verifiedSession) {
      // PENTING: Jangan simpan Base64 Data URI ke dalam cookie karena cookie dibatasi maksimal 4KB
      const cookieAvatar =
        publicUrl && !publicUrl.startsWith("data:") && publicUrl.length < 255
          ? publicUrl
          : verifiedSession.avatarUrl && !verifiedSession.avatarUrl.startsWith("data:")
          ? verifiedSession.avatarUrl
          : "/assets/default_avatar.jpg";

      const refreshedSession = {
        ...verifiedSession,
        avatarUrl: cookieAvatar,
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
