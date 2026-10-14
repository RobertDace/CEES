import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const contentFilePath = path.join(process.cwd(), "src", "data", "siteContent.json");

function readSiteContent() {
  try {
    if (fs.existsSync(contentFilePath)) {
      const data = fs.readFileSync(contentFilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Gagal membaca siteContent.json:", err);
  }
  return null;
}

function writeSiteContent(data: any) {
  try {
    fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Gagal menulis siteContent.json:", err);
    return false;
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const content = readSiteContent();
    if (!content) {
      return NextResponse.json(
        { success: false, error: "File konten situs tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat membaca konten." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { success: false, error: "Data perubahan tidak valid." },
        { status: 400 }
      );
    }

    const currentContent = readSiteContent() || {};
    const updatedContent = {
      ...currentContent,
      ...payload,
      lastUpdated: new Date().toISOString(),
    };

    const saved = writeSiteContent(updatedContent);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan perubahan ke media penyimpanan." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Konten website berhasil disimpan dan diperbarui secara realtime!",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error pada /api/admin/content:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
