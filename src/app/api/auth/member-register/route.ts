import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { hashPassword, signSessionToken } from "@/lib/security";

const accountsFilePath = path.join(process.cwd(), "src", "data", "memberAccounts.json");
const membersFilePath = path.join(process.cwd(), "src", "data", "liveMembers.json");

function readAccounts(): any[] {
  try {
    if (fs.existsSync(accountsFilePath)) {
      return JSON.parse(fs.readFileSync(accountsFilePath, "utf-8"));
    }
  } catch (err) {
    console.error("Gagal membaca memberAccounts.json:", err);
  }
  return [];
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

function saveAccounts(accs: any[]) {
  try {
    fs.writeFileSync(accountsFilePath, JSON.stringify(accs, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan memberAccounts.json:", err);
  }
}

function saveMembers(mems: any[]) {
  try {
    fs.writeFileSync(membersFilePath, JSON.stringify(mems, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan liveMembers.json:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gameNickname,
      whatsapp,
      password,
      fullName,
      division = "MLBB",
      city = "Samarinda",
      email,
    } = body;

    const cleanNick = (gameNickname || "").trim();
    const cleanWa = (whatsapp || "").trim().replace(/[^0-9]/g, "");
    const cleanPass = (password || "").trim();

    if (!cleanNick || !cleanPass) {
      return NextResponse.json(
        { success: false, error: "Nickname in-game dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (cleanPass.length < 6) {
      return NextResponse.json(
        { success: false, error: "Kata sandi minimal harus 6 karakter demi keamanan." },
        { status: 400 }
      );
    }

    const accounts = readAccounts();
    const members = readMembers();

    // 1. Cek apakah Nickname sudah memiliki akun terdaftar
    const existingAccount = accounts.find(
      (a: any) => a.gameNickname && a.gameNickname.toLowerCase() === cleanNick.toLowerCase()
    );

    if (existingAccount) {
      return NextResponse.json(
        {
          success: false,
          error: `Akun dengan nickname '${cleanNick}' sudah aktif. Silakan langsung login di form masuk.`,
        },
        { status: 409 }
      );
    }

    // 2. Cek apakah member sudah pernah mendaftar di Roster liveMembers
    let targetMember = members.find(
      (m: any) => m.gameNickname && m.gameNickname.toLowerCase() === cleanNick.toLowerCase()
    );

    // Jika member sudah ada di roster, verifikasi kecocokan nomor WhatsApp
    if (targetMember) {
      const storedWa = (targetMember.whatsapp || "").replace(/[^0-9]/g, "");
      // Ambil 8 digit terakhir untuk toleransi format 0812 vs 62812
      const endWa = cleanWa.slice(-8);
      const endStored = storedWa.slice(-8);

      if (cleanWa && storedWa && endWa !== endStored) {
        return NextResponse.json(
          {
            success: false,
            error: "Nomor WhatsApp verifikasi tidak cocok dengan data pendaftaran di roster.",
          },
          { status: 403 }
        );
      }
    } else {
      // 3. Jika member baru, buatkan data di liveMembers
      const newMemberId = `mem_${Date.now()}`;
      targetMember = {
        id: newMemberId,
        fullName: fullName?.trim() || cleanNick,
        gameNickname: cleanNick,
        whatsapp: cleanWa,
        division: division.toUpperCase(),
        city: city || "Samarinda",
        playerType: "Santai Mabar",
        verified: false,
        status: "MEMBER BARU",
        avatarUrl: "/assets/default_avatar.jpg",
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        submittedAtIso: new Date().toISOString(),
      };
      members.push(targetMember);
      saveMembers(members);
    }

    // 4. Enkripsi password menggunakan Scrypt
    const { hash, salt } = hashPassword(cleanPass);

    const newAccount = {
      id: `acc_${Date.now()}`,
      memberId: targetMember.id,
      gameNickname: targetMember.gameNickname,
      email: email?.trim().toLowerCase() || null,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveAccounts(accounts);

    // 5. Buat Sesi Login Otomatis
    const now = Date.now();
    const session = {
      uid: newAccount.id,
      memberId: targetMember.id,
      role: "member",
      displayName: targetMember.gameNickname,
      gameNickname: targetMember.gameNickname,
      division: targetMember.division || "ALL",
      email: newAccount.email,
      avatarUrl: targetMember.avatarUrl || "/assets/default_avatar.jpg",
      verified: Boolean(targetMember.verified),
      authType: "nickname",
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const token = signSessionToken(session);

    const response = NextResponse.json({
      success: true,
      message: "Akun member berhasil dibuat dan terverifikasi!",
      user: session,
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
    console.error("Error pada /api/auth/member-register:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pendaftaran akun member." },
      { status: 500 }
    );
  }
}
