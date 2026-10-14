import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey, pin, operator } = body;
    const incomingKey = (passkey || pin || "").trim();

    const validSecret = (process.env.ADMIN_SECRET || "cees2026").trim();

    if (!incomingKey || incomingKey !== validSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Passkey Administrator salah. Akses ke sektor komando ditolak.",
        },
        { status: 401 }
      );
    }

    const sessionPayload = {
      role: "admin",
      displayName: operator?.trim() || "Master Admin / Pengurus",
      authType: "passkey",
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Akses terminal admin berhasil diverifikasi.",
      user: sessionPayload,
      token: Buffer.from(JSON.stringify(sessionPayload)).toString("base64"),
    });
  } catch (error) {
    console.error("Error pada /api/auth/admin-login:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server saat memvalidasi akses." },
      { status: 500 }
    );
  }
}
