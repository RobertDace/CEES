import rawSiteContent from "@/data/siteContent.json";

export interface HomeSectionItem {
  id: string;
  label: string;
  subtitle: string;
  badge: string;
  enabled: boolean;
}

export interface HomeSectionsContent {
  // 1. Hero
  heroSticker?: string;
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  heroTitleLine3?: string;
  heroDescription?: string;
  heroPrimaryBtn?: string;
  heroSecondaryBtn?: string;

  // 2. Tournament
  tournamentBadge?: string;
  tournamentTitle?: string;
  tournamentSubtitle?: string;

  // 3. Motto (3 Pilar)
  filosofiTitle?: string;
  filosofiText?: string;
  regionalTitle?: string;
  regionalText?: string;
  solidaritasTitle?: string;
  solidaritasText?: string;

  // 4. Divisions
  divisionsBadge?: string;
  divisionsTitle?: string;
  divisionsSubtitle?: string;
  divisionsBtn?: string;

  // 5. Founder
  founderBadge?: string;
  founderTitle?: string;
  founderSubtitle?: string;

  // 6. Activities
  activitiesBadge?: string;
  activitiesTitle?: string;
  activitiesBtn?: string;

  // 7. Roster
  rosterBadge?: string;
  rosterTitle?: string;
  rosterSubtitle?: string;

  // 8. CTA Join
  ctaBadge?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryBtn?: string;
  ctaSecondaryBtn?: string;
}

export const DEFAULT_HOME_SECTIONS: HomeSectionItem[] = [
  {
    id: "hero",
    label: "Hero Section & Slogan Utama",
    subtitle: "Banner utama, 3D emblem, teks pengenalan & motto Invictus Maneo",
    badge: "HEADER // 01",
    enabled: true,
  },
  {
    id: "tournament",
    label: "Live Event & Standings Turnamen",
    subtitle: "Klasemen turnamen PUBGM realtime, match sheet & perolehan poin",
    badge: "E-SPORTS // 02",
    enabled: true,
  },
  {
    id: "motto",
    label: "Tiga Pilar Nilai Komunitas",
    subtitle: "Kartu 3 pilar: Filosofi Invictus, Akar Regional Kaltim, Solidaritas",
    badge: "PILAR // 03",
    enabled: true,
  },
  {
    id: "divisions",
    label: "Divisi Game Resmi",
    subtitle: "Panggung tempur: PUBG Mobile, Mobile Legends, dan Roblox",
    badge: "DIVISI // 04",
    enabled: true,
  },
  {
    id: "founder",
    label: "Founder Feature Spotlight",
    subtitle: "Profil pendiri Zidan Nata Almadani, rekam jejak, & visi Samarinda",
    badge: "FOUNDER // 05",
    enabled: true,
  },
  {
    id: "activities",
    label: "Rekam Jejak & Kegiatan",
    subtitle: "Dokumentasi agenda buka bersama, gathering pantai, turnamen offline",
    badge: "AGENDA // 06",
    enabled: true,
  },
  {
    id: "roster",
    label: "Live Registered Member Roster",
    subtitle: "Roster live anggota resmi CEES GANK terverifikasi & kartu digital",
    badge: "MEMBER // 07",
    enabled: true,
  },
  {
    id: "cta",
    label: "Call to Action (Pendaftaran Member)",
    subtitle: "Banner ajakan bergabung dan tombol kontak WhatsApp pengurus",
    badge: "JOIN // 08",
    enabled: true,
  },
];

