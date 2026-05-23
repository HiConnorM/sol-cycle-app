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
pnpm build        # static export to /out (required for Capacitor)
pnpm test         # run the prediction engine unit tests
```

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

- [ ] Capacitor wrapper set up (`pnpm add @capacitor/core @capacitor/cli @capacitor/ios`)
- [ ] Static export configured (`output: 'export'` in `next.config.mjs`)
- [ ] iOS simulator runtime installed in Xcode
- [ ] Biometric lock (Face ID / Touch ID) wired via Capacitor plugin
- [ ] Push notifications wired (period reminders, phase change alerts)
- [ ] Hosted privacy policy URL added to App Store Connect
- [ ] Safe area insets audited on iPhone with Dynamic Island, notch, and SE
- [ ] Dark mode QA pass on real device
- [ ] VoiceOver accessibility audit
- [ ] App Store screenshots (6.7", 6.5", 5.5")
- [ ] 1024×1024 App Store icon (no alpha channel)
- [ ] App Privacy nutrition label completed in App Store Connect
- [ ] Medical disclaimer in App Store long description

---

## Running tests

```bash
pnpm test          # run once
pnpm test:watch    # watch mode
```

Tests live in `lib/calendar/__tests__/engine.test.ts` and cover the prediction engine, PMDD profile, and endo-flag heuristics.

---

## Contributing

This project is in active development toward a v1 App Store release. The current focus is **release hardening** — stability, accessibility, and compliance — not new features.

Branch naming: `feature/*` for new work, `fix/*` for bug fixes, `release/*` for hardening passes.
