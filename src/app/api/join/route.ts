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
  query,
  orderBy,
} from "firebase/firestore";

export interface RegistrationPayload {
  fullName: string;
  gameNickname: string;
  gameId?: string;
  division: string;
  city: string;
  whatsapp: string;
  discordTag?: string;
  playerType: string;
  motivation?: string;
  timestamp?: string;
}

const membersFilePath = path.join(process.cwd(), "src", "data", "liveMembers.json");

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

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Return live registered members list (Firestore with local fallback)
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
      let finalMembers = firestoreMembers;

      // Jika Firestore masih kosong tapi di lokal sudah ada data (seperti saat baru pertama konek),
      // otomatis migrasikan data lokal ke Firestore agar langsung muncul di Firebase Console!
      if (firestoreMembers.length === 0) {
        const localMembers = readMembers();
        if (localMembers.length > 0) {
          try {
            for (const lm of localMembers) {
              await addDoc(collection(db, "members"), lm);
            }
            const reSnap = await getDocs(q);
            finalMembers = reSnap.docs.map((docSnap) => ({
              ...(docSnap.data() as any),
              id: docSnap.id,
            }));
          } catch (migErr) {
            console.warn("Auto-migrasi ke Firestore gagal:", migErr);
          }
        }
      }

      // Simpan ke local cache sebagai backup
      saveMembers(finalMembers);

      return NextResponse.json(
        {
          success: true,
          totalCount: finalMembers.length + 90,
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
  const members = readMembers();
  const totalCount = members.length + 90;

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

// POST: Register new member (Firestore + Local fallback)
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

    // 2. Format waktu WITA (Samarinda, Kaltim)
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
      gameNickname: body.gameNickname.trim(),
      gameId: body.gameId?.trim() || "-",
      division: normalizedDivision,
      city: body.city?.trim() || "Samarinda",
      whatsapp: body.whatsapp.trim(),
      discordTag: body.discordTag?.trim() || "-",
      playerType: body.playerType || "Kompetitif & Kasual",
      motivation: body.motivation?.trim() || "-",
      timestamp: formattedTimestamp,
      submittedAtIso: now.toISOString(),
      status: "MEMBER BARU",
      verified: true,
    };

    let destination = "local_live_store";

    // 3. Simpan ke Firebase Firestore jika dikonfigurasi
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "members"), newRecord);
        newRecord.id = docRef.id;
        destination = "firebase_firestore";
      } catch (fsErr) {
        console.warn("Gagal menyimpan ke Firestore, disimpan ke local:", fsErr);
      }
    }

    // 4. Selalu simpan ke local store agar sinkron
    const members = readMembers();
    members.unshift(newRecord);
    saveMembers(members);

    return NextResponse.json({
      success: true,
      message: "Selamat! Pendaftaran berhasil dan nama kamu telah terdaftar di database live CEES AREA.",
      record: newRecord,
      totalMembers: members.length + 90,
      destination,
    });
  } catch (error) {
    console.error("Error pada endpoint pendaftaran /api/join:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi gangguan saat memproses formulir." },
      { status: 500 }
    );
  }
}

// DELETE: Remove member or reset list (Protected with admin PIN: cees2026)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pin = searchParams.get("pin");

    if (pin !== "cees2026" && pin !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: PIN Admin salah." },
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
        totalCount: 90,
      });
    }

    const initialLen = members.length;
    members = members.filter((m) => m.id !== id);

    saveMembers(members);

    return NextResponse.json({
      success: true,
      message: `Data member ID ${id} berhasil dihapus.`,
      remainingCount: members.length,
      totalCount: members.length + 90,
    });
  } catch (err) {
    console.error("Error pada DELETE /api/join:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus data member." },
      { status: 500 }
    );
  }
}
