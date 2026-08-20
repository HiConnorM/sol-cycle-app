# Sol Cycle — iOS launch plan

Rendered version: see the Launch Plan artifact shared alongside this document.
Status reflects the codebase after the August 2026 audit and fix pass.

## Where it stands

| | |
|---|---|
| Tests | 246 passing, across 6 timezones (UTC−8 → UTC+14) |
| Lint | clean (`pnpm lint`) |
| Engine recompute | 39 ms at 5 years of daily history (was 432 ms) |
| Dependencies | 20, down from 57 |
| iOS | Capacitor project in `ios/`, builds and runs on iPhone 17 Pro |

## Blocking launch

None of these are code. Nothing ships until each is done.

- [x] **Apple Developer Program membership** — active; signing identity present in the
      keychain (team `5CZ9Y5PUKK`).
- [~] **Bundle ID and signing** — automatic signing is configured with the team set, and
      `scripts/configure-ios.sh` re-applies it if the native project is regenerated. The
      bundle ID is still the placeholder `app.solcycle`; **decide the final one before the
      first upload — it can never be changed once an app ships under it.**
- [ ] **Publicly hosted privacy policy** — App Store Connect requires a public URL. The
      policy exists at `/privacy` and is accurate; it needs to be on the open web.
- [ ] **App Privacy nutrition label** — with analytics removed, the honest answer is
      "Data Not Collected" across the board. This must stay true.

## Fix before submitting

- [x] **Eleven dead settings toggles** — resolved. Seven notification toggles
      (`notificationsEnabled`, `dailyCheckIn`, `phaseChangeAlerts`, `pmddAlerts`,
      `hardDayAlerts`, `mealSuggestions`, `quietMode`) now schedule real local
      notifications. `recommendationsEnabled` and `foodTrackingStyle` gate the Nourish
      food section. `aiPersonalization` and `journalPrivacy` were removed — they offered
      to configure an AI feature the app does not have, and "exclude notes from AI"
      implied notes were being sent somewhere. `dietaryPreferences` removed (unused).
- [x] **Local notifications implemented** — `@capacitor/local-notifications`, a pure
      planner in `lib/notifications/planner.ts` (32 tests), a replace-all scheduler, and a
      permission flow that refuses to switch the toggle on when iOS has denied permission.
      Verified scheduling against the simulator's pending store.
- [x] **Community "Coming Soon" tab removed.**
- [x] **Single cycle anchor** — `useCycle` now derives one `effectiveAnchor` (logged period
      start when one exists, declared onboarding date before that) used for both cycle day
      and predictions, so Reports can no longer contradict itself.
- [x] **Dead PDF export branch removed.**
- [ ] **Starter tasks ship to every user** (`createSampleTasks`) — kept by choice; flagged
      because a reviewer sees "Replace air filters" in a cycle app.
- [ ] **Hard-day alerts need real history to fire** — correct behaviour (they gate on the
      user's own lead-indicator symptoms), but worth confirming on a seeded account before
      submission so you know the path works end to end.

## Testing left

Automated coverage is solid. What remains needs hardware and human eyes.

- A physical iPhone — Face ID, real storage pressure, touch latency on the wheel.
- **VoiceOver** — the living wheel is an SVG with no accessible description. Biggest gap.
- Dynamic Type at accessibility sizes.
- iPhone SE (375 pt) — the tightest supported width; the log sheet is dense.
- Backgrounding with the lock on — verify the app is obscured in the app switcher snapshot.
- Log across a month boundary, a DST change, and a timezone change while travelling.

## Submission sequence

1. Enrol in the Apple Developer Program.
2. Register the bundle ID; create the App Store Connect record.
3. Cut or implement the dead settings.
4. Deploy the web build; get the privacy policy URL live.
5. Set signing in Xcode, archive, upload to TestFlight; run the manual test list.
6. Capture screenshots at 6.9" and 6.5" (seed realistic data first).
7. Complete the privacy label and listing; include the medical disclaimer in the description.
8. Submit. Expect 24–48h.

## AI integration

**The constraint:** Sol Cycle's promise — on the consent screen, in the policy, and in the
App Store pitch — is that nothing leaves the device. Sending logs, symptoms, moods, or notes
to any API breaks it, changes the privacy label from "Data Not Collected" to collecting
health data, and undermines the app's strongest differentiator. The question is not which
model, but **where inference runs**.

| Approach | Privacy promise | Capability | Cost & effort |
|---|---|---|---|
| **On-device (Apple Foundation Models)** — recommended | Intact | Good for summarising and explaining patterns the engine already found | No inference cost; needs a Swift bridge plugin; iOS 26+ and Apple Intelligence hardware |
| Cloud (Claude API) | Broken unless opted into per user | Substantially stronger reasoning over long histories | Per-token cost plus a backend you build and run |
| Neither — better deterministic copy | Intact | The engine already computes the patterns | Cheapest; worth considering honestly |

**Recommended: on-device first.** The engine already produces the analysis and emits a
`reason[]` array explaining each conclusion. What it lacks is *narration*. Let the engine stay
the source of truth for every number and have the model only phrase what the engine concluded
— a model that never computes a prediction can never hallucinate one.

**Where it helps:** plain-language monthly overview; explaining why a prediction shifted;
"what changed since last cycle?"; summarising a report for a clinician.

**Never:** naming conditions, suggesting treatment or dosage, computing or overriding
predictions, or interpreting crisis-flag symptoms. Those stay deterministic.

**If you add the cloud tier:** never ship an API key in the app — a key in a mobile binary is
extractable in minutes. Cloud inference needs a thin backend holding the key. Make it opt-in
per user, send the smallest useful slice rather than the whole history, and update the privacy
label and policy in the same release. Default model: `claude-opus-5` with adaptive thinking
and streaming.

**Sequencing:** not in v1. Ship the tracker, confirm date handling and predictions hold up on
real devices and real cycles, then add narration in v1.1.
