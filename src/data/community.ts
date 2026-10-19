export interface StaffMember {
  id: string;
  name: string;
  nickname?: string;
  role: string;
  division: string;
  image: string;
  bio: string;
  isFounder?: boolean;
}

export interface GameDivision {
  id: string;
  name: string;
  shortName: string;
  description: string;
  type: "Kompetitif" | "Kompetitif & Komunitas" | "Kasual & Komunitas";
  icon: string;
  badge: string;
  activeSince: string;
  gameUrl: string;
  accentColor: string;
  features: string[];
}

export interface ActivityEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  partner?: string;
  description: string;
  image: string;
  gallery?: string[];
  tag: "TURNAMEN" | "GATHERING" | "BUKBER";
  status: "SELESAI" | "MENDATANG";
}

export interface NewsItem {
  id: string;
  title: string;
  category: "PENGUMUMAN" | "TURNAMEN" | "ROSTER" | "KOMUNITAS" | "REKRUTMEN";
  date: string;
  summary: string;
  readTime: string;
  featured?: boolean;
}

export interface MarketFeature {
  id: string;
  title: string;
  category: string;
  desc: string;
  badge: string;
}

export interface MarketContent {
  badge: string;
  statusLabel: string;
  estimatedLaunch: string;
  headline: string;
  title: string;
  subtitle: string;
  description: string;
  noticeText: string;
  contactWhatsapp: string;
  contactButtonText: string;
  features: MarketFeature[];
}

import rawSiteContent from "./siteContent.json";
import { normalizeHomeSections, HomeSectionItem } from "@/lib/homeSections";

const siteContent: any = rawSiteContent || {};
const overrideCommunity: any = siteContent.community || {};
const overrideHome: any = siteContent.home || {};
const overrideStaff: any[] = siteContent.staff || [];
const overrideActivities: any[] = siteContent.activities || [];
const overrideQuotes: any = siteContent.quotes || {};
const overrideMarket: any = siteContent.market || {};
const overrideSectionsConfig: any[] = siteContent.sectionsConfig || [];

export const HOME_SECTIONS_CONFIG: HomeSectionItem[] = normalizeHomeSections(overrideSectionsConfig);

export const QUOTES_DATA = {
  founderQuote:
    overrideQuotes.founderQuote ||
    "Saya mantan atlet PUBGM lokal yang pengin e-sport Samarinda punya wadah sendiri. Awalnya cuma grup kecil yang sering main bareng. Sekarang kami berdiri bareng.",
  founderHighlight: overrideQuotes.founderHighlight || "berdiri bareng",
  founderVision:
    overrideQuotes.founderVision ||
    "Membangun ekosistem e-sport yang sehat dan berkelanjutan, jadi tempat menyalurkan hobi dan bakat, dan membawa nama Samarinda serta Kalimantan Timur ke level nasional.",
  founderTrackRecord:
    overrideQuotes.founderTrackRecord ||
    "Menggelar Offline Tournament S1 di Mall Robinson Samarinda bareng PAWPAW Samarinda, dua bulan setelah komunitas dideklarasikan.",
  communityQuotes: overrideQuotes.communityQuotes || [],
};

export const HOME_SECTIONS = {
  filosofiTitle: overrideHome.filosofiTitle || '"INVICTUS MANEO"',
  filosofiText:
    overrideHome.filosofiText ||
    'Diambil dari bahasa Latin yang bermakna "Tetap Tak Terkalahkan". Sebuah ikrar mentalitas bahwa apapun hasil di dalam game, semangat persaudaraan dan daya juang CEES GANK tidak akan pernah padam.',
  regionalTitle: overrideHome.regionalTitle || "SAMARINDA & KALTIM",
  regionalText:
    overrideHome.regionalText ||
    "Berpusat di ibukota Kalimantan Timur dengan anggota aktif tersebar di Kutai Kartanegara, Kutai Timur, Sangatta, Berau, hingga perwakilan di pulau Jawa.",
  solidaritasTitle: overrideHome.solidaritasTitle || "LEBIH DARI SEKADAR MABAR",
  solidaritasText:
    overrideHome.solidaritasText ||
    "Tidak hanya bertanding di turnamen dan scrim, kami rutin mengadakan agenda silaturahmi buka bersama, gathering pantai, dan turnamen offline untuk memajukan komunitas lokal.",
};

