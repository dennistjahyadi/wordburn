#!/usr/bin/env bash
#
# The iOS build that goes to App Store Connect, and nothing else.
#
# `scripts/ios-sim.sh` builds for the simulator. This one archives for a real
# device, signs it with the team's distribution certificate, and hands the
# result to App Store Connect, where it becomes a TestFlight build and, after
# review, a release. Everything slow is `xcodebuild`; everything that can fail
# cheaply is checked before it runs.
#
#     ./scripts/build-ipa.sh            archive, sign, upload
#     ./scripts/build-ipa.sh --no-upload  archive and sign only, keep the .ipa
#
# Signing is manual, with the App Store distribution profile. Automatic signing
# was tried first and Apple refused it: Xcode signs an archive with a
# *development* profile before the export re-signs it for distribution, and a
# development profile cannot be issued to a team with no registered devices —
# which is this team, since nobody here owns an iPhone. A distribution profile
# has no device list, so the archive is signed with it from the start.
#
# What has to exist, once (APP-STORE.md §2):
#   - an Apple Distribution certificate with its private key in the login
#     keychain (Xcode → Settings → Accounts → Manage Certificates → +);
#   - the App Store profile for com.wordburn.app, downloaded from
#     developer.apple.com → Profiles and installed where Xcode looks:
#       ~/Library/MobileDevice/Provisioning Profiles/<UUID>.mobileprovision
#     The script finds it by name, PROFILE_NAME below.
#   - Apple's WWDR G3 intermediate in the keychain, or `security find-identity`
#     reports the certificate as invalid and Xcode will not sign with it:
#       curl -O https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
#       security import AppleWWDRCAG3.cer -k ~/Library/Keychains/login.keychain-db
#
# The team is named in app.json as `ios.appleTeamId`. The upload needs either
# the Apple ID signed into Xcode or an App Store Connect API key in the shell
# (ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID — APP-STORE.md §2); without either,
# use --no-upload and drag the .ipa into Transporter.
#
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

step() { printf '\n\033[1;36m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$1" >&2; }
fail() { printf '\n\033[1;31mx\033[0m %s\n' "$1" >&2; exit 1; }

UPLOAD=true
for arg in "$@"; do
  case "$arg" in
    --no-upload) UPLOAD=false ;;
    -h|--help) sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) fail "unknown option: $arg" ;;
  esac
done

# The developer tools compile in only when this flag reaches Metro, and a build
# with them in it would let anybody be Pro. Same rule as build-aab.sh: refuse
# rather than quietly unset.
if [ "${WORDBURN_QA:-0}" != "0" ]; then
  fail "WORDBURN_QA is set in this shell. An App Store build must never carry the developer tools: unset it and run again."
fi
export WORDBURN_QA=0

. scripts/version.sh

PROFILE_NAME="Wordburn App Store"
OUT=ios/build
ARCHIVE_PATH="$OUT/Wordburn.xcarchive"
EXPORT_PATH="$OUT/export"
EXPORT_OPTIONS="$OUT/ExportOptions.plist"

# ------------------------------------------------------------- the toolchain
command -v xcodebuild >/dev/null || fail "Xcode is not installed, or xcode-select still points at the Command Line Tools"
xcodebuild -checkFirstLaunchStatus >/dev/null 2>&1 || fail "Xcode has not finished its first launch"

if ! command -v pod >/dev/null && [ -d "$HOME/.gem/ruby4-pods/bin" ]; then
  # See the header of scripts/ios-sim.sh for why CocoaPods lives there on this Mac.
  export GEM_HOME="$HOME/.gem/ruby4-pods" GEM_PATH="$HOME/.gem/ruby4-pods"
  export PATH="$HOME/.gem/ruby4-pods/bin:/opt/homebrew/Library/Homebrew/vendor/portable-ruby/current/bin:$PATH"
fi
command -v pod >/dev/null || fail "CocoaPods is not installed"
export LANG="${LANG:-en_US.UTF-8}"

