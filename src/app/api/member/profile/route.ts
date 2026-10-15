import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifySessionToken } from "@/lib/security";

const membersFilePath = path.join(process.cwd(), "src", "data", "liveMembers.json");

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

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("cees_member_token")?.value;
    const adminToken = req.cookies.get("cees_admin_token")?.value;

    // Sesi Admin Khusus
    if (!token && adminToken) {
      try {
        const decoded = JSON.parse(Buffer.from(adminToken, "base64").toString("utf-8"));
        if (decoded && decoded.role === "admin") {
          return NextResponse.json({
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
          });
        }
      } catch (e) {
        console.warn("Gagal parse token admin:", e);
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, error: "Sesi tidak ditemukan. Silakan login." }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid atau telah kedaluwarsa." }, { status: 401 });
    }

    const members = readMembers();
    const member = members.find((m: any) => m.id === session.memberId);

    if (!member) {
      return NextResponse.json({ success: false, error: "Profil member tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
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
        verified: Boolean(member.verified),
        status: member.status || "MEMBER RESMI",
        avatarUrl: member.avatarUrl || "/assets/default_avatar.jpg",
        joinedAt: member.timestamp || member.submittedAtIso || new Date().toISOString(),
      },
    });
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
    if (!session || !session.memberId) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid." }, { status: 401 });
    }

    const body = await req.json();
    const { gameId, discordTag, city, playerType, avatarUrl, motivation } = body;

    const members = readMembers();
    const index = members.findIndex((m: any) => m.id === session.memberId);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Member tidak ditemukan." }, { status: 404 });
    }

    // Update field yang diizinkan saja (nama lengkap & nomor WA dikunci agar tidak disalahgunakan)
    members[index] = {
      ...members[index],
      gameId: gameId !== undefined ? String(gameId).trim().slice(0, 50) : members[index].gameId,
      discordTag: discordTag !== undefined ? String(discordTag).trim().slice(0, 40) : members[index].discordTag,
      city: city !== undefined ? String(city).trim().slice(0, 50) : members[index].city,
      playerType: playerType !== undefined ? String(playerType).trim().slice(0, 30) : members[index].playerType,
      avatarUrl: avatarUrl !== undefined ? String(avatarUrl).trim() : members[index].avatarUrl,
      motivation: motivation !== undefined ? String(motivation).trim().slice(0, 200) : members[index].motivation,
      updatedAt: new Date().toISOString(),
    };

    saveMembers(members);

    return NextResponse.json({
      success: true,
      message: "Profil member berhasil diperbarui!",
      profile: members[index],
    });
  } catch (err) {
    console.error("Error pada PUT /api/member/profile:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui profil." }, { status: 500 });
  }
}