export const COMMUNITY_INFO = {
  name: overrideCommunity.name || "CEES AREA",
  memberTerm: overrideCommunity.memberTerm || "CEES GANK",
  tagline: overrideCommunity.tagline || "INVICTUS MANEO",
  taglineMeaning: overrideCommunity.taglineMeaning || "Tetap Tak Terkalahkan",
  establishedDate: overrideCommunity.establishedDate || "4 Oktober 2024",
  headquarters: overrideCommunity.headquarters || "Samarinda, Kalimantan Timur",
  coverage: ((overrideCommunity.coverage as string[]) || [
    "Samarinda",
    "Kutai Kartanegara",
    "Kutai Timur",
    "Sangatta",
    "Berau",
    "Pulau Jawa",
  ]) as string[],
  totalMembers: overrideCommunity.totalMembers || 90,
  sponsor: overrideCommunity.sponsor || {
    name: "PAWPAW Samarinda",
    logo: "/assets/asset_15_home.png",
    instagram: "https://www.instagram.com/pawpaw.samarinda",
  },
  socials: {
    instagram: overrideCommunity.socials?.instagram || "http://instagram.com/cees.area",
    tiktok: overrideCommunity.socials?.tiktok || "http://tiktok.com/ceesgankk",
    whatsapp: overrideCommunity.socials?.whatsapp || "http://wa.me/6285705035765",
    googleForm: overrideCommunity.socials?.googleForm || "https://docs.google.com/forms/d/e/1FAIpQLSc0OiivSQJnHYvdjbOkFJaACJATiBTOyAsEbkIRnW1b295qLw/viewform",
    spreadsheet: overrideCommunity.socials?.spreadsheet || "https://docs.google.com/spreadsheets/d/1y_8vLOX82RlxyZ3bjzxgp-lrEa1h4LjDVYUXDzVWGCE/edit?usp=sharing",
  },
};

const defaultFounderCandidate = overrideStaff.find((s: any) => s.isFounder);

export const FOUNDER_DATA: StaffMember = defaultFounderCandidate || {
  id: "zidan-nata-almadani",
  name: "Zidan Nata Almadani",
  nickname: "Zaden / Basten",
  role: "Founder & Community Lead",
  division: "Eksekutif & Divisi PUBGM",
  image: "/assets/staff/zaden_nata.png",
  bio: "Mantan atlet E-Sport lokal dari divisi PUBGM yang bertekad membangun dan memajukan ekosistem esports di Kota Samarinda dan Kalimantan Timur. Mengawali komunitas ini dari perkumpulan mabar sederhana hingga bertumbuh menjadi wadah resmi bagi lebih dari 90 anggota aktif lintas divisi kompetitif.",
  isFounder: true,
};

const DEFAULT_STAFF_MEMBERS: StaffMember[] = [
  FOUNDER_DATA,
  {
    id: "najmi-alvin-zuhair",
    name: "Najmi Alvin Zuhair",
    role: "Lead of Digital Media Community",
    division: "Media & Branding",
    image: "/assets/staff/najmi.png",
    bio: "Penanggung jawab publikasi digital, branding visual, dan manajemen konten media sosial Instagram serta TikTok resmi CEES AREA.",
  },
  {
    id: "resky-nanda",
    name: "Resky Nanda",
    role: "Administrator",
    division: "Divisi PUBGM",
    image: "/assets/staff/resky.png",
    bio: "Mengelola jadwal scrim kompetitif, turnamen internal, dan koordinasi roster PUBG Mobile CEES AREA.",
  },
  {
    id: "feroz-bagus-rianto",
    name: "Feroz Bagus Rianto",
    role: "Administrator",
    division: "Divisi PUBGM",
    image: "/assets/staff/feroz.png",
    bio: "Membina pembentukan skema turnamen fast scrim dan membangun koneksi dengan komunitas tim PUBG Mobile tingkat kota dan provinsi.",
  },
  {
    id: "ridho-apriyadi",
    name: "Ridho Apriyadi",
    role: "Administrator",
    division: "Divisi MLBB",
    image: "/assets/staff/ridho.png",
    bio: "Memimpin pembentukan dan operasional divisi Mobile Legends: Bang Bang yang diresmikan sejak Februari 2025 untuk mengasah rank dan turnamen tier lokal.",
  },
  {
    id: "m-renold-romansa",
    name: "M. Renold Romansa",
    role: "Administrator",
    division: "Divisi Roblox",
    image: "/assets/staff/renold.png",
    bio: "Mengkoordinasi sesi hangout santai dan multiplayer interaktif di divisi Roblox sebagai sarana refreshing dan keakraban seluruh anggota.",
  },
];