# ---------------------------------------------------------------- the team
TEAM_ID="$(node -p "require('./app.json').expo.ios.appleTeamId || ''" 2>/dev/null)"
[ -n "$TEAM_ID" ] || fail "app.json has no expo.ios.appleTeamId. Add the team id from developer.apple.com → Membership details."

# ------------------------------------------------------------- the signing
IDENTITY="$(security find-identity -v -p codesigning 2>/dev/null | sed -n 's/.*"\(Apple Distribution: [^"]*\)".*/\1/p' | _first_line)"
[ -n "$IDENTITY" ] || fail "No valid 'Apple Distribution' identity in the keychain. See the header of this script."

PROFILE_UUID=""
for profile in "$HOME/Library/MobileDevice/Provisioning Profiles"/*.mobileprovision; do
  [ -f "$profile" ] || continue
  decoded="$(security cms -D -i "$profile" 2>/dev/null)" || continue
  name="$(printf '%s' "$decoded" | /usr/libexec/PlistBuddy -c 'Print :Name' /dev/stdin 2>/dev/null)"
  [ "$name" = "$PROFILE_NAME" ] || continue
  PROFILE_UUID="$(printf '%s' "$decoded" | /usr/libexec/PlistBuddy -c 'Print :UUID' /dev/stdin 2>/dev/null)"
  break
done
[ -n "$PROFILE_UUID" ] || fail "No installed provisioning profile named '$PROFILE_NAME'. Download it from developer.apple.com → Profiles and copy it into ~/Library/MobileDevice/Provisioning Profiles/."
echo "    Signing as $IDENTITY with profile '$PROFILE_NAME'."

AUTH=()
if [ -n "${ASC_KEY_PATH:-}" ]; then
  [ -f "$ASC_KEY_PATH" ] || fail "ASC_KEY_PATH names $ASC_KEY_PATH, which does not exist."
  [ -n "${ASC_KEY_ID:-}" ] && [ -n "${ASC_ISSUER_ID:-}" ] \
    || fail "ASC_KEY_PATH is set but ASC_KEY_ID or ASC_ISSUER_ID is not. All three come from the same App Store Connect page."
  AUTH=(-authenticationKeyPath "$(cd "$(dirname "$ASC_KEY_PATH")" && pwd)/$(basename "$ASC_KEY_PATH")" \
        -authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "$ASC_ISSUER_ID")
  echo "    Signing and uploading with App Store Connect API key $ASC_KEY_ID."
else
  warn "No ASC_KEY_PATH in the environment: relying on the Apple ID signed into Xcode."
fi

# --------------------------------------------------------------- the version
version_read
BUILD_NUMBER="$(node -p "require('./app.json').expo.ios.buildNumber || ''" 2>/dev/null)"
[ "$BUILD_NUMBER" = "$VERSION_CODE" ] \
  || fail "app.json's ios.buildNumber ($BUILD_NUMBER) is not its android.versionCode ($VERSION_CODE). npm run bump keeps them together."

IPA_ARCHIVE="$(version_archive_name ipa)"
if [ -f "$IPA_ARCHIVE" ]; then
  cat >&2 <<EOF
x build $VERSION_CODE has already been built:
    $IPA_ARCHIVE
  App Store Connect will not take the same build number twice. Bump it first:
    npm run bump
  If that build never went up and you want the number back, delete the file
  and run this again.
EOF
  exit 1
fi

# ---------------------------------------------------------------- the build
step "Checking the speech models"
./scripts/fetch-models.sh

step "Generating the Xcode project — $VERSION ($VERSION_CODE)"
CI=1 npx expo prebuild --platform ios --no-install
(cd ios && pod install >/dev/null)

grep -q "DEVELOPMENT_TEAM = $TEAM_ID" ios/Wordburn.xcodeproj/project.pbxproj \
  || fail "prebuild did not write DEVELOPMENT_TEAM = $TEAM_ID into the project. Is ios.appleTeamId spelled right?"

rm -rf "$ARCHIVE_PATH" "$EXPORT_PATH"

step "Archiving"
# Manual signing is set on the command line rather than in the project, so the
# generated project stays whatever prebuild wrote and the simulator build is
# untouched by any of this.
xcodebuild archive \
  -workspace ios/Wordburn.xcworkspace -scheme Wordburn -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$ARCHIVE_PATH" \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_IDENTITY="$IDENTITY" \
  PROVISIONING_PROFILE_SPECIFIER="$PROFILE_UUID" \
  -quiet

APP="$ARCHIVE_PATH/Products/Applications/Wordburn.app"
[ -d "$APP" ] || fail "xcodebuild finished but $APP is not in the archive."

# The last line of defence: an App Store build with the developer tools in it
# would let anybody make themselves Pro. A count, not grep -q, for the reason
# build-aab.sh gives.
QA_MARKER_STRING="WORDBURN_QA_DEVELOPER_TOOLS_IN_THIS_BUNDLE"
found="$(LC_ALL=C grep -a -c "$QA_MARKER_STRING" "$APP/main.jsbundle" || true)"
if [ "${found:-0}" -gt 0 ]; then
  rm -rf "$ARCHIVE_PATH"
  fail "The archive has the developer tools in it. It has been deleted; run again from a fresh shell."
fi

# Read out of the archive, not out of app.json.
step "Checking the version it came out with"
got_version="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Info.plist" 2>/dev/null || true)"
got_build="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$APP/Info.plist" 2>/dev/null || true)"
[ "$got_version" = "$VERSION" ] && [ "$got_build" = "$VERSION_CODE" ] \
  || fail "The archive says $got_version ($got_build), app.json says $VERSION ($VERSION_CODE)."
echo "    $VERSION ($VERSION_CODE), read back from the archive's own Info.plist."
ls "$APP"/ggml-*.bin >/dev/null 2>&1 || fail "The speech models are not in the archive."

# ---------------------------------------------------------------- the export
# `destination upload` makes xcodebuild do the upload itself, with the same
# credentials that signed. `export` writes an .ipa beside the archive instead.
mkdir -p "$OUT"
cat > "$EXPORT_OPTIONS" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>$([ "$UPLOAD" = true ] && echo upload || echo export)</string>
  <key>teamID</key><string>$TEAM_ID</string>
  <key>signingStyle</key><string>manual</string>
  <key>signingCertificate</key><string>Apple Distribution</string>
  <key>provisioningProfiles</key>
  <dict><key>com.wordburn.app</key><string>$PROFILE_NAME</string></dict>
  <key>uploadSymbols</key><true/>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict>
</plist>
EOF

if [ "$UPLOAD" = true ]; then
  step "Signing for the App Store and uploading"
else
  step "Signing for the App Store"
fi
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" -exportOptionsPlist "$EXPORT_OPTIONS" -exportPath "$EXPORT_PATH" \
  -allowProvisioningUpdates ${AUTH[@]+"${AUTH[@]}"} \
  -quiet

mkdir -p build
if [ "$UPLOAD" = true ]; then
  # Nothing to keep but the record that this number has gone up.
  : > "$IPA_ARCHIVE"
  echo
  echo "    Uploaded $VERSION ($VERSION_CODE). It shows in App Store Connect → TestFlight once"
  echo "    Apple has processed it, usually within the half hour."
else
  IPA="$(ls "$EXPORT_PATH"/*.ipa 2>/dev/null | _first_line)"
  [ -n "$IPA" ] || fail "The export finished but no .ipa is in $EXPORT_PATH."
  cp "$IPA" "$IPA_ARCHIVE"
  echo
  echo "    $IPA_ARCHIVE  ($(du -h "$IPA_ARCHIVE" | cut -f1))"
  echo "    Upload it with Transporter, or run this again without --no-upload."
fi
