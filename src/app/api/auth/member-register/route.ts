import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signSessionToken } from "@/lib/security";
import {
  readLocalAccounts,
  saveLocalAccounts,
  readLocalMembers,
  saveLocalMembers,
  getAllMembers,
  findMemberInList,
  normalizeNickname,
  normalizePhone,
} from "@/lib/memberHelper";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

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
    const cleanWa = (whatsapp || "").trim();
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

    const accounts = readLocalAccounts();
    const members = await getAllMembers();
    const normNick = normalizeNickname(cleanNick);

    // 1. Cek apakah Nickname sudah memiliki akun terdaftar
    const existingAccount = accounts.find(
      (a: any) =>
        (a.gameNickname && a.gameNickname.toLowerCase() === cleanNick.toLowerCase()) ||
        (a.gameNickname && normalizeNickname(a.gameNickname) === normNick)
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

    // 2. Cek apakah member sudah pernah mendaftar di Roster (toleran tanda baca, 0 vs O, dsb)
    let targetMember = findMemberInList(members, {
      nickname: cleanNick,
      phone: cleanWa,
    });

    // Jika member sudah ada di roster, verifikasi kecocokan nomor WhatsApp jika diisi
    if (targetMember && cleanWa && targetMember.whatsapp) {
      const normInputWa = normalizePhone(cleanWa);
      const normStoredWa = normalizePhone(targetMember.whatsapp);

      if (normInputWa.length >= 8 && normStoredWa.length >= 8 && normInputWa !== normStoredWa) {
        return NextResponse.json(
          {
            success: false,
            error: "Nomor WhatsApp verifikasi tidak cocok dengan data pendaftaran di roster.",
          },
          { status: 403 }
        );
      }
    }

    // 3. Jika member baru (belum pernah mendaftar di roster)
    if (!targetMember) {
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
        status: "MENUNGGU WA",
        avatarUrl: "/assets/default_avatar.jpg",
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        submittedAtIso: new Date().toISOString(),
      };

      // Simpan ke Firestore jika aktif
      if (isFirebaseConfigured && db) {
        try {
          const docRef = await addDoc(collection(db, "members"), targetMember);
          targetMember.id = docRef.id;
        } catch (fsErr) {
          console.warn("Gagal simpan member baru ke Firestore:", fsErr);
        }
      }

      const localList = readLocalMembers();
      localList.unshift(targetMember);
      saveLocalMembers(localList);
    }

    // 4. Enkripsi password menggunakan Scrypt
    const { hash, salt } = hashPassword(cleanPass);

    const newAccount = {
      id: `acc_${Date.now()}`,
      memberId: targetMember.id,
      gameNickname: targetMember.gameNickname || cleanNick,
      email: email?.trim().toLowerCase() || null,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveLocalAccounts(accounts);

    // 5. Buat Sesi Login Otomatis
    const now = Date.now();
    const session = {
      uid: newAccount.id,
      memberId: targetMember.id,
      role: "member",
      displayName: targetMember.gameNickname || cleanNick,
      gameNickname: targetMember.gameNickname || cleanNick,
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
      message: "Akun member berhasil dibuat dan terhubung ke profil resmi!",
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
