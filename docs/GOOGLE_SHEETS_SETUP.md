# Panduan Menghubungkan Form Pendaftaran CEES AREA ke Google Sheets

Sistem pendaftaran CEES AREA menggunakan **Opsi 1: Google Sheets via Webhook Web App**. Database ini **100% gratis selamanya**, tidak butuh kartu kredit, dan bisa menampung hingga **10.000.000 sel (> 500.000 pendaftar)**.

---

## Langkah 1: Buat Spreadsheet Baru di Google Drive
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, misalnya: **`Database Member CEES AREA 2026`**.
3. Di tab pertama, Anda tidak perlu repot mengetik judul kolom manual karena script akan membuatnya otomatis.

---

## Langkah 2: Buka Apps Script
1. Di menu atas Google Sheets, klik **Ekstensi (Extensions)** > **Apps Script**.
2. Hapus semua kode default `function myFunction() { ... }`.
3. Salin dan tempel (paste) kode di bawah ini:

```javascript
/**
 * Webhook Penerima Formulir Pendaftaran CEES AREA
 * Mendukung ribuan pendaftar online gratis tanpa berlangganan
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Jika sheet baru/kosong, buat baris header otomatis
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu Pendaftaran (WITA)",
        "Nama Lengkap",
        "Domisili",
        "Divisi Game",
        "Nickname In-Game",
        "ID Game",
        "Nomor WhatsApp",
        "Discord Tag",
        "Tipe Player",
        "Alasan / Motivasi",
        "Status Verifikasi"
      ]);
      
      // Styling Header: Biru Tua (#0030FF), Teks Putih Bold
      sheet.getRange(1, 1, 1, 11)
        .setFontWeight("bold")
        .setBackground("#0030FF")
        .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
    
    // Tambahkan data pendaftar baru
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" }),
      data.fullName || "-",
      data.city || "-",
      data.division || "-",
      data.gameNickname || "-",
      data.gameId || "-",
      data.whatsapp || "-",
      data.discordTag || "-",
      data.playerType || "-",
      data.motivation || "-",
      "MENUNGGU VERIFIKASI"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Data berhasil dicatat ke Google Sheets" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Klik icon **Simpan (Save)** (ikon disket) atau tekan `Ctrl + S`.

---

## Langkah 3: Deploy sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol biru **Terapkan (Deploy)** > **Penerapan Baru (New deployment)**.
2. Pada ikon gerigi (Select type), pilih **Aplikasi Web (Web app)**.
3. Konfigurasikan pengaturan berikut:
   - **Deskripsi**: `API Form CEES AREA`
   - **Jalankan sebagai (Execute as)**: **Saya (Me / email Anda)**
   - **Siapa yang memiliki akses (Who has access)**: **Siapa saja (Anyone)** *(Penting agar form di website bisa mengirim data tanpa perlu login akun Google)*.
4. Klik **Terapkan (Deploy)**.
5. Jika diminta verifikasi hak akses (*Authorization Required*):
   - Klik **Tinjau izin (Review permissions)** > Pilih akun Google Anda.
   - Klik **Lanjutan (Advanced)** > Klik **Buka... (tidak aman / unsafe)**.
   - Klik **Izinkan (Allow)**.
6. Salin **URL Aplikasi Web (Web App URL)** yang berawalan `https://script.google.com/macros/s/.../exec`.

---

## Langkah 4: Masukkan URL ke Project Website
Buka file [`.env.local`](file:///f:/Projectan/CEES_AREA/.env.local) di folder project `CEES_AREA`, lalu tempel URL yang telah disalin:

```env
GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycbx.../exec"
```

Selesai! Setiap kali ada calon member baru yang mengisi formulir di website, datanya akan langsung tersimpan otomatis secara rapi ke spreadsheet Google Drive Anda secara instan dan aman.
