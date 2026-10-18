// src/lib/tournament/tournamentHelper.ts
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import {
  LiveTournamentData,
  ArchivedTournament,
  calculatePUBGMStandings,
  normalizeTournamentData,
} from "./pubgmCalculator";

const LIVE_DOC_ID = "current_tournament";
const TOURNAMENTS_COLLECTION = "tournaments";
const ARCHIVES_COLLECTION = "tournament_archives";

/**
 * Fetch data turnamen live & seluruh list turnamen dari API backend
 */
export async function fetchLiveTournamentFromApi(): Promise<LiveTournamentData | null> {
  try {
    const res = await fetch(`/api/tournament/live?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data ? normalizeTournamentData(json.data) : null;
  } catch (err) {
    console.error("Gagal fetchLiveTournamentFromApi:", err);
    return null;
  }
}

/**
 * Fetch data semua turnamen yang terdaftar di sistem
 */
export async function fetchAllTournamentsFromApi(): Promise<{
  live: LiveTournamentData | null;
  tournaments: LiveTournamentData[];
}> {
  try {
    const res = await fetch(`/api/tournament/live?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });
    if (!res.ok) return { live: null, tournaments: [] };
    const json = await res.json();
    if (json.success) {
      const live = json.data ? normalizeTournamentData(json.data) : null;
      const tournaments = Array.isArray(json.tournaments)
        ? json.tournaments.map((t: any) => normalizeTournamentData(t))
        : live ? [live] : [];
      return { live, tournaments };
    }
    return { live: null, tournaments: [] };
  } catch (err) {
    console.error("Gagal fetchAllTournamentsFromApi:", err);
    return { live: null, tournaments: [] };
  }
}

/**
 * Beralih turnamen aktif yang ditampilkan di Beranda
 */
export async function switchActiveTournamentApi(
  tournamentId: string
): Promise<{ success: boolean; data?: LiveTournamentData; error?: string }> {
  try {
    const res = await fetch("/api/tournament/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setActiveTournamentId: tournamentId }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      const normalized = normalizeTournamentData(json.data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cees_tournament_updated", { detail: normalized }));
        localStorage.setItem("cees_tournament_updated_at", Date.now().toString());
        localStorage.setItem("cees_live_tournament_cache", JSON.stringify(normalized));
      }
      return { success: true, data: normalized };
    }
    return { success: false, error: json?.error || "Gagal beralih turnamen aktif." };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghubungi server." };
  }
}

/**
 * Simpan seluruh bundel daftar turnamen dan turnamen yang sedang diedit
 */
export async function saveTournamentsBundle(
  allTournaments: LiveTournamentData[],
  activeTournament: LiveTournamentData
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedActive = normalizeTournamentData(activeTournament);
    const normalizedList = allTournaments.map((t) =>
      t.id === normalizedActive.id ? normalizedActive : normalizeTournamentData(t)
    );

    const payload = {
      ...normalizedActive,
      allTournaments: normalizedList,
    };

    return await saveLiveTournament(payload);
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan bundel turnamen." };
  }
}

/**
 * Fetch daftar arsip turnamen dari API backend
 */
