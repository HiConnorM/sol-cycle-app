# SOL Cycle — Flutter App Setup

## Install Flutter

```bash
# macOS (via Homebrew)
brew install flutter

# Or download directly:
# https://docs.flutter.dev/get-started/install/macos
```

After installing, verify:
```bash
flutter doctor
```

## Run the App

```bash
cd /Users/hiconnor/Desktop/CycleApp/sol_cycle

# Get dependencies
flutter pub get

# Run on iOS Simulator (open Simulator first)
flutter run

# Run on a connected iPhone
flutter run --release

# Run on Chrome (web preview)
flutter run -d chrome
```

## Preview the Next.js Prototype (already running)

Open in browser: http://localhost:3000

If not running:
```bash
cd /Users/hiconnor/Desktop/CycleApp/sol-cycle-app
pnpm dev
```

## Project Structure

```
sol_cycle/lib/
├── main.dart                    # Entry point
├── app.dart                     # App shell + routing + onboarding gate
├── core/
│   ├── theme.dart               # SolColors + SolTheme (warm cream palette)
│   └── constants.dart           # Phase names, symptom lists, mood lists
├── models/
│   ├── cycle_log.dart           # CycleLog data model
│   └── cycle_settings.dart      # CycleSettings model
├── services/
│   ├── cycle_service.dart       # Phase calculations, cycle day, PMDD window
│   ├── moon_service.dart        # Real moon phase from Julian date math
│   ├── calendar_service.dart    # IFC (13-month) ↔ Gregorian conversion
│   ├── storage_service.dart     # SharedPreferences local storage
│   └── phase_content.dart       # All phase recommendations & nourish content
├── providers/
│   ├── cycle_provider.dart      # Riverpod: cycle state + logs
│   └── calendar_provider.dart   # Riverpod: date + calendar system + moon
├── widgets/
│   ├── radial_wheel/
│   │   ├── wheel_painter.dart   # CustomPainter — the signature radial wheel
│   │   └── radial_wheel.dart    # Widget wrapper with animation + controls
│   ├── insight_card.dart        # Reusable card + BulletList
│   └── side_menu.dart           # Drawer with settings, care modes, privacy
└── screens/
    ├── today/today_screen.dart       # Home — wheel + insights + status
    ├── log/log_sheet.dart            # Log sheet — body/mind/care/notes tabs
    ├── nourish/nourish_screen.dart   # Phase-based food + movement guidance
    ├── insights/insights_screen.dart # Stats, trends, phase breakdown
    ├── reports/reports_screen.dart   # Monthly summaries + export
    └── onboarding/onboarding_screen.dart  # 5-step onboarding flow
```

## Key Features Built

- **Signature radial wheel** — CustomPainter with 12/13 pastel segments, moon phase in center, cycle day tick ring, animated on mount
- **13-month Sol calendar** — IFC conversion layer, toggle in wheel + settings
- **Real moon phase** — Julian date math, accurate illumination %
- **5-tab log sheet** — body, mind, care (PMDD + endo symptoms), notes + journal
- **Phase recommendations** — full food/movement/ritual content for all 4 phases
- **PMDD mode** — dedicated symptom tracking, window prediction, support cards
- **Endometriosis mode** — pain location, flare tracking, bowel/bladder symptoms
- **Nourish screen** — phase-aware, expandable cards, hydration guide
- **Insights** — symptom frequency bars, cycle progress, phase guide
- **Reports** — monthly day-grid summaries, export section, PMDD report card
- **Onboarding** — 5 steps: welcome → name → cycle length → last period → care modes
- **Side menu drawer** — cycle settings, care mode toggles, privacy center, data export/delete
- **Local-first** — SharedPreferences, no sync unless you add it
