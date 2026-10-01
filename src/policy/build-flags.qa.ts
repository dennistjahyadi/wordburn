/**
 * The QA build's flags. Bundled only by `./run.sh --qa`, through the swap in
 * `metro.config.js`; see `build-flags.ts`.
 *
 * The marker is how the build scripts know which of the two files went in:
 * they open the finished APK or AAB and look for it. It exists in this file and
 * nowhere else in the app, so a Play bundle that contains it is a Play bundle
 * with the developer tools in it, and `scripts/build-aab.sh` deletes it.
 */
export const QA_BUILD_FLAG = true;
export const QA_MARKER = 'WORDBURN_QA_DEVELOPER_TOOLS_IN_THIS_BUNDLE';
