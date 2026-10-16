// src/app/api/tournament/archive/route.ts
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

export async function GET() {
  try {
    const fileData = readTournamentFile();
    const archives = fileData?.archivedTournaments || [];
    return NextResponse.json({
      success: true,
      data: archives,
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

    const fileData = readTournamentFile() || { liveTournament: {}, archivedTournaments: [] };
    if (!Array.isArray(fileData.archivedTournaments)) {
      fileData.archivedTournaments = [];
    }

    // Masukkan ke posisi paling awal
    fileData.archivedTournaments.unshift(payload);

    const written = writeTournamentFile(fileData);
    if (!written) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan arsip turnamen." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: fileData.archivedTournaments,
      message: "Turnamen berhasil diarsipkan.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
