import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = body;

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Data sesi tidak valid." },
        { status: 400 }
      );
    }

    const sessionPayload = {
      role: "admin",
      uid: user.uid,
      displayName: user.displayName || "Admin Operator",
      email: user.email || null,
      authType: user.authType || "firebase",
      authenticatedAt: user.authenticatedAt || new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
  } catch (err) {
    console.error("Error setting session cookie:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan sesi server." },
      { status: 500 }
    );
  }
}
