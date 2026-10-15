import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifySessionToken } from "@/lib/security";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const membersFilePath = path.join(process.cwd(), "src", "data", "liveMembers.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function readMembers(): any[] {
  try {
    if (fs.existsSync(membersFilePath)) {
      return JSON.parse(fs.readFileSync(membersFilePath, "utf-8"));
    }
  } catch (err) {
    console.error("Gagal membaca liveMembers.json:", err);
  }
  return [];
}

function saveMembers(mems: any[]) {
  try {
    fs.writeFileSync(membersFilePath, JSON.stringify(mems, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan liveMembers.json:", err);
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

    // 6. Perbarui Avatar di Data Member Lokal
    const members = readMembers();
    const memberIndex = members.findIndex((m: any) => m.id === memberId);

    if (memberIndex !== -1) {
      members[memberIndex].avatarUrl = publicUrl;
      members[memberIndex].updatedAt = new Date().toISOString();
      saveMembers(members);
    }

    // 7. Perbarui di Firestore jika terhubung
    if (isFirebaseConfigured && db && memberId !== "admin_hq") {
      try {
        const memberRef = doc(db, "members", memberId);
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