export const STAFF_MEMBERS: StaffMember[] =
  overrideStaff && overrideStaff.length > 0 ? overrideStaff : DEFAULT_STAFF_MEMBERS;

export const DIVISIONS: GameDivision[] = [
  {
    id: "pubgm",
    name: "PUBG Mobile",
    shortName: "PUBGM",
    description: "Divisi pelopor CEES AREA yang berfokus pada ranah kompetitif Battle Royale, taktik tim, dan turnamen fast scrim tingkat regional.",
    type: "Kompetitif",
    icon: "Target",
    badge: "DIVISI 01",
    activeSince: "Oktober 2024",
    gameUrl: "https://www.pubgmobile.com/id/home.shtml",
    accentColor: "#0030FF",
    features: [
      "Jadwal Scrim Rutin & Turnamen Internal",
      "Penyelenggara Offline Tournament S1 (Mall Robinson)",
      "Latihan Taktikal & Komunikasi In-Game Voice",
    ],
  },
  {
    id: "mlbb",
    name: "Mobile Legends: Bang Bang",
    shortName: "MLBB",
    description: "Divisi MOBA kompetitif yang dibentuk Februari 2025 dengan kepengurusan terstruktur untuk mengasah rank dan menorehkan prestasi turnamen lokal.",
    type: "Kompetitif & Komunitas",
    icon: "ShieldAlert",
    badge: "DIVISI 02",
    activeSince: "Februari 2025",
    gameUrl: "https://www.mobilelegends.com/",
    accentColor: "#7928CA",
    features: [
      "Mabar Rank Terjadwal (Mythic Glory Push)",
      "Evaluasi Draft Pick & Analisis Meta",
      "Sparing Antar Tim Komunitas",
    ],
  },
  {
    id: "roblox",
    name: "Roblox",
    shortName: "ROBLOX",
    description: "Divisi kasual dan pelepas penat ketika jeda bertanding. Wadah nongkrong virtual bersama yang mampu menampung banyak member sekaligus tanpa batasan ruang.",
    type: "Kasual & Komunitas",
    icon: "Gamepad2",
    badge: "DIVISI 03",
    activeSince: "2025",
    gameUrl: "https://www.roblox.com/",
    accentColor: "#00F0FF",
    features: [
      "Multiplayer Bebas & Mini Games Menyenangkan",
      "Wadah Hangout Tanpa Batas Ruang",
      "Tempat Mempererat Solidaritas Antar Anggota",
    ],
  },
];

