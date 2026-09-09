# Project: Detronics ID QRIS & Live Stream Payment Overlay

## Architecture
- **Framework**: Next.js 14/15 App Router with TypeScript and Tailwind CSS.
- **UI System**: Cyber-Mechatronics Dark Theme with neon emerald (`#10b981`), cyan (`#06b6d4`), and gold (`#fbbf24`) accents, Lucide React icons, and Canvas Confetti.
- **Data & State Engine**: Client-side reactive transaction store with `localStorage` persistence, case-insensitive donor aggregation, and sorting.
- **Real-Time Cross-Window Sync**: Native `BroadcastChannel` (`detronics_sync_channel`) + `StorageEvent` fallback with de-duplication cache ensuring sub-50ms sync between OBS docks, overlays, and browser tabs without an external server.
- **Audio & Soundbox Pipeline**: Web Audio API two-stage metallic chime synthesizer (E6/G#6/B6 harmonics) + Web Speech API Indonesian TTS (`id-ID`) + formal recursive Indonesian `terbilang` algorithm (1 to Trillions).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Next.js App Shell & Cyber-Neon Theme | Modern responsive layout, Cyberpunk dark palette, neon glow classes, font loading, route setup. | M1 | Survey / R1 |
| 2 | Official QRIS & Brand Assets Bundling | Mount `QRIS Detronics ID.png`, brand logos, and metadata into `public/` directory. | M1 | Survey / Ref Materials |
| 3 | Core Data Contracts & Types | Strict TypeScript models for `Transaction`, `LeaderboardEntry`, `AudioSettings`, `SyncMessage`. | M2 | Survey / Specs |
| 4 | Real-time Cross-Window Event Bus | Dual-layer `BroadcastChannel` + `localStorage` event sync with de-duplication cache. | M2 | Survey / Specs |
| 5 | Cumulative Leaderboard State Store | User deduplication, cumulative amount calculation, sorting, and `localStorage` persistence. | M2 | Survey / R3 |
| 6 | Indonesian Terbilang Number-to-Words | Formal Indonesian currency conversion algorithm (e.g. 50000 -> "lima puluh ribu") supporting up to trillions. | M3 | Survey / R4 |
| 7 | Web Audio API ShopeePay Chime | Dual-tone metallic bell chime synthesizer with natural decay envelope and zero external dependencies. | M3 | Survey / R4 |
| 8 | Indonesian Soundbox TTS Engine | Web Speech API voice announcer formatting: *"Pembayaran sebesar [Terbilang] rupiah dari [Nama] berhasil diterima oleh Detronics ID."* | M3 | Survey / R4 |
| 9 | Custom Message Voice Reading | Reads donor's custom message after payment announcement with FIFO speech queue. | M3 | Survey / R4 |
| 10 | Audio Unlock & Settings Controller | Browser autoplay policy unlock banner, test buttons, volume sliders, and mute toggle. | M3 | Survey / R4 |
| 11 | Kiosk QRIS Card & Laser Scanner | Full scannable QRIS presentation with Store ID `23598782`, NMID `ID1026581652942`, scan guides, and animated laser beam. | M4 | Survey / R1 |
| 12 | Kiosk Cumulative Leaderboard Display | High-visibility leaderboard with Gold Crown (#1), Silver Medal (#2), Bronze Award (#3) badges. | M4 | Survey / R1, R3 |
| 13 | Kiosk Real-time Activity Feed | Live activity ticker displaying recent transfers with relative timestamps. | M4 | Survey / R1, R2 |
| 14 | OBS Stream Overlay (`/overlay`) Route | Transparent background (`bg-transparent`) optimized for OBS Studio Browser Source. | M5 | Survey / R1 |
| 15 | Celebration Alert Modal & Banner | Dynamic animated pop-up banner showing donor name, formatted Rupiah amount, message, and timestamp. | M5 | Survey / R2 |
| 16 | Tiered Canvas Confetti & FX | Multi-tier particle explosion (1k-20k: standard, 25k-99k: high, 100k+: fireworks barrage). | M5 | Survey / R2 |
| 17 | Compact Overlay Leaderboard Widget | Stream-friendly floating mini-leaderboard for OBS stream layout. | M5 | Survey / R1, R3 |
| 18 | Streamer Control Panel (`/admin`) Form | Fast manual donation trigger (Name, Amount, Message) with instant 1-click broadcast. | M6 | Survey / R5 |
| 19 | Quick Amount Preset Buttons | 6 preset buttons (`Rp 2.000`, `Rp 5.000`, `Rp 10.000`, `Rp 25.000`, `Rp 50.000`, `Rp 100.000`). | M6 | Survey / R5 |
| 20 | Mechatronics Auto-Simulator Engine | Automated random mock donation generator with electronics/coding jokes and configurable intervals. | M6 | Survey / R5 |
| 21 | Transaction Manager & JSON Export/Import | History table, search, individual delete, full reset session, and backup/restore JSON. | M6 | Survey / R3, R5 |
| 22 | Automated Verification & E2E Validation | Playwright E2E and unit test suites validating all acceptance criteria with exit code 0. | M7 | Survey / AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | App Shell, Assets & Cyber-Neon Theming | Scaffolding, Tailwind configuration, cyber-neon theme, asset bundling (`public/`), route skeletons. | None | DONE |
| M2 | Core State Engine, Real-time Sync & Storage | TypeScript types, `transactionStore.ts`, `broadcastChannel.ts`, `mockData.ts`, utility helpers. | M1 | DONE |
| M3 | Indonesian Soundbox TTS & Audio Synthesizer | `terbilang.ts`, `chimeSynthesizer.ts`, `ttsEngine.ts`, Soundbox controller, audio test panel. | M2 | DONE |
| M4 | Kiosk Showcase Mode (`/`) & QRIS Display | `QRISCard.tsx`, Store ID `23598782`, `KioskLeaderboard.tsx`, `ActivityFeed.tsx`, Kiosk page. | M3 | IN_PROGRESS |
| M5 | OBS Stream Overlay (`/overlay`) & Alerts | `OverlayAlert.tsx`, `OverlayLeaderboard.tsx`, `ConfettiCanvas.tsx`, OBS transparent page. | M4 | PLANNED |
| M6 | Streamer Control Panel (`/admin`) & Simulator | `ManualTriggerForm.tsx`, Quick buttons, `SimulatorEngine.tsx`, `TransactionManager.tsx`, Admin page. | M5 | PLANNED |
| M7 | E2E Integration, Verification & Hardening | Pass 100% E2E test suites (Tiers 1-4), automated verification script, Tier 5 adversarial hardening. | M6 | PLANNED |

## Interface Contracts

### 1. Data Models (`types/index.ts`)
```typescript
export interface Transaction {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  timestamp: number;
  source: 'manual' | 'simulator' | 'api';
}

export interface LeaderboardEntry {
  rank: number;
  donorName: string;
  totalAmount: number;
  transactionCount: number;
  lastDonatedAt: number;
  highestDonation: number;
}

export interface SyncMessage<T = unknown> {
  eventId: string;
  type: 'NEW_DONATION' | 'CLEAR_ALL' | 'DELETE_TRANSACTION' | 'UPDATE_SETTINGS' | 'SYNC_STATE';
  payload: T;
  timestamp: number;
  senderId: string;
}
```

### 2. Indonesian Terbilang (`lib/terbilang.ts`)
- `terbilang(amount: number): string` -> converts IDR number to Indonesian word string.
- `buildSoundboxSpeech(name: string, amount: number, message?: string): string` -> returns full speech utterance.

### 3. Audio Engine (`lib/audio/`)
- `chimeSynthesizer.playShopeeChime(volume?: number): Promise<void>`
- `ttsEngine.announceDonation(name: string, amount: number, message?: string, options?: AudioOptions): Promise<void>`

### 4. Storage & Sync (`lib/storage/` & `lib/sync/`)
- `addTransaction(donorName: string, amount: number, message?: string, source?: string): Transaction`
- `getStoredTransactions(): Transaction[]`
- `calculateLeaderboard(transactions: Transaction[]): LeaderboardEntry[]`
- `syncBus.publish(type: SyncEventType, payload: any): void`
- `syncBus.subscribe(type: SyncEventType, callback: (msg: SyncMessage) => void): () => void`

## Code Layout
```
Detronics_QRIS_Display/
├── app/
│   ├── layout.tsx                # Global HTML shell & metadata
│   ├── globals.css               # Neon styles, scanline animations, OBS transparency
│   ├── page.tsx                  # Kiosk / Merchant Mode (`/`)
│   ├── overlay/page.tsx          # OBS Stream Overlay (`/overlay`)
│   └── admin/page.tsx            # Streamer Control Panel (`/admin`)
├── components/
│   ├── alert/                    # Alert banners & celebration modals
│   ├── audio/                    # Audio controller & unlock banner
│   ├── kiosk/                    # QRIS Card, Kiosk Leaderboard, Activity Feed
│   ├── overlay/                  # Overlay Alert, Mini Leaderboard, Floating QR
│   ├── admin/                    # Manual form, Quick buttons, Simulator, Manager
│   ├── ui/                       # CyberBadge, CyberCard, Neon Button, Modal
│   └── confetti/                 # Canvas Confetti particle burst wrapper
├── lib/
│   ├── audio/                    # Chime synthesizer & TTS engine
│   ├── sync/                     # BroadcastChannel real-time sync bus
│   ├── storage/                  # LocalStorage & Leaderboard accumulator
│   ├── terbilang.ts              # Indonesian number-to-words algorithm
│   ├── mockData.ts               # Mechatronics mock data & preset messages
│   └── utils.ts                  # IDR currency & date formatters
├── types/
│   └── index.ts                  # Core TypeScript interfaces
├── public/
│   ├── qris-detronics.png        # Official QRIS image (Store ID: 23598782)
│   ├── logo.png                  # Detronics ID circuit logo
│   └── logo-horizontal.png       # Horizontal logo
└── tests/
    ├── unit/                     # Terbilang & accumulator unit tests
    └── e2e/                      # Opaque-box E2E test suites (Tiers 1-4)
```
