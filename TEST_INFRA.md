# E2E Test Infra: Detronics ID QRIS & Live Stream Payment Overlay

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Kiosk Display (`/`) & QRIS Card | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | OBS Stream Overlay (`/overlay`) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Real-time Alert Pop-up & Banner | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 4 | Cumulative Leaderboard & Badges | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 5 | Soundbox TTS & Indonesian Terbilang | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 6 | Streamer Control Panel & Simulator | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: `node --import tsx` / `vitest` / automated test runner
- Test case format: Automated unit + headless integration assertions
- Directory layout: `tests/`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Live Stream Super-Hype Raid (Rapid donations from 10 users) | F3, F4, F5, F6 | High |
| 2 | Streamer Manual Trigger & OBS Sync (Dual-tab sync) | F1, F2, F3, F6 | High |
| 3 | Large Donation (Rp 10.000.000) with Long Custom Message | F3, F4, F5 | Medium |
| 4 | Session Backup, Reset & JSON Restore | F4, F6 | Medium |
| 5 | Edge Case Zero/Negative & Auto-Simulator | F5, F6 | Medium |

## Coverage Thresholds
- Tier 1: ≥30 tests (5 × 6 features)
- Tier 2: ≥30 tests (5 × 6 features)
- Tier 3: ≥6 pairwise tests
- Tier 4: ≥5 realistic application scenarios
- Total: ≥71 test cases