export async function fetchArchivedTournamentsFromApi(): Promise<ArchivedTournament[]> {
  try {
    const res = await fetch(`/api/tournament/archive?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Gagal fetchArchivedTournamentsFromApi:", err);
    return [];
  }
}

/**
 * Simpan data turnamen live (via API + Firestore jika aktif)
 */
export async function saveLiveTournament(
  data: LiveTournamentData
): Promise<{ success: boolean; error?: string }> {
  try {
    let fbSuccess = false;
    let apiSuccess = false;
    let apiError = "";

    // 1. Simpan ke Firestore jika aktif di client
    if (isFirebaseConfigured && db) {
      try {
        const liveDocRef = doc(db, TOURNAMENTS_COLLECTION, LIVE_DOC_ID);
        await setDoc(liveDocRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        fbSuccess = true;
      } catch (fbErr: any) {
        console.warn("Gagal update ke Firestore dari client (fallback ke API):", fbErr);
      }
    }

    // 2. Simpan ke file lokal / serverless via API
    try {
      const res = await fetch("/api/tournament/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        apiSuccess = Boolean(json?.success);
        if (!apiSuccess) {
          apiError = json?.error || "Gagal menyimpan ke server.";
        }
      } else {
        const json = await res.json().catch(() => null);
        apiError = json?.error || `Server HTTP ${res.status}`;
      }
    } catch (apiErr: any) {
      console.warn("API save live tournament error:", apiErr);
      apiError = apiErr?.message || "Kesalahan koneksi API.";
    }

    // 3. Broadcast update ke semua tab browser & simpan ke localStorage instant cache
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("cees_tournament_updated", { detail: data }));
        localStorage.setItem("cees_tournament_updated_at", Date.now().toString());
        localStorage.setItem("cees_live_tournament_cache", JSON.stringify(data));
      } catch (e) {
        // ignore storage errors
      }
    }

    if (fbSuccess || apiSuccess) {
      return { success: true };
    }

    return { success: false, error: apiError || "Gagal menyimpan turnamen." };
  } catch (err: any) {
    console.error("Error saveLiveTournament:", err);
    return { success: false, error: err.message || "Gagal menyimpan turnamen." };
  }
}

/**
 * Arsipkan turnamen saat ini
 */
export async function archiveCurrentTournament(
  data: LiveTournamentData
): Promise<{ success: boolean; error?: string }> {
  try {
    const standings = calculatePUBGMStandings(data.teams, data.matches);
    const champion = standings[0] || null;
    const runnerUp = standings[1] || null;
    const thirdPlace = standings[2] || null;

    const archivePayload: ArchivedTournament = {
      id: `arch-${data.id}-${Date.now()}`,
      archivedAt: new Date().toISOString(),
      title: data.title,
      date: data.date,
      champion,
      runnerUp: runnerUp || undefined,
      thirdPlace: thirdPlace || undefined,
      data,
      standings,
    };

    let fbSuccess = false;
    let apiSuccess = false;
    let apiError = "";

    // 1. Simpan ke Firestore jika aktif
    if (isFirebaseConfigured && db) {
      try {
        const archDocRef = doc(db, ARCHIVES_COLLECTION, archivePayload.id);
        await setDoc(archDocRef, archivePayload);
        fbSuccess = true;
      } catch (fbErr) {
        console.warn("Gagal arsip ke Firestore:", fbErr);
      }
    }

    // 2. Simpan via API
    try {
      const res = await fetch("/api/tournament/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(archivePayload),
      });

      if (res.ok) {
        const json = await res.json();
        apiSuccess = Boolean(json?.success);
        if (!apiSuccess) {
          apiError = json?.error || "Gagal menyimpan arsip ke server.";
        }
      } else {
        const json = await res.json().catch(() => null);
        apiError = json?.error || `Server HTTP ${res.status}`;
      }
    } catch (apiErr: any) {
      console.warn("API archive error:", apiErr);
      apiError = apiErr?.message || "Gagal menghubungi server arsip.";
    }

    if (fbSuccess || apiSuccess) {
      return { success: true };
    }

    return { success: false, error: apiError || "Gagal mengarsipkan turnamen." };
  } catch (err: any) {
    console.error("Error archiveCurrentTournament:", err);
    return { success: false, error: err.message || "Gagal mengarsipkan turnamen." };
  }
}

/**
 * Realtime Subscription Listener (Firestore onSnapshot + Local Broadcast + Polling)
 */
export function subscribeToLiveTournament(
  onData: (data: LiveTournamentData | null) => void
): () => void {
  let active = true;

  // Local broadcast listener (same tab & cross-tab)
  const handleLocalUpdate = (e: any) => {
    if (e?.detail) {
      onData(normalizeTournamentData(e.detail));
    } else {
      fetchLiveTournamentFromApi().then((d) => {
        if (active) onData(d);
      });
    }
  };

  const handleStorageUpdate = (e: StorageEvent) => {
    if (e.key === "cees_tournament_updated_at") {
      fetchLiveTournamentFromApi().then((d) => {
        if (active) onData(d);
      });
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("cees_tournament_updated", handleLocalUpdate);
    window.addEventListener("storage", handleStorageUpdate);
  }

  // 1. Immediate fetch from API to ensure fresh data
  fetchLiveTournamentFromApi().then((d) => {
    if (active && d) onData(d);
  });

  // 2. Firestore listener jika aktif
  let unsubscribeFirestore: (() => void) | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const liveDocRef = doc(db, TOURNAMENTS_COLLECTION, LIVE_DOC_ID);
      unsubscribeFirestore = onSnapshot(
        liveDocRef,
        (snap) => {
          if (snap.exists()) {
            onData(normalizeTournamentData(snap.data() as LiveTournamentData));
          } else {
            fetchLiveTournamentFromApi().then((d) => {
              if (active && d) onData(d);
            });
          }
        },
        (error) => {
          console.warn("Firestore onSnapshot error, fallback ke polling:", error);
          fetchLiveTournamentFromApi().then((d) => {
            if (active && d) onData(d);
          });
        }
      );
    } catch (err) {
      console.warn("Gagal init Firestore listener:", err);
    }
  }

  // 3. Fallback Interval Polling tiap 8 detik
  const interval = setInterval(() => {
    if (active) {
      fetchLiveTournamentFromApi().then((d) => {
        if (active && d) onData(d);
      });
    }
  }, 8000);

  return () => {
    active = false;
    clearInterval(interval);
    if (unsubscribeFirestore) unsubscribeFirestore();
    if (typeof window !== "undefined") {
      window.removeEventListener("cees_tournament_updated", handleLocalUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    }
  };
}
