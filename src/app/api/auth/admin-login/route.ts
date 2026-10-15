import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

// In-memory brute force protection map: IP -> Record
const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 menit kunci

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();
    const rateData = rateLimitMap.get(clientIp);

    // 1. Cek apakah IP sedang dikunci
    if (rateData && rateData.lockedUntil > now) {
      const remainingMinutes = Math.ceil((rateData.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `[SECURITY LOCKOUT] Terlalu banyak percobaan passkey salah. Terminal akses dikunci untuk IP Anda selama ${remainingMinutes} menit ke depan.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { passkey, pin, operator } = body;
    const incomingKey = (passkey || pin || "").trim();

    const validSecret = (process.env.ADMIN_SECRET || "cees2026").trim();

    // 2. Validasi Passkey
    if (!incomingKey || incomingKey !== validSecret) {
      const currentAttempts = (rateData ? rateData.attempts : 0) + 1;

      if (currentAttempts >= MAX_ATTEMPTS) {
        rateLimitMap.set(clientIp, {
          attempts: currentAttempts,
          lockedUntil: now + LOCKOUT_MS,
        });
        return NextResponse.json(
          {
            success: false,
            error: "[AKSES DITOLAK] Batas 5 kali percobaan tercapai. Terminal admin dikunci selama 15 menit.",
          },
          { status: 429 }
        );
      }

      rateLimitMap.set(clientIp, {
        attempts: currentAttempts,
        lockedUntil: 0,
      });

      const remainingAttempts = MAX_ATTEMPTS - currentAttempts;
      return NextResponse.json(
        {
          success: false,
          error: `Passkey Administrator salah. Sisa kesempatan: ${remainingAttempts} kali.`,
        },
        { status: 401 }
      );
    }

    // 3. Login Berhasil: Reset Rate Limit Counter
    rateLimitMap.delete(clientIp);

    const sessionPayload = {
      role: "admin",
      displayName: operator?.trim() || "Master Admin / Pengurus",
      authType: "passkey",
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    };

    const token = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Akses terminal admin berhasil diverifikasi.",
      user: sessionPayload,
      token,
    });

    // 4. Set HTTP-Only Cookie untuk Server & Middleware Protection
    response.cookies.set({
      name: "cees_admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 jam
    });

    return response;
  } catch (error) {
    console.error("Error pada /api/auth/admin-login:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server saat memvalidasi akses." },
      { status: 500 }
    );
  }
}
