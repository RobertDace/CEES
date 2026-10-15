import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signSessionToken } from "@/lib/security";
import {
  readLocalAccounts,
  saveLocalAccounts,
  getAllMembers,
  findMemberInList,
  resolveMemberProfile,
  normalizeNickname,
} from "@/lib/memberHelper";

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const now = Date.now();
    const rateData = rateLimitMap.get(clientIp);

    // 1. Cek Rate Limiting Anti Brute-Force
    if (rateData && rateData.lockedUntil > now) {
      const remainingMinutes = Math.ceil((rateData.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `[SECURITY] Terlalu banyak percobaan gagal. Akses ditangguhkan selama ${remainingMinutes} menit.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { loginType = "credentials", identifier, password, googleUser } = body;

    const accounts = readLocalAccounts();
    const members = await getAllMembers();

    // 2. Alur Login Google
    if (loginType === "google") {
      if (!googleUser || !googleUser.email) {
        return NextResponse.json(
          { success: false, error: "Data otentikasi Google tidak lengkap." },
          { status: 400 }
        );
      }

      const googleEmail = googleUser.email.toLowerCase().trim();

      // Cari akun atau selaraskan dengan profil member
      let account = accounts.find((a: any) => a.email && a.email.toLowerCase() === googleEmail);
      const { member } = await resolveMemberProfile({
        email: googleEmail,
        gameNickname: googleUser.displayName,
        accountId: account?.id,
      });

      if (!account) {
        const newAccountId = `g_${Date.now()}`;
        const matchedMemberId = member ? member.id : `m_${Date.now()}`;

        account = {
          id: newAccountId,
          memberId: matchedMemberId,
          email: googleEmail,
          gameNickname: member ? member.gameNickname : (googleUser.displayName?.split(" ")[0] || "Player"),
          authProvider: "google",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        accounts.push(account);
        saveLocalAccounts(accounts);
      }

      const isMemberVerified = Boolean(member?.verified);
      const session = {
        uid: account.id,
        memberId: member ? member.id : account.memberId,
        role: "member",
        displayName: member ? member.gameNickname : googleUser.displayName,
        gameNickname: member ? member.gameNickname : googleUser.displayName,
        division: member ? member.division : "ALL",
        email: googleEmail,
        avatarUrl: googleUser.photoURL || member?.avatarUrl || "/assets/default_avatar.jpg",
        verified: isMemberVerified,
        authType: "google",
        authenticatedAt: new Date().toISOString(),
        expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const token = signSessionToken(session);
      const response = NextResponse.json({
        success: true,
        message: "Login Google berhasil!",
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
    }

    // 3. Alur Login Kredensial (Nickname / Email + Password)
    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) {
      return NextResponse.json(
        { success: false, error: "Nickname/Email dan Kata Sandi wajib diisi." },
        { status: 400 }
      );
    }

    const normId = normalizeNickname(cleanId);

    // Cari akun terdaftar (fleksibel: exact nickname, email, atau normalized nickname leetspeak)
    let account = accounts.find(
      (a: any) =>
        (a.gameNickname && a.gameNickname.toLowerCase() === cleanId) ||
        (a.email && a.email.toLowerCase() === cleanId) ||
        (a.gameNickname && normalizeNickname(a.gameNickname) === normId)
    );

    // Jika akun belum dibuat di memberAccounts.json, cek apakah member terdaftar di roster
    if (!account) {
      const existingMember = findMemberInList(members, {
        nickname: cleanId,
      });

      if (existingMember) {
        return NextResponse.json(
          {
            success: false,
            error: `Nickname '${existingMember.gameNickname}' terdaftar di roster, tetapi belum memiliki kata sandi. Silakan gunakan menu 'Klaim Akun & Buat PIN' untuk mengaktifkannya.`,
            needsActivation: true,
            suggestedNickname: existingMember.gameNickname,
          },
          { status: 403 }
        );
      }

      // Catat kegagalan
      const currentAttempts = (rateData ? rateData.attempts : 0) + 1;
      if (currentAttempts >= MAX_ATTEMPTS) {
        rateLimitMap.set(clientIp, { attempts: currentAttempts, lockedUntil: now + LOCKOUT_MS });
        return NextResponse.json(
          { success: false, error: "Batas 5 kali percobaan tercapai. Akses dikunci selama 15 menit." },
          { status: 429 }
        );
      }
      rateLimitMap.set(clientIp, { attempts: currentAttempts, lockedUntil: 0 });

      return NextResponse.json(
        { success: false, error: "Nickname atau kata sandi tidak ditemukan." },
        { status: 401 }
      );
    }

    // Verifikasi password hash
    if (!account.passwordHash || !account.salt) {
      return NextResponse.json(
        {
          success: false,
          error: "Akun ini didaftarkan via Google. Silakan masuk menggunakan tombol 'Masuk dengan Google'.",
        },
        { status: 400 }
      );
    }

    const isMatch = verifyPassword(cleanPass, account.passwordHash, account.salt);
    if (!isMatch) {
      const currentAttempts = (rateData ? rateData.attempts : 0) + 1;
      if (currentAttempts >= MAX_ATTEMPTS) {
        rateLimitMap.set(clientIp, { attempts: currentAttempts, lockedUntil: now + LOCKOUT_MS });
        return NextResponse.json(
          { success: false, error: "Batas 5 kali percobaan tercapai. Akses dikunci selama 15 menit." },
          { status: 429 }
        );
      }
      rateLimitMap.set(clientIp, { attempts: currentAttempts, lockedUntil: 0 });

      return NextResponse.json(
        {
          success: false,
          error: `Kata sandi salah. Sisa kesempatan: ${MAX_ATTEMPTS - currentAttempts} kali.`,
        },
        { status: 401 }
      );
    }

    // Login Berhasil: Reset Rate Limit
    rateLimitMap.delete(clientIp);

    // Ambil profil member terkini & auto-heal jika ada perbedaan ID
    const { member } = await resolveMemberProfile({
      memberId: account.memberId,
      gameNickname: account.gameNickname,
      email: account.email,
      accountId: account.id,
    });

    const isMemberVerified = Boolean(member?.verified);
    const resolvedMemberId = member ? member.id : account.memberId;
    const resolvedNickname = member ? member.gameNickname : account.gameNickname;
    const resolvedDivision = member ? member.division : "ALL";
    const resolvedAvatar = member?.avatarUrl || "/assets/default_avatar.jpg";

    const session = {
      uid: account.id,
      memberId: resolvedMemberId,
      role: "member",
      displayName: resolvedNickname,
      gameNickname: resolvedNickname,
      division: resolvedDivision,
      email: account.email || null,
      avatarUrl: resolvedAvatar,
      verified: isMemberVerified,
      authType: "nickname",
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const token = signSessionToken(session);
    const response = NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${session.gameNickname}!`,
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
    console.error("Error pada /api/auth/member-login:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal pada server autentikasi." },
      { status: 500 }
    );
  }
}
