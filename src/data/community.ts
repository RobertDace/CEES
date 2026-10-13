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

export const COMMUNITY_INFO = {
  name: "CEES AREA",
  memberTerm: "CEES GANK",
  tagline: "INVICTUS MANEO",
  taglineMeaning: "Tetap Tak Terkalahkan",
  establishedDate: "4 Oktober 2024",
  headquarters: "Samarinda, Kalimantan Timur",
  coverage: ["Samarinda", "Kutai Kartanegara", "Kutai Timur", "Sangatta", "Berau", "Pulau Jawa"],
  totalMembers: 90,
  sponsor: {
    name: "PAWPAW Samarinda",
    logo: "/assets/asset_15_home.png",
    instagram: "https://www.instagram.com/pawpaw.samarinda",
  },
  socials: {
    instagram: "http://instagram.com/cees.area",
    tiktok: "http://tiktok.com/ceesgankk",
    whatsapp: "http://wa.me/6285705035765",
    googleForm: "https://docs.google.com/forms/d/e/1FAIpQLSc0OiivSQJnHYvdjbOkFJaACJATiBTOyAsEbkIRnW1b295qLw/viewform",
    spreadsheet: "https://drive.google.com/open?id=1V2TwvEJ3I4Hih6LBCsFIaZwWBx-xmEBB_3EfHQugN38",
  },
};

export const FOUNDER_DATA: StaffMember = {
  id: "zidan-nata-almadani",
  name: "Zidan Nata Almadani",
  nickname: "Zaden / Basten",
  role: "Founder & Community Lead",
  division: "Eksekutif & Divisi PUBGM",
  image: "/assets/staff/zidan.png",
  bio: "Mantan atlet E-Sport lokal dari divisi PUBGM yang bertekad membangun dan memajukan ekosistem esports di Kota Samarinda dan Kalimantan Timur. Mengawali komunitas ini dari perkumpulan mabar sederhana hingga bertumbuh menjadi wadah resmi bagi lebih dari 90 anggota aktif lintas divisi kompetitif.",
  isFounder: true,
};

export const STAFF_MEMBERS: StaffMember[] = [
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

export const ACTIVITIES: ActivityEvent[] = [
  {
    id: "offtour-s1",
    title: "OFFLINE TOURNAMENT S1",
    subtitle: "BY CEES GANK X PAWPAW SAMARINDA",
    date: "13 - 14 Desember 2024",
    location: "Mall Robinson, Samarinda, Kalimantan Timur",
    partner: "PAWPAW Samarinda",
    description: "Turnamen offline perdana yang diselenggarakan oleh CEES AREA dengan peserta tim dari hampir seluruh Kabupaten dan Kota di Kalimantan Timur. Membuktikan kapasitas CEES AREA sebagai organizer kompetisi profesional dalam dua bulan pertama pendirian.",
    image: "/assets/activities/tourney_s1.png",
    tag: "TURNAMEN",
    status: "SELESAI",
  },
  {
    id: "bukber-2026",
    title: "BUKA BERSAMA 2026",
    subtitle: "Silaturahmi Ramadhan Lintas Divisi",
    date: "7 Maret 2026",
    location: "29 Coffee & Eatery, Samarinda Kota",
    description: "Momen kebersamaan tahunan untuk mempererat silaturahmi antar anggota yang berdomisili di Samarinda dan sekitarnya, membahas evaluasi komunitas dan rencana ekspansi musim mendatang.",
    image: "/assets/activities/bukber.png",
    tag: "BUKBER",
    status: "SELESAI",
  },
  {
    id: "gathering-2026",
    title: "FAMILY GATHERING CEES GANK",
    subtitle: "2 Days Seaside Escape & Team Bonding",
    date: "6 - 7 April 2026",
    location: "Villa Pantai, Samboja, Kalimantan Timur",
    partner: "PAWPAW Samarinda",
    description: "Kegiatan menginap 2 hari di villa pantai dengan rangkaian team building games, sharing session, bakar-bakar, dan mabar offline untuk memperkuat rasa kekeluargaan para member.",
    image: "/assets/activities/gathering.png",
    tag: "GATHERING",
    status: "SELESAI",
  },
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
