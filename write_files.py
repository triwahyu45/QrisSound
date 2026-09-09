import os

WORKFLOW = """\
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
"""

README = """\
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
"""

os.makedirs(".github/workflows", exist_ok=True)
with open(".github/workflows/deploy.yml", "w", newline="\n") as f:
    f.write(WORKFLOW)
print("workflow OK")

with open("README.md", "w", newline="\n", encoding="utf-8") as f:
    f.write(README)
print("README OK")

print("All done!")
