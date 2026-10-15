import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { hashPassword, signSessionToken } from "@/lib/security";

export interface RegistrationPayload {
  fullName: string;
  gameNickname: string;
  gameId?: string;
  division: string;
  city: string;
  whatsapp: string;
  password?: string;
  discordTag?: string;
  playerType: string;
  motivation?: string;
  timestamp?: string;
}

const membersFilePath = path.join(process.cwd(), "src", "data", "liveMembers.json");
const accountsFilePath = path.join(process.cwd(), "src", "data", "memberAccounts.json");

function readMembers(): any[] {
  try {
    if (fs.existsSync(membersFilePath)) {
      const data = fs.readFileSync(membersFilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Gagal membaca file liveMembers.json:", err);
  }
  return [];
}

function saveMembers(members: any[]) {
  try {
    fs.writeFileSync(membersFilePath, JSON.stringify(members, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan ke liveMembers.json:", err);
  }
}

function readAccounts(): any[] {
  try {
    if (fs.existsSync(accountsFilePath)) {
      return JSON.parse(fs.readFileSync(accountsFilePath, "utf-8"));
    }
  } catch (err) {
    console.error("Gagal membaca file memberAccounts.json:", err);
  }
  return [];
}

function saveAccounts(accounts: any[]) {
  try {
    fs.writeFileSync(accountsFilePath, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan ke memberAccounts.json:", err);
  }
}

/**
 * Filter anti-duplikasi: memastikan setiap anggota hanya muncul tepat 1 kali
 * berdasarkan ID unik, Nickname unik, atau nomor WhatsApp unik.
 */
function deduplicateMembers(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set<string>();
  const seenNicks = new Set<string>();
  const seenPhones = new Set<string>();
  const result: any[] = [];

  for (const item of list) {
    if (!item) continue;
    const cleanNick = (item.gameNickname || "").trim().toLowerCase();
    const cleanPhone = (item.whatsapp || "").replace(/[^0-9]/g, "");
    const id = item.id;

    if (id && seenIds.has(id)) continue;
    if (cleanNick && seenNicks.has(cleanNick)) continue;
    if (cleanPhone && cleanPhone.length > 8 && seenPhones.has(cleanPhone)) continue;

    if (id) seenIds.add(id);
    if (cleanNick) seenNicks.add(cleanNick);
    if (cleanPhone && cleanPhone.length > 8) seenPhones.add(cleanPhone);

    result.push(item);
  }

  return result;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Return live registered members list (Firestore with local fallback & strict deduplication)
export async function GET() {
  // Cek Firestore terlebih dahulu jika kredensial sudah dikonfigurasikan
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "members"), orderBy("submittedAtIso", "desc"));
      const snap = await getDocs(q);
      const firestoreMembers = snap.docs.map((docSnap) => ({
        ...(docSnap.data() as any),
        id: docSnap.id,
      }));

      // Bersihkan duplikasi secara otomatis
      const finalMembers = deduplicateMembers(firestoreMembers);

      // Simpan ke local cache sebagai backup
      saveMembers(finalMembers);

      return NextResponse.json(
        {
          success: true,
          totalCount: finalMembers.length,
          liveCount: finalMembers.length,
          members: finalMembers,
          source: "firebase_firestore",
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    } catch (fsErr) {
      console.warn("Firestore GET query gagal, beralih ke cache lokal:", fsErr);
    }
  }

  // Fallback: Membaca dari data lokal
  const rawMembers = readMembers();
  const members = deduplicateMembers(rawMembers);
  const totalCount = members.length;

  return NextResponse.json(
    {
      success: true,
      totalCount,
      liveCount: members.length,
      members,
      source: isFirebaseConfigured ? "local_fallback" : "local_store",
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

// POST: Register new member (Firestore + Local fallback + Auto Account & Login)
export async function POST(req: NextRequest) {
  try {
    const body: RegistrationPayload = await req.json();

    // 1. Validasi input penting
    if (!body.fullName?.trim() || !body.gameNickname?.trim() || !body.whatsapp?.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama lengkap, nickname in-game, dan WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    const cleanPassword = (body.password || "").trim();
    if (!cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Kata sandi / PIN akun wajib diisi." },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Kata sandi minimal 6 karakter demi keamanan akun kamu." },
        { status: 400 }
      );
    }

    const cleanNick = body.gameNickname.trim();
    const accounts = readAccounts();

    // 2. Cek apakah Nickname sudah memiliki akun terdaftar
    const existingAcc = accounts.find(
      (a: any) => a.gameNickname && a.gameNickname.toLowerCase() === cleanNick.toLowerCase()
    );
    if (existingAcc) {
      return NextResponse.json(
        {
          success: false,
          error: `Nickname '${cleanNick}' sudah terdaftar. Jika ini adalah kamu, silakan langsung masuk di Portal Member.`,
        },
        { status: 409 }
      );
    }

    // 3. Format waktu WITA (Samarinda, Kaltim)
    const now = new Date();
    const formattedTimestamp =
      new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Makassar",
      }).format(now) + " WITA";

    const normalizedDivision = (body.division || "PUBGM").toUpperCase();

    const newRecord: any = {
      id: `mem-${Date.now().toString(36)}`,
      fullName: body.fullName.trim(),
      gameNickname: cleanNick,
      gameId: body.gameId?.trim() || "-",
      division: normalizedDivision,
      city: body.city?.trim() || "Samarinda",
      whatsapp: body.whatsapp.trim(),
      discordTag: body.discordTag?.trim() || "-",
      playerType: body.playerType || "Kompetitif & Kasual",
      motivation: body.motivation?.trim() || "-",
      timestamp: formattedTimestamp,
      submittedAtIso: now.toISOString(),
      status: "MENUNGGU WA",
      verified: false,
      avatarUrl: "/assets/default_avatar.jpg",
    };

    let destination = "local_live_store";

    // 4. Simpan ke Firebase Firestore jika dikonfigurasi
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "members"), newRecord);
        newRecord.id = docRef.id;
        destination = "firebase_firestore";
      } catch (fsErr) {
        console.warn("Gagal menyimpan ke Firestore, disimpan ke local:", fsErr);
      }
    }

    // 5. Simpan ke local liveMembers store
    const members = readMembers();
    members.unshift(newRecord);
    saveMembers(members);

    // 6. Buat Akun Terenkripsi Scrypt di memberAccounts.json
    const { hash, salt } = hashPassword(cleanPassword);
    const newAccount = {
      id: `acc_${Date.now()}`,
      memberId: newRecord.id,
      gameNickname: newRecord.gameNickname,
      email: null,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    saveAccounts(accounts);

    // 7. Terbitkan Sesi Login Otomatis
    const nowMs = Date.now();
    const session = {
      uid: newAccount.id,
      memberId: newRecord.id,
      role: "member" as const,
      displayName: newRecord.gameNickname,
      gameNickname: newRecord.gameNickname,
      division: newRecord.division || "ALL",
      email: null,
      avatarUrl: newRecord.avatarUrl || "/assets/default_avatar.jpg",
      verified: Boolean(newRecord.verified),
      authType: "nickname" as const,
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const token = signSessionToken(session);

    const response = NextResponse.json({
      success: true,
      message: "Selamat! Pendaftaran berhasil dan akun member kamu telah aktif.",
      record: newRecord,
      user: session,
      token,
      totalMembers: members.length,
      destination,
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
  } catch (error) {
    console.error("Error pada endpoint pendaftaran /api/join:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi gangguan saat memproses formulir." },
      { status: 500 }
    );
  }
}

// PATCH: Toggle verify status member (Protected with admin cookie / PIN)
export async function PATCH(req: NextRequest) {
  try {
    const adminToken = req.cookies.get("cees_admin_token")?.value;
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");

    if (!adminToken && pin !== "cees2026" && pin !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: Otoritas admin diperlukan." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, verified } = body;

    const members = readMembers();
    let idx = members.findIndex((m: any) => m.id === id);

    // Jika tidak ditemukan di file lokal, coba cari di Firestore jika aktif
    if (idx === -1 && isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, "members", id));
        if (snap.exists()) {
          const fsData = { ...(snap.data() as any), id: snap.id };
          members.push(fsData);
          idx = members.length - 1;
        }
      } catch (e) {
        console.warn("Gagal cek doc Firestore di PATCH /api/join:", e);
      }
    }

    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Member tidak ditemukan." }, { status: 404 });
    }

    const nextVerified = verified !== undefined ? Boolean(verified) : !members[idx].verified;
    members[idx].verified = nextVerified;
    members[idx].status = nextVerified ? "VERIFIED" : "MENUNGGU WA";
    members[idx].updatedAt = new Date().toISOString();

    saveMembers(members);

    // Selaraskan akun member jika ada
    try {
      const accounts = readAccounts();
      const normMemberNick = (members[idx].gameNickname || "").toLowerCase().replace(/[^a-z0-9]/gi, "").replace(/0/g, "o");
      let accountsUpdated = false;

      for (let i = 0; i < accounts.length; i++) {
        const acc = accounts[i];
        const normAccNick = (acc.gameNickname || "").toLowerCase().replace(/[^a-z0-9]/gi, "").replace(/0/g, "o");
        if (acc.memberId === id || (normMemberNick && normMemberNick === normAccNick)) {
          accounts[i].memberId = members[idx].id;
          accounts[i].updatedAt = new Date().toISOString();
          accountsUpdated = true;
        }
      }

      if (accountsUpdated) {
        saveAccounts(accounts);
      }
    } catch (accErr) {
      console.warn("Gagal selaraskan akun di PATCH /api/join:", accErr);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "members", id), {
          verified: nextVerified,
          status: members[idx].status,
          updatedAt: members[idx].updatedAt,
        });
      } catch (fsErr) {
        console.warn("Gagal update Firestore verification:", fsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Status verifikasi ${members[idx].gameNickname} berhasil diperbarui!`,
      member: members[idx],
    });
  } catch (err) {
    console.error("Error pada PATCH /api/join:", err);
    return NextResponse.json({ success: false, error: "Gagal memproses verifikasi." }, { status: 500 });
  }
}

// DELETE: Remove member or reset list (Protected with admin PIN: cees2026 or admin token)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pin = searchParams.get("pin");
    const adminToken = req.cookies.get("cees_admin_token")?.value;

    if (!adminToken && pin !== "cees2026" && pin !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: PIN Admin salah atau sesi admin tidak ditemukan." },
        { status: 401 }
      );
    }

    // 1. Hapus dari Firestore jika dikonfigurasikan
    if (isFirebaseConfigured && db) {
      const firestoreDb = db;
      try {
        if (!id || id === "all") {
          const snap = await getDocs(collection(firestoreDb, "members"));
          await Promise.all(snap.docs.map((docSnap) => deleteDoc(doc(firestoreDb, "members", docSnap.id))));
        } else {
          await deleteDoc(doc(firestoreDb, "members", id));
        }
      } catch (fsErr) {
        console.warn("Gagal menghapus dari Firestore:", fsErr);
      }
    }

    // 2. Hapus dari local store
    let members = readMembers();

    if (!id || id === "all") {
      members = [];
      saveMembers(members);
      return NextResponse.json({
        success: true,
        message: "Semua data pendaftar berhasil dihapus.",
        remainingCount: 0,
        totalCount: 0,
      });
    }

    const initialLen = members.length;
    members = members.filter((m) => m.id !== id);

    saveMembers(members);

    return NextResponse.json({
      success: true,
      message: `Data member ID ${id} berhasil dihapus.`,
      remainingCount: members.length,
      totalCount: members.length,
    });
  } catch (err) {
    console.error("Error pada DELETE /api/join:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus data member." },
      { status: 500 }
    );
  }
}
