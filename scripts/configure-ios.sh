#!/usr/bin/env bash
#
# Apply Sol Cycle's iOS project settings to ios/App/App/Info.plist.
#
# `npx cap add ios` regenerates the native project from Capacitor's template,
# which discards anything set by hand — so every setting the App Store needs
# lives here and can be re-applied with `pnpm ios:configure`.
#
# Idempotent: safe to run repeatedly.
set -euo pipefail

PLIST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/ios/App/App/Info.plist"
PB=/usr/libexec/PlistBuddy

if [ ! -f "$PLIST" ]; then
  echo "error: $PLIST not found — run 'npx cap add ios' first" >&2
  exit 1
fi

# Delete-then-add, because PlistBuddy's Add fails on an existing key.
set_array() {
  local key="$1"; shift
  $PB -c "Delete :$key" "$PLIST" 2>/dev/null || true
  $PB -c "Add :$key array" "$PLIST"
  local i=0
  for value in "$@"; do
    $PB -c "Add :$key:$i string $value" "$PLIST"
    i=$((i + 1))
  done
}

set_value() {
  local key="$1" type="$2" value="$3"
  $PB -c "Delete :$key" "$PLIST" 2>/dev/null || true
  $PB -c "Add :$key $type $value" "$PLIST"
}

# Portrait only — matches "orientation": "portrait" in the web manifest, and
# every layout is built for a single narrow column.
set_array UISupportedInterfaceOrientations UIInterfaceOrientationPortrait
set_array "UISupportedInterfaceOrientations~ipad" \
  UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown

# armv7 is a 32-bit capability no supported iOS device has.
set_array UIRequiredDeviceCapabilities arm64

# Required before the app may call Face ID; the App Store rejects builds that
# use biometrics with no purpose string.
set_value NSFaceIDUsageDescription string \
  "'Sol Cycle uses Face ID to unlock the app so your cycle and health entries stay private to you.'"

# Declares no non-exempt encryption, so App Store Connect stops asking on every
# upload. The app uses only HTTPS and system crypto.
set_value ITSAppUsesNonExemptEncryption bool false

# Automatic signing needs an explicit team, or archive and device builds fail
# with "no account for team". `cap add ios` regenerates the Xcode project from
# Capacitor's template and drops this, which is why it lives here.
PBXPROJ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/ios/App/App.xcodeproj/project.pbxproj"
DEVELOPMENT_TEAM="${SOL_CYCLE_TEAM_ID:-5CZ9Y5PUKK}"

if [ -f "$PBXPROJ" ] && ! grep -q "DEVELOPMENT_TEAM" "$PBXPROJ"; then
  # Inserted after every automatic-signing configuration in the App target.
  perl -0pi -e "s/(\t+CODE_SIGN_STYLE = Automatic;)/\$1\n\t\t\t\tDEVELOPMENT_TEAM = $DEVELOPMENT_TEAM;/g" "$PBXPROJ"
  echo "Signing team set to $DEVELOPMENT_TEAM."
else
  echo "Signing team already configured."
fi

plutil -lint "$PLIST"
echo "Info.plist configured."
