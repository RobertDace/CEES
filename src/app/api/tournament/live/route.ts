import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  LiveTournamentData,
  normalizeTournamentData,
  createNewTournament,
} from "@/lib/tournament/pubgmCalculator";

const LIVE_DOC_ID = "current_tournament";
const TOURNAMENTS_COLLECTION = "tournaments";

const dataFilePath = path.join(process.cwd(), "src", "data", "tournamentData.json");
const tmpFilePath = path.join(os.tmpdir(), "cees_tournamentData.json");

// In-memory runtime cache for serverless container reuse
declare global {
  var __cees_tournament_data: any;
}

function readTournamentFile(): any {
  // 1. Cek in-memory cache serverless instance
  if (globalThis.__cees_tournament_data) {
    return globalThis.__cees_tournament_data;
  }

  // 2. Cek penyimpanan /tmp (writable di Vercel & AWS Lambda)
  try {
    if (fs.existsSync(tmpFilePath)) {
      const raw = fs.readFileSync(tmpFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed) {
        globalThis.__cees_tournament_data = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // ignore tmp read error
  }

  // 3. Fallback ke seed data bundled src/data/tournamentData.json
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
  // Simpan ke in-memory cache
  globalThis.__cees_tournament_data = data;

  // Simpan ke /tmp (selalu berhasil di Vercel & serverless)
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (tmpErr) {
    console.warn("Gagal menulis ke tmpFilePath:", tmpErr);
  }

  // Simpan ke file lokal project (berhasil saat local dev, read-only di Vercel)
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Normal pada runtime Vercel serverless read-only
    console.log("Vercel filesystem read-only: data turnamen disimpan ke memory & /tmp.");
  }

  return true;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  try {
    const fileData = readTournamentFile() || { liveTournament: null, tournaments: [], archivedTournaments: [] };
    let liveData: any = null;
    let source = "local_cache";

    // 1. Ambil dari Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const liveDocRef = doc(db, TOURNAMENTS_COLLECTION, LIVE_DOC_ID);
        const snap = await getDoc(liveDocRef);
        if (snap.exists()) {
          liveData = snap.data();
          source = "firestore";
        }
      } catch (fbErr) {
        console.warn("Gagal getDoc Firestore (fallback ke file/tmp):", fbErr);
      }
    }

    // 2. Fallback ke fileData jika Firestore belum ada
    if (!liveData) {
      liveData = fileData.liveTournament;
    }

    if (!liveData) {
      liveData = createNewTournament("CEES FAST SCRIM SEASON 1", "SAMARINDA BATTLE ROYALE SHOWDOWN // PMWC RULES", true);
    }

    const normalizedLive = normalizeTournamentData(liveData);

    // Ambil list semua turnamen
    let tournamentsList: LiveTournamentData[] = Array.isArray(fileData.tournaments) && fileData.tournaments.length > 0
      ? fileData.tournaments.map((t: any) => normalizeTournamentData(t))
      : [normalizedLive];

    // Pastikan turnamen live saat ini terdaftar di tournamentsList
    const existingIndex = tournamentsList.findIndex((t) => t.id === normalizedLive.id);
    if (existingIndex >= 0) {
      tournamentsList[existingIndex] = normalizedLive;
    } else {
      tournamentsList.unshift(normalizedLive);
    }

    return NextResponse.json(
      {
        success: true,
        data: normalizedLive,
        tournaments: tournamentsList,
        source,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { success: false, error: "Payload turnamen tidak valid." },
        { status: 400 }
      );
    }

    const fileData = readTournamentFile() || { liveTournament: null, tournaments: [], archivedTournaments: [] };
    let tournamentsList: LiveTournamentData[] = Array.isArray(fileData.tournaments)
      ? fileData.tournaments.map((t: any) => normalizeTournamentData(t))
      : [];

    let updatedLiveTournament: LiveTournamentData;

    // Handle aksi ganti turnamen aktif via setActiveTournamentId
    if (payload.setActiveTournamentId) {
      const targetId = payload.setActiveTournamentId;
      const found = tournamentsList.find((t) => t.id === targetId);
      if (!found) {
        return NextResponse.json(
          { success: false, error: "Turnamen target tidak ditemukan." },
          { status: 404 }
        );
      }
      updatedLiveTournament = {
        ...found,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Normal update
      const normalizedPayload = normalizeTournamentData(payload);
      updatedLiveTournament = {
        ...normalizedPayload,
        updatedAt: new Date().toISOString(),
      };
    }

    // Update dalam array tournaments
    const matchIdx = tournamentsList.findIndex((t) => t.id === updatedLiveTournament.id);
    if (matchIdx >= 0) {
      tournamentsList[matchIdx] = updatedLiveTournament;
    } else {
      tournamentsList.unshift(updatedLiveTournament);
    }

    // Jika payload juga menyertakan update daftar tournaments
    if (Array.isArray(payload.allTournaments)) {
      tournamentsList = payload.allTournaments.map((t: any) => normalizeTournamentData(t));
      const activeIdx = tournamentsList.findIndex((t) => t.id === updatedLiveTournament.id);
      if (activeIdx >= 0) {
        tournamentsList[activeIdx] = updatedLiveTournament;
      }
    }

    // 1. Simpan ke Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const liveDocRef = doc(db, TOURNAMENTS_COLLECTION, LIVE_DOC_ID);
        await setDoc(liveDocRef, updatedLiveTournament);
      } catch (fbErr) {
        console.warn("Gagal update Firestore di server:", fbErr);
      }
    }

    // 2. Simpan ke local / tmp / memory
    fileData.liveTournament = updatedLiveTournament;
    fileData.tournaments = tournamentsList;
    writeTournamentFile(fileData);

    return NextResponse.json(
      {
        success: true,
        data: updatedLiveTournament,
        tournaments: tournamentsList,
        message: "Data turnamen berhasil diperbarui.",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Error POST /api/tournament/live:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

