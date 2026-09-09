# QrisSound — QRIS Live Payment Display & Soundbox

> **Live Web Display:** https://triwahyu45.github.io/QrisSound/  
> **Panel Admin / Setup:** https://triwahyu45.github.io/QrisSound/admin  
> **OBS Overlay:** https://triwahyu45.github.io/QrisSound/overlay  

Display layar kasir real-time untuk **Detronics ID** (Store ID: `23598782`) — QR Code di kiri, statistik transaksi di kanan. Setiap pembayaran masuk memunculkan alert pop-up neon + suara TTS berbahasa Indonesia:  
> *"Diterima lima puluh ribu rupiah melalui ShopeePay dari Budi. Terima kasih sudah support Detronics ID!"*

---

## Fitur Utama

| Fitur | Keterangan |
|---|---|
| **QR Code Display** | Tampil besar di kiri layar, siap di-scan (ShopeePay, GoPay, BCA, OVO, Dana, dll) |
| **Alert Pop-up Neon** | Muncul otomatis saat ada pembayaran masuk dengan badge metode pembayaran |
| **Suara TTS Otomatis** | Menyebutkan nominal dalam rupiah terbilang + metode + nama pengirim |
| **Soundbox HP via Cloud** | Otomatis bunyi saat ada notifikasi masuk dari **Shopee Partner** di HP Android |
| **Parser Notifikasi Pintar** | Mengekstrak nominal dan nama otomatis dari teks notifikasi mentah |
| **Leaderboard & Stats** | Top donatur diurutkan otomatis + Total Masuk, Jumlah Transaksi, Rata-rata |
| **Panel Admin Interaktif** | Input manual, simulator acak, kontrol volume & tes suara, setup Firebase |
| **OBS Overlay Streaming** | Halaman `/overlay` berlatar belakang transparan untuk disematkan di OBS Studio |

---

## Panduan Integrasi Soundbox HP (Shopee Partner + MacroDroid)

Agar web berbunyi otomatis setiap kali ada orang scan & transfer ke QRIS Detronics ID:

### 1. Buat Database Firebase Gratis (1x Saja)
1. Buka [console.firebase.google.com](https://console.firebase.google.com) dan login dengan akun Google.
2. Klik **Add project** (beri nama misal: `detronics-qris`).
3. Di menu sebelah kiri, pilih **Build** > **Realtime Database** > klik **Create Database** (pilih lokasi terdekat misal `Singapore / asia-southeast1`).
4. Pada tab **Rules**, ubah aturannya agar bisa dibaca & ditulis:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
5. Salin URL database Anda (contoh: `https://detronics-qris-default-rtdb.asia-southeast1.firebasedatabase.app`).
6. Buka **Panel Admin** web di `/admin`, tempelkan URL tersebut pada kotak **Firebase Realtime Database URL**, lalu klik **Simpan & Tes**.

---

### 2. Pasang MacroDroid di HP Kasir (Shopee Partner)
1. Install aplikasi **MacroDroid** (Gratis di Google Play Store) pada HP yang terpasang aplikasi **Shopee Partner** / e-wallet toko.
2. Buka MacroDroid > klik **Add Macro**:
   - **Trigger (+):** Pilih **Device Events** > **Notification** > **Notification Received** > Pilih aplikasi **Shopee Partner** (atau Mitra Shopee).
   - **Action (+):** Pilih **Connectivity** > **HTTP Request**:
     - **Method:** `POST`
     - **URL:** Masukkan URL Firebase Anda ditambah `/transactions.json`  
       *(Contoh: `https://detronics-qris-default-rtdb.asia-southeast1.firebasedatabase.app/transactions.json`)*
     - **Content type:** `application/json`
     - **Request Body:**
       ```json
       {
         "raw": "{not_ticker} {not_text}",
         "timestamp": {system_time}
       }
       ```
   - **Constraints:** Kosongkan.
3. Beri nama Macro (misal: `Forwarder QRIS Detronics`) lalu **Simpan**.

Sekarang, setiap kali HP menerima notifikasi pembayaran dari Shopee Partner, MacroDroid akan langsung menembakkannya ke Firebase, dan web display kasir akan berbunyi seketika (< 1 detik)!

---

## Menjalankan Secara Lokal

```bash
# Clone repository
git clone https://github.com/triwahyu45/QrisSound.git
cd QrisSound

# Install dependensi
npm install

# Jalankan server development
npm run dev
```

Buka di browser:
- Display Utama: `http://localhost:3000`
- Panel Admin: `http://localhost:3000/admin`
- OBS Overlay: `http://localhost:3000/overlay`

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (Cyberpunk Dark Neon theme)
- **Realtime Sync:** Firebase Realtime Database (Server-Sent Events / REST native)
- **Audio Engine:** Web Audio API (Multi-tone Chime) + Web Speech API (Indonesian TTS)
- **Deployment:** GitHub Pages via GitHub Actions (Static Export)
