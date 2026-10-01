/**
 * What kind of build this is, decided when the bundle is made.
 *
 * This is the ordinary file, in every debug build and every build for Play.
 * `metro.config.js` swaps in `build-flags.qa.ts` instead when the bundle is
 * made with `WORDBURN_QA=1`, which only `./run.sh --qa` sets.
 *
 * A module and not `process.env.EXPO_PUBLIC_WORDBURN_QA`: in development Expo
 * rewrites any `EXPO_PUBLIC_` read into an import that sweeps up every `.env*`
 * file in the project, and `.env.signing.local` — which is not code — broke
 * every debug build the day the flag was added.
 */
export const QA_BUILD_FLAG = false;