export const DEFAULT_HOME_CONTENT: HomeSectionsContent = {
  // 1. Hero
  heroSticker: "Komunitas E-Sport · Samarinda, Kaltim",
  heroTitleLine1: "Welcome",
  heroTitleLine2: "to our",
  heroTitleLine3: "Area.",
  heroDescription:
    "Komunitas e-sport asal Samarinda yang dibangun dari tongkrongan mabar. Sekarang jadi rumah buat pemain PUBG Mobile, Mobile Legends, dan Roblox se-Kalimantan Timur.",
  heroPrimaryBtn: "Daftar member baru",
  heroSecondaryBtn: "Kenalan dulu",

  // 2. Tournament
  tournamentBadge: "LIVE E-SPORTS MATCH // PMWC RULES",
  tournamentTitle: "CEES TOURNAMENT STANDINGS",
  tournamentSubtitle: "Pantau poin eliminasi, peringkat tim, dan rekap pertandingan live se-Kaltim.",

  // 3. Motto
  filosofiTitle: '"INVICTUS MANEO"',
  filosofiText:
    'Diambil dari bahasa Latin yang bermakna "Tetap Tak Terkalahkan". Sebuah ikrar mentalitas bahwa apapun hasil di dalam game, semangat persaudaraan dan daya juang CEES GANK tidak akan pernah padam.',
  regionalTitle: "SAMARINDA & KALTIM",
  regionalText:
    "Berpusat di ibukota Kalimantan Timur dengan anggota aktif tersebar di Kutai Kartanegara, Kutai Timur, Sangatta, Berau, hingga perwakilan di pulau Jawa.",
  solidaritasTitle: "LEBIH DARI SEKADAR MABAR",
  solidaritasText:
    "Tidak hanya bertanding di turnamen dan scrim, kami rutin mengadakan agenda silaturahmi buka bersama, gathering pantai, dan turnamen offline untuk memajukan komunitas lokal.",

  // 4. Divisions
  divisionsBadge: "Divisi Game Resmi",
  divisionsTitle: "DIVISI RESMI CEES AREA",
  divisionsSubtitle:
    "Pilih panggung tempurmu. Mulai dari strategi bertahan hidup di Battle Royale, taktik objektif di MOBA, hingga keseruan tanpa batas di Roblox.",
  divisionsBtn: "DAFTAR SEMUA DIVISI",

  // 5. Founder
  founderBadge: "[03] Founder",
  founderTitle: "Dari mabar jadi rumah.",
  founderSubtitle: "Cerita singkat orang di balik berdirinya CEES AREA pada 4 Oktober 2024.",

  // 6. Activities
  activitiesBadge: "Dokumentasi & Agenda",
  activitiesTitle: "REKAM JEJAK & KEGIATAN",
  activitiesBtn: "LIHAT SEMUA DOKUMENTASI",

  // 7. Roster
  rosterBadge: "LIVE DATABASE FEED • REALTIME",
  rosterTitle: "DATA MEMBER BERGABUNG LIVE",
  rosterSubtitle:
    "Daftar seluruh anggota komunitas CEES AREA, baik pendaftar baru maupun anggota terverifikasi (Realtime Live Feed).",

  // 8. CTA
  ctaBadge: "Pendaftaran Anggota Baru 2026",
  ctaTitle: "SIAP BERGABUNG DENGAN CEES GANK SAMARINDA?",
  ctaDescription:
    "Tidak harus pro player! Apapun tingkat keahlianmu, jika kamu memiliki komitmen, sikap saling menghargai, dan ingin berteman akrab, pintu CEES AREA selalu terbuka untukmu.",
  ctaPrimaryBtn: "ISI FORMULIR PENDAFTARAN",
  ctaSecondaryBtn: "HUBUNGI ADMIN VIA WHATSAPP",
};

/**
 * Normalizes raw section configuration from database / JSON.
 */
export function normalizeHomeSections(savedSections?: any[]): HomeSectionItem[] {
  if (!Array.isArray(savedSections) || savedSections.length === 0) {
    return DEFAULT_HOME_SECTIONS;
  }

  const defaultMap = new Map(DEFAULT_HOME_SECTIONS.map((s) => [s.id, s]));
  const result: HomeSectionItem[] = [];
  const visitedIds = new Set<string>();

  for (const item of savedSections) {
    if (typeof item === "string") {
      const def = defaultMap.get(item);
      if (def && !visitedIds.has(item)) {
        result.push({ ...def, enabled: true });
        visitedIds.add(item);
      }
    } else if (item && typeof item.id === "string") {
      const def = defaultMap.get(item.id);
      if (def && !visitedIds.has(item.id)) {
        result.push({
          ...def,
          label: item.label || def.label,
          subtitle: item.subtitle || def.subtitle,
          badge: item.badge || def.badge,
          enabled: typeof item.enabled === "boolean" ? item.enabled : true,
        });
        visitedIds.add(item.id);
      }
    }
  }

  for (const def of DEFAULT_HOME_SECTIONS) {
    if (!visitedIds.has(def.id)) {
      result.push({ ...def });
      visitedIds.add(def.id);
    }
  }

  return result;
}

/**
 * Normalizes home content, merging saved fields with defaults.
 */
export function normalizeHomeContent(saved?: any): HomeSectionsContent {
  if (!saved || typeof saved !== "object") {
    return { ...DEFAULT_HOME_CONTENT };
  }
  return {
    ...DEFAULT_HOME_CONTENT,
    ...saved,
  };
}

/**
 * Universal helper to read latest site content including section configuration.
 */
export function getRuntimeSiteContent(): any {
  if (typeof globalThis !== "undefined" && (globalThis as any).__cees_site_content) {
    return (globalThis as any).__cees_site_content;
  }
  return rawSiteContent || {};
}
