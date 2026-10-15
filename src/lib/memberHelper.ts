import fs from "fs";
import path from "path";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";

const membersFilePath = path.join(process.cwd(), "src", "data", "liveMembers.json");
const accountsFilePath = path.join(process.cwd(), "src", "data", "memberAccounts.json");

/**
 * Normalisasi nickname gamer:
 * - Huruf kecil
 * - Hapus spasi dan tanda baca (. - _ [ ] |)
 * - Normalisasi angka 0 (nol) dan huruf o agar leetspeak seperti 20B1T vs 2OB1T cocok
 */
export function normalizeNickname(nick?: string | null): string {
  if (!nick) return "";
  return nick
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/gi, "")
    .replace(/0/g, "o");
}

/**
 * Normalisasi nomor WhatsApp:
 * - Ambil digit angka saja
 * - Ambil 8-10 digit terakhir untuk mengatasi perbedaan awalan 08 vs 628 vs +62
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = String(phone).replace(/[^0-9]/g, "");
  return digits.length >= 8 ? digits.slice(-8) : digits;
}

export function readLocalMembers(): any[] {
  try {
    if (fs.existsSync(membersFilePath)) {
      const data = fs.readFileSync(membersFilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Gagal membaca liveMembers.json:", err);
  }
  return [];
}

export function saveLocalMembers(mems: any[]) {
  try {
    fs.writeFileSync(membersFilePath, JSON.stringify(mems, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan liveMembers.json:", err);
  }
}

export function readLocalAccounts(): any[] {
  try {
    if (fs.existsSync(accountsFilePath)) {
      return JSON.parse(fs.readFileSync(accountsFilePath, "utf-8"));
    }
  } catch (err) {
    console.error("Gagal membaca memberAccounts.json:", err);
  }
  return [];
}

export function saveLocalAccounts(accs: any[]) {
  try {
    fs.writeFileSync(accountsFilePath, JSON.stringify(accs, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan memberAccounts.json:", err);
  }
}

/**
 * Mengambil daftar member lengkap dengan sinkronisasi Firestore.
 * Jika Firestore aktif, data langsung diselaraskan dengan local cache.
 */
export async function getAllMembers(): Promise<any[]> {
  const localMembers = readLocalMembers();

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "members"), orderBy("submittedAtIso", "desc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreMembers = snap.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));

        // Perbarui local cache
        saveLocalMembers(firestoreMembers);
        return firestoreMembers;
      }
    } catch (fsErr) {
      console.warn("Firestore offline/error saat getAllMembers, menggunakan local backup:", fsErr);
    }
  }

  return localMembers;
}

/**
 * Pencarian member fleksibel dan toleran terhadap variasi penulisan.
 */
export function findMemberInList(
  members: any[],
  criteria: {
    id?: string | null;
    nickname?: string | null;
    phone?: string | null;
    email?: string | null;
  }
): any | null {
  if (!Array.isArray(members) || members.length === 0) return null;

  // 1. Cocokkan ID persis
  if (criteria.id) {
    const byId = members.find((m) => m && m.id === criteria.id);
    if (byId) return byId;
  }

  // 2. Cocokkan Nickname persis (case-insensitive)
  if (criteria.nickname) {
    const targetNick = criteria.nickname.trim().toLowerCase();
    const byExactNick = members.find(
      (m) => m && m.gameNickname && m.gameNickname.trim().toLowerCase() === targetNick
    );
    if (byExactNick) return byExactNick;
  }

  // 3. Cocokkan Nickname ter-normalisasi (abaikan tanda titik, underscore, 0 vs O)
  if (criteria.nickname) {
    const normTarget = normalizeNickname(criteria.nickname);
    if (normTarget.length >= 2) {
      const byNormNick = members.find(
        (m) => m && m.gameNickname && normalizeNickname(m.gameNickname) === normTarget
      );
      if (byNormNick) return byNormNick;
    }
  }

  // 4. Cocokkan nomor WhatsApp (8-10 digit terakhir)
  if (criteria.phone) {
    const normPhone = normalizePhone(criteria.phone);
    if (normPhone.length >= 8) {
      const byPhone = members.find(
        (m) => m && m.whatsapp && normalizePhone(m.whatsapp) === normPhone
      );
      if (byPhone) return byPhone;
    }
  }

  // 5. Cocokkan Email
  if (criteria.email) {
    const targetEmail = criteria.email.trim().toLowerCase();
    const byEmail = members.find(
      (m) => m && m.email && m.email.trim().toLowerCase() === targetEmail
    );
    if (byEmail) return byEmail;
  }

  return null;
}

/**
 * Memecahkan dan memperbaiki ID member (Auto-Healing) jika terjadi ketidakcocokan
 * antara akun (memberAccounts.json) dan data anggota roster (liveMembers / Firestore).
 */
export async function resolveMemberProfile(params: {
  memberId?: string | null;
  gameNickname?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  accountId?: string | null;
}): Promise<{ member: any | null; healed: boolean }> {
  const members = await getAllMembers();
  const accounts = readLocalAccounts();

  // 1. Cari data member di roster
  let member = findMemberInList(members, {
    id: params.memberId,
    nickname: params.gameNickname,
    email: params.email,
    phone: params.whatsapp,
  });

  // 2. Jika belum ketemu dan ada accountId, periksa record akun tersimpan
  if (!member && params.accountId) {
    const acc = accounts.find((a) => a.id === params.accountId);
    if (acc) {
      member = findMemberInList(members, {
        id: acc.memberId,
        nickname: acc.gameNickname,
        email: acc.email,
      });
    }
  }

  // 3. Jika belum ketemu, cari akun yang memiliki nickname yang sama
  if (!member && params.gameNickname) {
    const acc = accounts.find(
      (a) =>
        normalizeNickname(a.gameNickname) === normalizeNickname(params.gameNickname)
    );
    if (acc && acc.memberId) {
      member = findMemberInList(members, { id: acc.memberId });
    }
  }

  let healed = false;

  // 4. Lakukan Auto-Healing pada akun jika ditemukan kecocokan
  if (member) {
    const targetAccIndex = accounts.findIndex(
      (a) =>
        (params.accountId && a.id === params.accountId) ||
        (params.gameNickname &&
          normalizeNickname(a.gameNickname) === normalizeNickname(params.gameNickname)) ||
        (member && normalizeNickname(a.gameNickname) === normalizeNickname(member.gameNickname)) ||
        (params.memberId && a.memberId === params.memberId)
    );

    if (targetAccIndex !== -1) {
      const acc = accounts[targetAccIndex];
      // Jika memberId pada akun berbeda dengan ID asli di roster, auto-perbaiki!
      if (acc.memberId !== member.id || acc.gameNickname !== member.gameNickname) {
        accounts[targetAccIndex] = {
          ...acc,
          memberId: member.id,
          gameNickname: member.gameNickname || acc.gameNickname,
          updatedAt: new Date().toISOString(),
        };
        saveLocalAccounts(accounts);
        healed = true;
      }
    }
  }

  return { member, healed };
}
