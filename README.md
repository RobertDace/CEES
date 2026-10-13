# CEES AREA — Official E-Sport Community Website
> **"INVICTUS MANEO"** (Tetap Tak Terkalahkan)

Website resmi komunitas E-Sport **CEES AREA** (anggotanya: **CEES GANK**) asal Samarinda, Kalimantan Timur. Didesain ulang dengan standar visual **Industrial Brutalist x Streetwear**, mempertahankan palet warna identitas `#0030FF` (Electric Cobalt Blue), dan dibangun menggunakan **Next.js 15 (App Router)** & **Tailwind CSS**.

---

## ⚡ Fitur Utama

- **Multi-Page Architecture (App Router)**:
  - `/` — Homepage dengan Hero graffiti logo resmi, metrik 90+ member, kartu divisi game, kutipan founder, dan kilasan kegiatan.
  - `/about` — Sejarah perjalanan lengkap (dari warkop mabar hingga turnamen), Visi, Misi, 3 Tujuan Organisasi, dan filosofi *Invictus Maneo*.
  - `/roster` — Profil Founder & jajaran Administrator divisi (PUBG Mobile, Mobile Legends, Roblox) dengan filter kategori.
  - `/activities` — Dokumentasi linimasa turnamen (Offline Tournament S1 di Mall Robinson Samarinda, Buka Bersama 2026, Family Gathering Samboja).
  - `/news` — Buletin resmi *E-Sport Flash* dengan filter kategori dan arsip berita.
  - `/join` — Formulir pendaftaran member baru interaktif dengan validasi data, generate pesan WhatsApp otomatis ke Admin, serta tautan cadangan ke Google Form asli.
- **Identitas Visual Asli**: Menggunakan logo graffiti monokrom resmi (`/assets/asset_01_home.png`), foto formal Founder & Staff, logo partner PAWPAW Samarinda, dan dokumentasi foto gathering offline.
- **Vercel Ready**: Konfigurasi optimal untuk zero-config deployment di Vercel dengan dukungan custom domain.

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori proyek
cd f:/Projectan/CEES_AREA

# 2. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

---

## 🌐 Panduan Deploy ke Vercel

1. **Push ke GitHub / GitLab**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete remake CEES AREA with Next.js 15 & Industrial Brutalist theme"
   git remote add origin https://github.com/<username>/cees-area.git
   git push -u origin main
   ```
2. **Import ke Vercel**:
   - Masuk ke [vercel.com](https://vercel.com)
   - Klik **"Add New Project"** dan pilih repositori `cees-area`
   - Framework preset otomatis terdeteksi sebagai **Next.js**
   - Klik **Deploy**!
3. **Hubungkan Custom Domain**:
   - Buka dashboard project di Vercel → **Settings** → **Domains**
   - Masukkan domain yang kamu inginkan (misal `ceesarea.com` atau domain gratis Vercel `cees-area.vercel.app`).

---

## 🛡️ Struktur Tim & Divisi
- **Founder & Community Lead**: Zidan Nata Almadani (*Zaden/Basten*)
- **Lead of Digital Media**: Najmi Alvin Zuhair
- **Administrators**: Resky Nanda (PUBGM), Feroz Bagus Rianto (PUBGM), Ridho Apriyadi (MLBB), M. Renold Romansa (Roblox)
- **Partner Utama**: PAWPAW Samarinda
