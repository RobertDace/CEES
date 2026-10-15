import crypto from "crypto";

/**
 * Hash password menggunakan algoritma Scrypt bawaan Node.js (Memory-hard & Brute-force resistant)
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

/**
 * Verifikasi kecocokan password dengan hash dan salt tersimpan
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString("hex"), "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");
    return crypto.timingSafeEqual(keyBuffer, storedBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Filter data pribadi untuk konsumsi publik (Zero PII Leakage)
 * Menghilangkan nomor WhatsApp, nama lengkap asli, dan motivasi pribadi dari output publik.
 */
export function sanitizePublicProfile(member: any) {
  if (!member) return null;
  return {
    id: member.id,
    gameNickname: member.gameNickname,
    division: member.division || "ALL",
    city: member.city || "Samarinda",
    playerType: member.playerType || "Member",
    verified: Boolean(member.verified),
    status: member.status || "MEMBER RESMI",
    avatarUrl: member.avatarUrl || "/assets/default_avatar.jpg",
    joinedAt: member.timestamp || member.submittedAtIso || new Date().toISOString(),
  };
}

/**
 * Buat token sesi aman berbasis HMAC-SHA256
 */
const TOKEN_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_SECRET || "cees_invictus_maneo_secret_2026";

export function signSessionToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken<T = any>(token: string): T | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(data)
      .digest("base64url");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
      // Cek expiry jika ada
      if (payload.expiresAt && Date.now() > new Date(payload.expiresAt).getTime()) {
        return null;
      }
      return payload as T;
    }
  } catch (err) {
    // invalid token
  }
  return null;
}
