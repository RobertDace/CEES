# Panduan Menghubungkan CEES AREA ke Firebase Cloud Firestore (Opsi 3)

Dengan **Firebase Cloud Firestore**, data formulir pendaftaran disimpan langsung ke database cloud Google secara **aman, gratis, dan otomatis sinkron secara real-time** tanpa perlu Google Apps Script atau spreadsheet webhook.

### Keuntungan Firebase Firestore (Spark Plan - 100% Gratis Selamanya):
- **50.000 Read/hari** dan **20.000 Write/hari** (sangat besar untuk komunitas).
- **1 GB Storage** (mampu menampung ratusan ribu data anggota).
- **Real-Time**: Begitu ada pendaftar baru, otomatis tersimpan ke cloud dan bisa dilihat langsung di console Firebase maupun di website.

---

## Langkah 1: Buat Proyek Firebase (1 Menit)
1. Buka [Firebase Console](https://console.firebase.google.com/) di browser Anda.
2. Klik **Add project** (Tambahkan proyek).
3. Beri nama proyek, misalnya: **`cees-area`** > Klik **Continue**.
4. (Opsional) Google Analytics bisa dinonaktifkan atau diaktifkan sesuai keinginan > Klik **Create project**.
5. Tunggu beberapa detik hingga proyek siap > Klik **Continue**.

---

## Langkah 2: Buat Database Firestore
1. Di menu sidebar kiri, klik **Build** (Buat) > pilih **Firestore Database**.
2. Klik tombol **Create database** (Buat database).
3. Pilih lokasi database: pilih yang terdekat seperti **`asia-southeast2 (Jakarta)`** atau lokasi default.
4. Pada bagian aturan keamanan (*Security rules*):
   - Pilih **Start in test mode** (Mulai dalam mode pengujian) agar form website bisa langsung menyimpan data.
5. Klik **Create** / **Enable**. Database Firestore Anda sudah aktif!

---

## Langkah 3: Dapatkan Kredensial Web App
1. Di sidebar kiri paling atas, klik ikon gerigi ⚙️ (**Project settings** / Setelan proyek).
2. Gulir ke bawah ke bagian **Your apps** (Aplikasi Anda).
3. Klik ikon web **`</>`** untuk menambahkan web app.
4. Masukkan nama aplikasi: **`CEES AREA Web`** (centang Firebase Hosting tidak perlu diisi).
5. Klik **Register app** (Daftarkan aplikasi).
6. Anda akan melihat kode `const firebaseConfig = { ... }` seperti contoh ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxx",
  authDomain: "cees-area-xxxxx.firebaseapp.com",
  projectId: "cees-area-xxxxx",
  storageBucket: "cees-area-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## Langkah 4: Tempel ke File `.env.local`
Buka file [`.env.local`](file:///f:/Projectan/CEES_AREA/.env.local) di folder project `CEES_AREA`, lalu masukkan nilainya:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyD-xxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="cees-area-xxxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="cees-area-xxxxx"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="cees-area-xxxxx.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

---

## Langkah 5: Restart Dev Server & Uji Coba
1. Restart terminal Next.js (`Ctrl + C` lalu jalankan `npm run dev`).
2. Buka form pendaftaran di **http://localhost:3000/join**.
3. Isi formulir dan klik kirim.
4. Data pendaftaran akan otomatis masuk ke koleksi `members` di Firebase Firestore Anda secara instan dan aman!
