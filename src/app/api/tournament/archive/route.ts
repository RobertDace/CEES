// src/app/api/tournament/archive/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc, query, orderBy } from "firebase/firestore";

const ARCHIVES_COLLECTION = "tournament_archives";
const dataFilePath = path.join(process.cwd(), "src", "data", "tournamentData.json");
const tmpFilePath = path.join(os.tmpdir(), "cees_tournamentData.json");

declare global {
  var __cees_tournament_data: any;
}

function readTournamentFile(): any {
  if (globalThis.__cees_tournament_data) {
    return globalThis.__cees_tournament_data;
  }
  try {
    if (fs.existsSync(tmpFilePath)) {
      const raw = fs.readFileSync(tmpFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed) {
        globalThis.__cees_tournament_data = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis.__cees_tournament_data = parsed;
      return parsed;
    }
  } catch (err) {
    console.error("Gagal membaca tournamentData.json:", err);
  }
  return null;
}

function writeTournamentFile(data: any): boolean {
  globalThis.__cees_tournament_data = data;
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (tmpErr) {
    console.warn("Gagal menulis ke tmpFilePath:", tmpErr);
  }
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.log("Vercel filesystem read-only: data arsip disimpan ke memory & /tmp.");
  }
  return true;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Coba ambil dari Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const archColRef = collection(db, ARCHIVES_COLLECTION);
        const q = query(archColRef, orderBy("archivedAt", "desc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list: any[] = [];
          snap.forEach((d) => list.push(d.data()));
          return NextResponse.json({
            success: true,
            data: list,
            source: "firestore",
          });
        }
      } catch (fbErr) {
        console.warn("Gagal getDocs Firestore archives (fallback ke file/tmp):", fbErr);
      }
    }

    // 2. Ambil dari file / tmp / memory
    const fileData = readTournamentFile();
    const archives = fileData?.archivedTournaments || [];
    return NextResponse.json({
      success: true,
      data: archives,
      source: "local_cache",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, error: "Payload arsip turnamen tidak valid." },
        { status: 400 }
      );
    }

    // 1. Simpan ke Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const archDocRef = doc(db, ARCHIVES_COLLECTION, payload.id);
        await setDoc(archDocRef, payload);
      } catch (fbErr) {
        console.warn("Gagal setDoc Firestore archive:", fbErr);
      }
    }

    // 2. Simpan ke local / tmp / memory
    const fileData = readTournamentFile() || { liveTournament: {}, archivedTournaments: [] };
    if (!Array.isArray(fileData.archivedTournaments)) {
      fileData.archivedTournaments = [];
    }

    // Filter duplicate ID and unshift
    fileData.archivedTournaments = fileData.archivedTournaments.filter((a: any) => a.id !== payload.id);
    fileData.archivedTournaments.unshift(payload);

    writeTournamentFile(fileData);

    return NextResponse.json({
      success: true,
      data: fileData.archivedTournaments,
      message: "Turnamen berhasil diarsipkan.",
    });
  } catch (err: any) {
    console.error("Error POST /api/tournament/archive:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