const DEFAULT_ACTIVITIES: ActivityEvent[] = [
  {
    id: "offtour-s1",
    title: "OFFLINE TOURNAMENT S1",
    subtitle: "BY CEES GANK X PAWPAW SAMARINDA",
    date: "13 - 14 Desember 2024",
    location: "Mall Robinson, Samarinda",
    partner: "PAWPAW Samarinda",
    description: "Turnamen offline perdana yang diselenggarakan oleh CEES AREA dengan peserta tim dari hampir seluruh Kabupaten dan Kota di Kalimantan Timur. Membuktikan kapasitas CEES AREA sebagai organizer kompetisi profesional dalam dua bulan pertama pendirian.",
    image: "/assets/activities/tourney_s1.png",
    gallery: [
      "/assets/gallery/tourney_s1/tourney_s1_01.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_02.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_03.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_04.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_05.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_06.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_07.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_08.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_09.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_10.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_11.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_12.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_13.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_14.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_15.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_16.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_17.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_18.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_19.jpg",
      "/assets/gallery/tourney_s1/tourney_s1_20.jpg",
    ],
    tag: "TURNAMEN",
    status: "SELESAI",
  },
  {
    id: "bukber-akbar",
    title: "BUKA BERSAMA & MEET UP",
    subtitle: "Silaturahmi Ramadhan Lintas Divisi @Bungas Cafe & Resto",
    date: "April 2025",
    location: "Bungas Cafe & Resto, Samarinda",
    description: "Momen kebersamaan akbar seluruh anggota berbagai divisi game (PUBG Mobile, MLBB, dan Roblox) yang berdomisili di Samarinda dan sekitarnya untuk mempererat silaturahmi serta evaluasi komunitas.",
    image: "/assets/activities/bukber.png",
    gallery: [
      "/assets/gallery/bukber/bukber_01.jpg",
      "/assets/gallery/bukber/bukber_02.jpg",
      "/assets/gallery/bukber/bukber_03.jpg",
      "/assets/gallery/bukber/bukber_04.jpg",
      "/assets/gallery/bukber/bukber_05.jpg",
      "/assets/gallery/bukber/bukber_06.jpg",
      "/assets/gallery/bukber/bukber_07.jpg",
      "/assets/gallery/bukber/bukber_08.jpg",
      "/assets/gallery/bukber/bukber_09.jpg",
      "/assets/gallery/bukber/bukber_10.jpg",
    ],
    tag: "BUKBER",
    status: "SELESAI",
  },
  {
    id: "gathering-2026",
    title: "FAMILY GATHERING",
    subtitle: "2 Days Seaside Escape & Team Bonding BY CEES GANK X PAWPAW",
    date: "6 - 7 April 2026",
    location: "Villa Pantai, Samboja",
    partner: "PAWPAW Samarinda",
    description: "Kegiatan menginap 2 hari di villa pantai Samboja dengan rangkaian team building games, sharing session, bakar-bakar, dan mabar offline untuk memperkuat rasa kekeluargaan para member.",
    image: "/assets/activities/gathering.png",
    gallery: [
      "/assets/gallery/gathering/gathering_01.jpg",
      "/assets/gallery/gathering/gathering_02.jpg",
      "/assets/gallery/gathering/gathering_03.jpg",
      "/assets/gallery/gathering/gathering_04.jpg",
      "/assets/gallery/gathering/gathering_05.jpg",
      "/assets/gallery/gathering/gathering_06.jpg",
      "/assets/gallery/gathering/gathering_07.jpg",
      "/assets/gallery/gathering/gathering_08.jpg",
      "/assets/gallery/gathering/gathering_09.jpg",
      "/assets/gallery/gathering/gathering_10.jpg",
    ],
    tag: "GATHERING",
    status: "SELESAI",
  },
];

export const ACTIVITIES: ActivityEvent[] =
  overrideActivities && overrideActivities.length > 0
    ? overrideActivities.map((act: any) => {
        const defaultMatch = DEFAULT_ACTIVITIES.find((d) => d.id === act.id);
        return {
          ...act,
          gallery: act.gallery || defaultMatch?.gallery || [],
        };
      })
    : DEFAULT_ACTIVITIES;

export const COMMUNITY_HIGHLIGHTS: string[] = [
  "/assets/gallery/highlights/highlights_01.png",
  "/assets/gallery/highlights/highlights_02.jpg",
  "/assets/gallery/highlights/highlights_03.jpg",
  "/assets/gallery/highlights/highlights_04.jpg",
  "/assets/gallery/highlights/highlights_05.jpg",
  "/assets/gallery/highlights/highlights_06.jpg",
  "/assets/gallery/highlights/highlights_07.jpg",
  "/assets/gallery/highlights/highlights_08.jpg",
  "/assets/gallery/highlights/highlights_09.jpg",
  "/assets/gallery/highlights/highlights_10.jpg",
  "/assets/gallery/highlights/highlights_11.jpg",
  "/assets/gallery/highlights/highlights_12.jpg",
  "/assets/gallery/highlights/highlights_13.jpg",
  "/assets/gallery/highlights/highlights_14.jpg",
  "/assets/gallery/highlights/highlights_15.jpg",
  "/assets/gallery/highlights/highlights_16.jpg",
  "/assets/gallery/highlights/highlights_17.jpg",
  "/assets/gallery/highlights/highlights_18.jpg",
  "/assets/gallery/highlights/highlights_19.jpg",
  "/assets/gallery/highlights/highlights_20.png",
  "/assets/gallery/highlights/highlights_21.png",
  "/assets/gallery/highlights/highlights_22.png",
];

