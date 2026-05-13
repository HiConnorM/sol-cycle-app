# Sol Cycle — Prediction Engine Reference

_Last updated: 2026-05-13. Keep this document in sync when changing engine rules._

---

## Principles

1. **Local-first.** All computation runs in the browser. No server, no AI API.
2. **Explainable.** Every prediction carries a `reason[]` array the UI can show.
3. **Honest uncertainty.** Variable cycles produce wide prediction windows, not false precision.
4. **Descriptive, not diagnostic.** PMDD and pain patterns are named as patterns, never as diagnoses.

---

## Core prediction flow

```
logs + settings
      │
      ▼
buildCyclesIndex()           → CycleHistoryEntry[] (startDate + length per cycle)
      │
      ▼
analyzeCyclePatterns()       → CyclePrediction
  ├─ weightedMean(last 4)    → projectedCycleLength
  ├─ stdDev()                → cycleLengthStdDev
  ├─ confidence (100 - σ×10) → 0–100 number
  ├─ confidenceTier           → learning | low | medium | high
  ├─ nextPeriodStart          → anchor + projectedLength
  ├─ nextPeriodRange          → ± k·σ, clamped ≥1 day
  └─ reason[]                → human-readable explanation strings
      │
      ▼
adjustPredictionWithToday()  → nudged CyclePrediction
  ├─ lead-indicator symptom match → shift earlier
  └─ past-predicted-latest date  → shift later
```

---

## Confidence tiers

| Tier | Cycles observed | Confidence | UI copy |
|---|---|---|---|
| `learning` | < 3 | any | "Still learning" |
| `low` | ≥ 3 | < 50 | "Low confidence" |
| `medium` | ≥ 3 | 50–74 | "Getting there" |
| `high` | ≥ 3 | ≥ 75 | "Reliable" |

Confidence = `max(0, min(100, round(100 - stdDev × 10)))`. A std dev of 0 = 100%; std dev of 10+ = 0%.

---

## Recency weights

Up to the last 4 completed cycles (newest first): `[0.50, 0.30, 0.15, 0.05]`.  
Falls back to unweighted mean when < 3 completed cycles.

---

## Prediction range

`nextPeriodRange = {earliest: start − k·σ, latest: start + k·σ}` where:
- `k = 1` for ≥ 3 cycles, `k = 1.5` for < 3 cycles
- Half-width is clamped to `max(1, round(σ × k))` days, and minimum 3 days when < 3 cycles

A std dev of 0 (perfectly regular) still yields a ≥1-day window so the UI never shows a false point estimate.

---

## Period detection (single source of truth)

`detectPeriodStartDates(logs)` in `lib/storage/cycle-storage.ts`:

A period **start** is any flow-day (`flow !== 'none' && flow !== 'spotting'`) where either:
- It is the first log entry, OR
- The previous log entry was > 1 day before it, OR
- The previous log entry had no/spotting flow

This is the only place period starts are computed. The engine, PMDD profile, and symptom patterns all call this function, never re-implement it.

---

## Symptom patterns (`lib/calendar/symptom-patterns.ts`)

- Cycle day is computed via `getCycleDayFromDate(date, periodStarts)` — never `index % cycleLength`.
- A symptom needs ≥ 2 occurrences to appear in patterns (configurable).
- **Lead indicator**: a symptom that appears in the last 7 days before period start in ≥ 60% of completed cycles.
- Lead indicators feed `adjustPredictionWithToday()`.

---

## PMDD profile (`lib/calendar/pmdd-profile.ts`)

- Requires ≥ 2 completed cycles with PMDD-category symptoms in the pre-period window.
- Window start = `projectedCycleLength − avgEarliestLeadDay`.
- Severity: `mild` (avg severe-symptom count < 2), `moderate` (2–3), `severe` (≥ 4).
- Trend: 3-cycle moving average direction of severity count (improving / steady / worsening).
- Output language: "You've logged a recurring pre-period mood pattern" — never "you have PMDD".

---

## Endo flags (`lib/calendar/endo-flags.ts`)

All flags require ≥ 2 completed cycles of evidence.

| Flag | Trigger |
|---|---|
| `high-pain-recurring` | `painLevel ≥ 7` in ≥ 2 cycles |
| `pain-outside-bleeding` | `painLevel ≥ 4` on non-flow days in ≥ 2 cycles |
| `long-bleeding` | Bleeding > 7 days in ≥ 2 cycles |
| `bowel-bladder-pain` | Bowel/Bladder pain location + `painLevel ≥ 4` in ≥ 2 cycles |

`suggestedAction` is always: "Consider talking to a clinician." Never diagnostic.

---

## What is explicitly NOT in the engine

- AI/ML inference (LSTM, Transformer, GBDT) — future research only
- External API calls (astronomical, geocoding, AI)
- Medical claims or diagnostic language
- Fertility/conception advice
