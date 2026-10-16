import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const contentFilePath = path.join(process.cwd(), "src", "data", "siteContent.json");
const tmpContentPath = path.join(os.tmpdir(), "cees_siteContent.json");

declare global {
  var __cees_site_content: any;
}

function readSiteContent() {
  if (globalThis.__cees_site_content) {
    return globalThis.__cees_site_content;
  }
  try {
    if (fs.existsSync(tmpContentPath)) {
      const data = fs.readFileSync(tmpContentPath, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed) {
        globalThis.__cees_site_content = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  try {
    if (fs.existsSync(contentFilePath)) {
      const data = fs.readFileSync(contentFilePath, "utf-8");
      const parsed = JSON.parse(data);
      globalThis.__cees_site_content = parsed;
      return parsed;
    }
  } catch (err) {
    console.error("Gagal membaca siteContent.json:", err);
  }
  return null;
}

function writeSiteContent(data: any): boolean {
  globalThis.__cees_site_content = data;
  try {
    fs.writeFileSync(tmpContentPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}

  try {
    fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.log("Vercel filesystem read-only: site content disimpan ke memory & /tmp.");
  }
  return true;
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

    // Deteksi nama operator pengubah
    const tokenCookie = req.cookies.get("cees_admin_token")?.value;
    let detectedOperator = payload.operatorName || payload.operator;
    if (!detectedOperator && tokenCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(tokenCookie, "base64").toString("utf-8"));
        detectedOperator = decoded.displayName;
      } catch (e) {
        // ignore error
      }
    }
    const operator = detectedOperator || "Admin Operator";

    // Catat ke Audit Trail
    const auditLog = Array.isArray(currentContent.auditLog) ? [...currentContent.auditLog] : [];
    const changedFields = Object.keys(payload).filter(
      (k) => !["operatorName", "operator", "lastUpdated", "lastUpdatedBy", "auditLog"].includes(k)
    );

    auditLog.unshift({
      id: `audit_${Date.now()}`,
      operator,
      action: "UPDATE_CMS_CONTENT",
      fields: changedFields,
      timestamp: new Date().toISOString(),
    });

    const updatedContent = {
      ...currentContent,
      ...payload,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: operator,
      auditLog: auditLog.slice(0, 30), // simpan 30 histori perubahan terakhir
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
