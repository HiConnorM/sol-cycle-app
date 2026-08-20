# Sol Cycle

A local-first cycle and symptom tracker built as a web app, preparing for iOS packaging via Capacitor.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS · Framer Motion · Vitest  
**Data:** 100% on-device — localStorage only, no backend, no account required  
**Target:** iOS (via Capacitor wrapper) + PWA for web

---

## Getting started

```bash
pnpm install
pnpm dev          # dev server at http://localhost:3000
pnpm build        # static export to /out (bundled into the iOS app)
pnpm test         # unit tests (runs under TZ=America/Los_Angeles)
pnpm test:tz      # the same suite across six timezones, UTC-8 to UTC+14
pnpm typecheck    # tsc --noEmit
```

### iOS

```bash
pnpm ios:assets   # regenerate the app icon and splash from public/icon-512.png
pnpm ios:sync     # build the web export and copy it into the Xcode project
pnpm ios:open     # open ios/App/App.xcodeproj in Xcode
```

> **Node 22+ is required for the Capacitor CLI.** If `nvm` puts an older
> version first on your `PATH`, prefix the iOS commands:
> `PATH=/usr/local/bin:$PATH pnpm ios:sync`

The first `xcodebuild` run downloads the Capacitor binary xcframeworks from
GitHub releases and can take several minutes with no output. It is not hung.

---

## Architecture

```
app/
  page.tsx              # root shell: privacy gate → onboarding gate → main app
  layout.tsx            # metadata, PWA manifest, service worker registration

components/sol-cycle/   # all product UI
  today-screen.tsx      # home tab: living wheel, predictions, daily log CTA
  reports-screen.tsx    # patterns, cycle stats, endo-flag cards, PMDD trend
  log-sheet.tsx         # bottom sheet: flow, symptoms, mood, notes, BBT, pain location
  insights-screen.tsx   # educational content, crisis resources
  onboarding.tsx        # 4-step first-run wizard
  privacy-consent.tsx   # first-launch privacy + medical disclaimer gate
  side-menu.tsx         # settings, care modes, data export/delete
  prediction-explainer  # expandable "why this prediction" card

lib/
  calendar/
    cycle-predictions.ts   # weighted prediction engine (recency-weighted mean, ranges, tiers)
    cycle-calculations.ts  # phase math, cycle-day helpers
    symptom-patterns.ts    # per-symptom frequency, lead indicator detection
    pmdd-profile.ts        # personal pre-period mood window + severity trend
    endo-flags.ts          # soft pain-pattern heuristics with clinician CTA
    moon-phases.ts         # overlay only — never drives predictions
    __tests__/             # 29 Vitest unit tests for the engine
  storage/
    cycle-storage.ts       # localStorage CRUD, schema migration, cycles index cache
  hooks/
    use-cycle.ts           # single hook: loads data, runs engine, exposes actions
  types/
    index.ts               # CyclePrediction, PMDDProfile, EndoFlag, CycleLog, etc.

public/
  manifest.json           # PWA manifest
  sw.js                   # cache-first service worker

docs/
  prediction-engine.md    # reference doc for all engine rules and formulas
```

---

## Prediction engine

The engine lives in `lib/calendar/cycle-predictions.ts` and is entirely deterministic — no AI, no API calls. Key properties:

- **Weighted averaging** — last 4 cycles weighted `[0.50, 0.30, 0.15, 0.05]`; falls back to plain mean when fewer than 3 cycles are recorded
- **Prediction range** — `mean ± k·σ` (k=1 for ≥3 cycles, k=1.5 for <3), clamped to ≥1 day
- **Confidence tiers** — `learning` / `low` / `medium` / `high`, mapped to honest UI copy
- **`reason[]` array** — every prediction carries human-readable reasoning the user can inspect
- **Daily adjustment** — `adjustPredictionWithToday()` nudges the predicted start based on the user's own historically confirmed lead-indicator symptoms (rule-based, no ML)

See [`docs/prediction-engine.md`](docs/prediction-engine.md) for the full spec.

---

## Safety principles

- Sol Cycle surfaces **patterns for personal awareness**, not diagnoses.
- All PMDD and pain-pattern flags are gated by a minimum of **2 completed cycles** of evidence before anything is shown.
- The "Suicidal thoughts" symptom triggers an **immediate crisis resource banner** (988 + Crisis Text Line) above the save button.
- Language throughout avoids clinical claims: *"pattern noticed"* not *"condition detected"*.
- A hosted privacy policy URL is required before App Store submission (see [launch checklist](#ios-launch-checklist)).

---

## iOS launch checklist

Done:

- [x] Capacitor wrapper set up — `capacitor.config.ts`, native project in `ios/`
- [x] Static export configured (`output: 'export'` in `next.config.mjs`)
- [x] iOS simulator runtime installed in Xcode
- [x] Biometric lock wired to a native Face ID / Touch ID plugin, with the
      WebAuthn implementation kept as the web fallback (`lib/biometric/`)
- [x] Safe-area insets applied to every screen header, bottom nav and overlay
- [x] 1024×1024 App Store icon, no alpha channel (`pnpm ios:assets`)
- [x] `NSFaceIDUsageDescription` and `ITSAppUsesNonExemptEncryption` in Info.plist
- [x] Portrait-only orientation, `arm64` device capability
- [x] Reduce Motion honoured for both CSS and framer-motion animations
- [x] No analytics, telemetry, or third-party SDKs — the privacy policy says so
      and it is now literally true

Still to do:

- [ ] Apple Developer account + real bundle ID (currently `app.solcycle`)
- [ ] Signing team and provisioning profile set in Xcode
- [ ] Push notifications wired (period reminders, phase change alerts)
- [ ] Hosted privacy policy URL added to App Store Connect
- [ ] Dark mode QA pass on a real device
- [ ] VoiceOver accessibility audit
- [ ] App Store screenshots (6.7", 6.5", 5.5")
- [ ] App Privacy nutrition label completed in App Store Connect
- [ ] Medical disclaimer in App Store long description

---

## Running tests

```bash
pnpm test          # run once, under TZ=America/Los_Angeles
pnpm test:watch    # watch mode
pnpm test:tz       # the whole suite across six timezones
```

| Suite | Covers |
| --- | --- |
| `lib/calendar/__tests__/engine.test.ts` | prediction engine, PMDD profile, endo-flag heuristics |
| `lib/utils/__tests__/date-keys.test.ts` | local-date handling, DST boundaries, UTC-drift regressions |
| `lib/storage/__tests__/cycle-storage.test.ts` | log CRUD, cycles index, migration, `clearAllData` completeness, change notification |
| `lib/storage/__tests__/tasks-storage.test.ts` | task CRUD and recurrence rollover |

The default timezone is deliberately **not** UTC. A whole class of bug in this
app — logs filed under the wrong calendar day — is invisible when the tests run
at UTC+0, so the suite runs west of it by default and `pnpm test:tz` sweeps both
directions.

---

## Contributing

This project is in active development toward a v1 App Store release. The current focus is **release hardening** — stability, accessibility, and compliance — not new features.

Branch naming: `feature/*` for new work, `fix/*` for bug fixes, `release/*` for hardening passes.
