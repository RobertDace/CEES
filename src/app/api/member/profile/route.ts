import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, signSessionToken } from "@/lib/security";
import {
  resolveMemberProfile,
  readLocalMembers,
  saveLocalMembers,
  getAllMembers,
} from "@/lib/memberHelper";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("cees_member_token")?.value;
    const adminToken = req.cookies.get("cees_admin_token")?.value;

    // 1. Sesi Admin Khusus
    if (!token && adminToken) {
      try {
        const decoded = JSON.parse(Buffer.from(adminToken, "base64").toString("utf-8"));
        if (decoded && decoded.role === "admin") {
          return NextResponse.json(
            {
              success: true,
              isAdmin: true,
              profile: {
                id: "ADMIN-HQ-01",
                fullName: decoded.displayName || "Pengurus Resmi CEES AREA",
                gameNickname: decoded.displayName || "ADMIN CEES",
                gameId: "STAFF-HQ-01",
                division: "HQ COMMAND",
                city: "Samarinda",
                whatsapp: "085705035765",
                discordTag: "ceesgank#admin",
                playerType: "Staff & Management",
                motivation: "Mengawal ekosistem e-sport Samarinda & keluarga besar CEES GANK.",
                verified: true,
                status: "STAFF PENGURUS",
                avatarUrl: "/assets/default_avatar.jpg",
                joinedAt: "4 Okt 2024",
              },
            },
            {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
              },
            }
          );
        }
      } catch (e) {
        console.warn("Gagal parse token admin:", e);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan. Silakan login." },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    // 2. Cari member menggunakan resolveMemberProfile yang cerdas (toleran tanda baca, 0 vs O, dan auto-healing)
    const { member, healed } = await resolveMemberProfile({
      memberId: session.memberId,
      gameNickname: session.gameNickname || session.displayName,
      email: session.email,
      accountId: session.uid,
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Profil member tidak ditemukan di daftar anggota aktif." },
        { status: 404 }
      );
    }

    const isMemberVerified = Boolean(member.verified);
    const memberStatus = member.status || (isMemberVerified ? "VERIFIED" : "MENUNGGU WA");

    const profileData = {
      id: member.id,
      fullName: member.fullName,
      gameNickname: member.gameNickname,
      gameId: member.gameId || "",
      division: member.division || "ALL",
      city: member.city || "Samarinda",
      whatsapp: member.whatsapp || "",
      discordTag: member.discordTag || "",
      playerType: member.playerType || "Member",
      motivation: member.motivation || "",
      verified: isMemberVerified,
      status: memberStatus,
      avatarUrl: member.avatarUrl || "/assets/default_avatar.jpg",
      joinedAt: member.timestamp || member.submittedAtIso || new Date().toISOString(),
    };

    const response = NextResponse.json(
      {
        success: true,
        profile: profileData,
        healed,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );

    // 3. Jika sesi lama tidak sinkron (misal status verifikasi berubah dari false ke true, atau memberId berubah),
    // perbarui cookie sesi pengguna secara otomatis!
    if (healed || session.memberId !== member.id || session.verified !== isMemberVerified) {
      const now = Date.now();
      const updatedSession = {
        ...session,
        memberId: member.id,
        gameNickname: member.gameNickname,
        displayName: member.gameNickname,
        division: member.division || session.division || "ALL",
        avatarUrl: member.avatarUrl || session.avatarUrl || "/assets/default_avatar.jpg",
        verified: isMemberVerified,
        expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      const newToken = signSessionToken(updatedSession);

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
  } catch (err) {
    console.error("Error pada GET /api/member/profile:", err);
    return NextResponse.json({ success: false, error: "Gagal mengambil data profil." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("cees_member_token")?.value;
    const adminToken = req.cookies.get("cees_admin_token")?.value;

    if (!token && adminToken) {
      const body = await req.json();
      return NextResponse.json({
        success: true,
        message: "Profil staf pengurus berhasil diperbarui!",
        profile: {
          id: "ADMIN-HQ-01",
          gameNickname: "ADMIN CEES",
          ...body,
        },
      });
    }

    if (!token) {
      return NextResponse.json({ success: false, error: "Sesi tidak ditemukan." }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid." }, { status: 401 });
    }

    const { member } = await resolveMemberProfile({
      memberId: session.memberId,
      gameNickname: session.gameNickname || session.displayName,
      email: session.email,
      accountId: session.uid,
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Member tidak ditemukan." }, { status: 404 });
    }

    const body = await req.json();
    const { gameId, discordTag, city, playerType, avatarUrl, motivation } = body;

    const members = readLocalMembers();
    const index = members.findIndex((m: any) => m.id === member.id);

    const updatePayload: any = {
      gameId: gameId !== undefined ? String(gameId).trim().slice(0, 50) : member.gameId,
      discordTag: discordTag !== undefined ? String(discordTag).trim().slice(0, 40) : member.discordTag,
      city: city !== undefined ? String(city).trim().slice(0, 50) : member.city,
      playerType: playerType !== undefined ? String(playerType).trim().slice(0, 30) : member.playerType,
      avatarUrl: avatarUrl !== undefined ? String(avatarUrl).trim() : member.avatarUrl,
      motivation: motivation !== undefined ? String(motivation).trim().slice(0, 200) : member.motivation,
      updatedAt: new Date().toISOString(),
    };

    if (index !== -1) {
      members[index] = {
        ...members[index],
        ...updatePayload,
      };
      saveLocalMembers(members);
    }

    // Perbarui juga ke Firestore jika terkonfigurasi
    if (isFirebaseConfigured && db && member.id) {
      try {
        await updateDoc(doc(db, "members", member.id), updatePayload);
      } catch (fsErr) {
        console.warn("Gagal update profil member ke Firestore:", fsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profil member berhasil diperbarui!",
      profile: {
        ...member,
        ...updatePayload,
      },
    });
  } catch (err) {
    console.error("Error pada PUT /api/member/profile:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui profil." }, { status: 500 });
  }
}
