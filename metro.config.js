// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// whisper.rn loads ggml models and Core ML encoders as bundled assets, so Metro
// has to treat them as binary assets rather than source it can parse.
config.resolver.assetExts.push('bin', 'mil');

// `./run.sh --qa` builds the release bundle with WORDBURN_QA=1, and only then
// does the app import the QA build's flags instead of the ordinary ones. A
// module swap rather than an EXPO_PUBLIC_ variable: see src/policy/build-flags.ts.
if (process.env.WORDBURN_QA === '1') {
  const path = require('path');
  const qaFlags = path.join(__dirname, 'src/policy/build-flags.qa.ts');
  const resolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === './build-flags' && context.originModulePath.includes(`${path.sep}src${path.sep}policy${path.sep}`)) {
      return { type: 'sourceFile', filePath: qaFlags };
    }
    return resolveRequest
      ? resolveRequest(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
