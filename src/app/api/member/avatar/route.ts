import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifySessionToken } from "@/lib/security";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  resolveMemberProfile,
  readLocalMembers,
  saveLocalMembers,
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
    // 1. Verifikasi Sesi Member atau Admin
    const token = req.cookies.get("cees_member_token")?.value;
    const adminToken = req.cookies.get("cees_admin_token")?.value;

    let memberId = "admin_hq";

    if (!token && adminToken) {
      try {
        const decoded = JSON.parse(Buffer.from(adminToken, "base64").toString("utf-8"));
        if (!decoded || decoded.role !== "admin") {
          return NextResponse.json({ success: false, error: "Sesi admin tidak valid." }, { status: 401 });
        }
        memberId = "admin_hq";
      } catch (e) {
        return NextResponse.json({ success: false, error: "Sesi admin tidak dapat dibaca." }, { status: 401 });
      }
    } else if (token) {
      const session = verifySessionToken(token);
      if (!session || !session.memberId) {
        return NextResponse.json(
          { success: false, error: "Sesi tidak valid atau telah kedaluwarsa." },
          { status: 401 }
        );
      }
      memberId = session.memberId;
    } else {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    ensureUploadsDir();

    // 2. Ambil File dari FormData
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file foto yang dipilih." },
        { status: 400 }
      );
    }

    // 3. Validasi Tipe File (Gambar)
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format file harus berupa gambar (JPG, PNG, atau WebP)." },
        { status: 400 }
      );
    }

    // 4. Batasan Ukuran Maksimal 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file foto maksimal adalah 5 MB." },
        { status: 400 }
      );
    }

    // 5. Simpan File ke Storage Server
    const ext = path.extname(file.name) || ".png";
    const filename = `avatar_${memberId}_${Date.now()}${ext}`;
    const destination = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(destination, buffer);

    const publicUrl = `/uploads/${filename}`;

    // 6. Perbarui Avatar di Data Member Lokal & Firestore
    let realMemberId = memberId;
    if (memberId !== "admin_hq") {
      const { member } = await resolveMemberProfile({ memberId });
      if (member) {
        realMemberId = member.id;
      }
    }

    const members = readLocalMembers();
    const memberIndex = members.findIndex((m: any) => m.id === realMemberId);

    if (memberIndex !== -1) {
      members[memberIndex].avatarUrl = publicUrl;
      members[memberIndex].updatedAt = new Date().toISOString();
      saveLocalMembers(members);
    }

    // 7. Perbarui di Firestore jika terhubung
    if (isFirebaseConfigured && db && realMemberId !== "admin_hq") {
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

    return NextResponse.json({
      success: true,
      message: "Foto profil member berhasil diperbarui!",
      avatarUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error pada upload avatar member:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengunggah foto profil." },
      { status: 500 }
    );
  }
}