export const NEWS_LIST: NewsItem[] = [
  {
    id: "news-1",
    title: "Open Recruitment Member Baru CEES AREA 2026: Masuki Dunia Invictus Maneo",
    category: "REKRUTMEN",
    date: "Oktober 2026",
    summary: "CEES AREA resmi membuka pendaftaran member baru untuk divisi PUBG Mobile, Mobile Legends, dan Roblox. Terbuka untuk pemain kompetitif maupun penikmat mabar santai.",
    readTime: "3 min read",
    featured: true,
  },
  {
    id: "news-2",
    title: "Sukses Gelar Family Gathering di Samboja: Tingkatkan Solidaritas Lintas Divisi",
    category: "KOMUNITAS",
    date: "April 2026",
    summary: "Sebanyak puluhan anggota CEES GANK berkumpul di Pantai Samboja merayakan kekompakan komunitas sekaligus merencanakan program turnamen musim kedua.",
    readTime: "2 min read",
    featured: false,
  },
  {
    id: "news-3",
    title: "Kilasan 1 Tahun CEES AREA: Dari Mabar Warkop ke Komunitas E-Sport 90+ Anggota",
    category: "PENGUMUMAN",
    date: "Oktober 2025",
    summary: "Perjalanan Zidan Nata Almadani dan para administrator membesarkan CEES AREA sebagai wadah resmi gamers berbakat dari Samarinda hingga kancah regional.",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: "news-4",
    title: "Kolaborasi Strategis Bersama PAWPAW Samarinda Terus Berlanjut",
    category: "PENGUMUMAN",
    date: "Januari 2026",
    summary: "Dukungan penuh dari PAWPAW Samarinda menjadi pilar kokoh dalam menyelenggarakan turnamen offline dan penyediaan merchandise resmi komunitas.",
    readTime: "2 min read",
    featured: false,
  },
];

export const MARKET_DATA: MarketContent = {
  badge: overrideMarket.badge || "OFFICIAL STORE // COMING SOON",
  statusLabel: overrideMarket.statusLabel || "FASE 1: PRODUKSI & KURASI",
  estimatedLaunch: overrideMarket.estimatedLaunch || "Kuartal 3 - 2026",
  headline: overrideMarket.headline || "COMING SOON",
  title: overrideMarket.title || "CEES AREA MARKET",
  subtitle:
    overrideMarket.subtitle ||
    "Merchandise resmi CEES GANK, apparel kompetitif, gaming gear, dan layanan store komunitas segera hadir.",
  description:
    overrideMarket.description ||
    "Kami sedang meracik lini merchandise eksklusif dan platform store terpercaya khusus gamers Samarinda dan Kalimantan Timur. Dari jersey resmi bertuliskan nickname impianmu hingga streetwear khas Invictus Maneo.",
  noticeText:
    overrideMarket.noticeText ||
    "Pemberitahuan: Seluruh member terverifikasi CEES GANK berhak mendapatkan potongan harga khusus pada masa peluncuran perdana nanti.",
  contactWhatsapp: overrideMarket.contactWhatsapp || "http://wa.me/6285705035765",
  contactButtonText:
    overrideMarket.contactButtonText || "Tanya Merchandise / Kemitraan Vendor",
  features:
    overrideMarket.features && Array.isArray(overrideMarket.features)
      ? overrideMarket.features
      : [
          {
            id: "item-1",
            title: "Official Pro Team Jersey",
            category: "JERSEY DIVISI",
            desc: "Jersey dry-fit grade kompetisi resmi divisi PUBGM, MLBB, dan Roblox dengan custom nickname & nomor punggung.",
            badge: "Tahap Sampel Kain",
          },
          {
            id: "item-2",
            title: "Invictus Maneo Streetwear",
            category: "APPAREL & MERCH",
            desc: "T-shirt oversize, zipper hoodie, dan snapback bertema Invictus Maneo untuk outfit mabar maupun daily hangout.",
            badge: "Proses Desain Visual",
          },
          {
            id: "item-3",
            title: "Community Store & Game Top-Up",
            category: "SERVICES & VOUCHER",
            desc: "Layanan top-up diamond MLBB, UC PUBG Mobile, Robux, serta tiket turnamen komunitas yang cepat dan terpercaya.",
            badge: "Integrasi Sistem",
          },
        ],
};

