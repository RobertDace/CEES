// src/app/api/tournament/live/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "tournamentData.json");

function readTournamentFile() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Gagal membaca tournamentData.json:", err);
  }
  return null;
}

function writeTournamentFile(data: any) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Gagal menulis tournamentData.json:", err);
    return false;
  }
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
    const fileData = readTournamentFile();
    if (!fileData || !fileData.liveTournament) {
      return NextResponse.json(
        { success: false, error: "Data turnamen belum ditemukan." },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    return NextResponse.json(
      {
        success: true,
        data: fileData.liveTournament,
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

    const fileData = readTournamentFile() || { liveTournament: {}, archivedTournaments: [] };
    fileData.liveTournament = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    const written = writeTournamentFile(fileData);
    if (!written) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan perubahan ke file sistem." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: fileData.liveTournament,
        message: "Data turnamen berhasil diperbarui.",
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
