import { NextRequest, NextResponse } from "next/server";
import { signSessionToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = body;

    if (!user || (!user.role && !user.uid)) {
      return NextResponse.json(
        { success: false, error: "Data sesi tidak valid." },
        { status: 400 }
      );
    }

    const now = Date.now();

    // 1. Sinkronisasi Sesi Admin
    if (user.role === "admin") {
      const sessionPayload = {
        role: "admin",
        uid: user.uid,
        displayName: user.displayName || "Admin Operator",
        email: user.email || null,
        authType: user.authType || "firebase",
        authenticatedAt: user.authenticatedAt || new Date().toISOString(),
        expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      };

      const token = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

      const response = NextResponse.json({
        success: true,
        message: "Sesi admin server berhasil sinkron.",
        user: sessionPayload,
      });

      response.cookies.set({
        name: "cees_admin_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60,
      });

      return response;
    }

    // 2. Sinkronisasi Sesi Member
    const memberSessionPayload = {
      uid: user.uid || `acc_${now}`,
      memberId: user.memberId || user.uid,
      role: "member",
      displayName: user.displayName || user.gameNickname || "Member CEES",
      gameNickname: user.gameNickname || user.displayName || "Member CEES",
      division: user.division || "ALL",
      email: user.email || null,
      avatarUrl:
        user.avatarUrl &&
        !user.avatarUrl.startsWith("data:") &&
        user.avatarUrl.length < 255
          ? user.avatarUrl
          : "/assets/default_avatar.jpg",
      verified: Boolean(user.verified),
      authType: user.authType || "nickname",
      authenticatedAt: user.authenticatedAt || new Date().toISOString(),
      expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const token = signSessionToken(memberSessionPayload);

    const response = NextResponse.json({
      success: true,
      message: "Sesi member server berhasil sinkron.",
      user: memberSessionPayload,
      token,
    });

    response.cookies.set({
      name: "cees_member_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("Error setting session cookie:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan sesi server." },
      { status: 500 }
    );
  }
}

