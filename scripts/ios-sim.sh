#!/usr/bin/env bash
#
# Build Wordburn for the iOS Simulator, install it and launch it.
#
#     scripts/ios-sim.sh              Release build: the JS is embedded, no Metro
#     scripts/ios-sim.sh --debug      Debug build with the dev client; start
#                                     `npx expo start --dev-client` yourself
#     scripts/ios-sim.sh --clean      Throw `ios/` away and generate it again
#
# Release is the default for the same reason `run.sh` builds release APKs: it
# is the build the rule in CLAUDE.md asks for, and on the simulator it is also
# the one that needs no second process. The dev client's launcher has to be
# tapped through, and nothing on this Mac can tap a simulator.
#
# Nobody here has an iPhone. Everything iOS has been run on a simulator and the
# notes in CLAUDE.md say so; this script is how that was built.
#
# CocoaPods: this Mac's Homebrew is broken and its system Ruby is too old for
# Expo's pod scripts, so CocoaPods was installed into `~/.gem/ruby4-pods` and
# runs on the Ruby that Homebrew ships for itself. The block below finds it when
# `pod` is not already on PATH. On a Mac with a working `pod`, it does nothing.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

step() { printf '\n\033[1;36m==>\033[0m %s\n' "$1"; }
fail() { printf '\n\033[1;31mx\033[0m %s\n' "$1" >&2; exit 1; }

CONFIGURATION=Release
CLEAN=false
for arg in "$@"; do
  case "$arg" in
    --debug) CONFIGURATION=Debug ;;
    --clean) CLEAN=true ;;
    -h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) fail "unknown option: $arg" ;;
  esac
done

BUNDLE_ID=com.wordburn.app
DERIVED=ios/build/DerivedData

command -v xcodebuild >/dev/null || fail "Xcode is not installed, or xcode-select still points at the Command Line Tools"
xcodebuild -checkFirstLaunchStatus >/dev/null 2>&1 || fail "Xcode has not finished its first launch (sudo xcodebuild -license accept, then xcodebuild -runFirstLaunch)"

if ! command -v pod >/dev/null && [ -d "$HOME/.gem/ruby4-pods/bin" ]; then
  export GEM_HOME="$HOME/.gem/ruby4-pods" GEM_PATH="$HOME/.gem/ruby4-pods"
  export PATH="$HOME/.gem/ruby4-pods/bin:/opt/homebrew/Library/Homebrew/vendor/portable-ruby/current/bin:$PATH"
fi
command -v pod >/dev/null || fail "CocoaPods is not installed (see the note at the top of this script)"
export LANG="${LANG:-en_US.UTF-8}"

step "Speech models"
scripts/fetch-models.sh

if $CLEAN; then
  step "Removing ios/"
  rm -rf ios
fi

# `expo prebuild` without --clean re-applies app.json to an existing ios/, which
# is how the Info.plist and the Xcode project pick up config changes. It has
# been seen to empty Pods/ as a side effect, hence the pod install that follows
# unconditionally.
step "Generating the Xcode project"
CI=1 npx expo prebuild --platform ios --no-install

step "Installing pods"
(cd ios && pod install)

# The booted simulator, or the first iPhone that could be booted.
UDID="$(xcrun simctl list devices booted -j | python3 -c 'import json,sys; d=json.load(sys.stdin); print(next((x["udid"] for v in d["devices"].values() for x in v), ""))')"
if [ -z "$UDID" ]; then
  UDID="$(xcrun simctl list devices available -j | python3 -c 'import json,sys; d=json.load(sys.stdin); print(next((x["udid"] for k,v in d["devices"].items() if "iOS" in k for x in v if x["name"].startswith("iPhone")), ""))')"
  [ -n "$UDID" ] || fail "no iOS simulator is available (xcodebuild -downloadPlatform iOS)"
  step "Booting the simulator"
  xcrun simctl boot "$UDID"
  xcrun simctl bootstatus "$UDID" -b >/dev/null
fi

step "Building ($CONFIGURATION)"
# Release builds every architecture by default, and for the simulator that is
# arm64 and x86_64: two full compiles of Skia, React Native and whisper for a
# slice this Mac never runs. ONLY_ACTIVE_ARCH keeps it to the one the booted
# simulator uses, which halves a clean build.
xcodebuild -workspace ios/Wordburn.xcworkspace -scheme Wordburn -configuration "$CONFIGURATION" \
  -sdk iphonesimulator -destination "id=$UDID" -derivedDataPath "$DERIVED" \
  ONLY_ACTIVE_ARCH=YES -quiet build

APP="$DERIVED/Build/Products/$CONFIGURATION-iphonesimulator/Wordburn.app"
[ -d "$APP" ] || fail "the build finished but $APP is not there"

step "Installing and launching"
xcrun simctl terminate "$UDID" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" "$BUNDLE_ID"
printf '\nRunning on simulator %s. Screenshot with: xcrun simctl io %s screenshot shot.png\n' "$UDID" "$UDID"
