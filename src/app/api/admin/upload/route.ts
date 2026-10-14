import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    ensureUploadsDir();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file gambar yang diunggah." },
        { status: 400 }
      );
    }

    // Check mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format file harus berupa gambar (JPG, PNG, WebP, GIF, atau SVG)." },
        { status: 400 }
      );
    }

    // Max 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal adalah 10 MB." },
        { status: 400 }
      );
    }

    // Clean extension
    const ext = path.extname(file.name) || ".png";
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 30);

    const filename = `${category}_${Date.now()}_${cleanBase}${ext}`;
    const destination = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(destination, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      message: "Gambar berhasil diunggah ke server!",
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses unggahan gambar." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl || !targetUrl.startsWith("/uploads/")) {
      return NextResponse.json(
        { success: false, error: "Path file tidak valid atau bukan file upload." },
        { status: 400 }
      );
    }

    // Prevent directory traversal
    const safeFilename = path.basename(targetUrl);
    const filePath = path.join(uploadsDir, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true, message: "Foto berhasil dihapus dari server." });
    } else {
      return NextResponse.json(
        { success: false, error: "File foto tidak ditemukan di folder upload." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus file foto." },
      { status: 500 }
    );
  }
}
