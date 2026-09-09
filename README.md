# QrisSound -- QRIS Live Payment Display

> **Live Web:** https://triwahyu45.github.io/QrisSound/

Display layar kasir real-time untuk **Detronics ID** -- QR Code di kiri, statistik transaksi di kanan. Setiap pembayaran masuk memunculkan alert pop-up neon + suara TTS: *"Diterima lima puluh ribu rupiah melalui GoPay dari Budi. Terima kasih sudah support Detronics ID!"*

## Fitur

| Fitur | Keterangan |
|---|---|
| QR Code Display | Tampil besar di kiri layar, siap di-scan |
| Alert Pop-up | Muncul otomatis saat ada pembayaran masuk |
| Suara TTS | Menyebut nominal + metode pembayaran + nama pengirim |
| Metode Pembayaran | GoPay, ShopeePay, OVO, DANA, LinkAja, BCA, Mandiri, BNI, BRI, BSI, QRIS |
| Leaderboard | Top donatur diurutkan otomatis |
| Aktivitas Terkini | Feed transaksi real-time |
| Stats Cards | Total masuk, jumlah transaksi, rata-rata |
| Panel Admin | Input manual + simulator otomatis + export JSON |
| OBS Overlay | Halaman /overlay transparan untuk streaming |

## Cara Pakai

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` untuk display utama, `http://localhost:3000/admin` untuk panel admin.

Trigger pembayaran dari Panel Admin -- alert + suara TTS langsung muncul di display.

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS (dark neon theme)
- Web Speech API (TTS bahasa Indonesia)
- Web Audio API (chime notification)
- localStorage (no backend required)
