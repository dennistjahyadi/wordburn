/**
 * Packs the speech models into the app: the APK on Android, the bundle on iOS.
 *
 * `assets/models` is pointed at rather than copied, the same way the burn-in
 * module points its assets directory at `assets/fonts`: two copies of an 82 MB
 * file is 82 MB of somebody's disk and one chance for them to differ. The files
 * are not in git — `scripts/fetch-models.sh` puts them there, and `run.sh` calls
 * it before every build.
 *
 * `noCompress` matters. whisper.rn opens a bundled model through AAssetManager
 * and streams it (`whisperInitFromAsset` in its jni.cpp), and a deflated asset
 * has to be inflated on every launch to be read at all. A q8 model is close to
 * incompressible, so the trade is a few megabytes of APK against a slower start
 * every single time.
 *
 * On iOS the same two files go into the app bundle as resources, referenced
 * where they are rather than copied, for the same reason. whisper.rn finds a
 * bundled model there with `pathForResource:ofType:` on the bare file name, so
 * they have to land at the bundle's root — which is where a resource in the
 * `Resources` group lands. Nothing is compressed in an app bundle, so there is
 * no second half to this one.
 */
const fs = require('fs');
const path = require('path');
const { IOSConfig, withAppBuildGradle, withXcodeProject } = require('expo/config-plugins');

const MODELS_DIR = 'assets/models';

const ANCHOR = /^android \{$/m;

const BLOCK = `
    // Added by plugins/with-bundled-models.js
    sourceSets {
        main {
            assets.srcDirs += ["$rootDir/../assets/models"]
        }
    }
    androidResources {
        noCompress += ["bin"]
    }
`;

function withBundledModelsAndroid(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    const contents = gradleConfig.modResults.contents;

    if (contents.includes('with-bundled-models.js')) return gradleConfig;
    if (!ANCHOR.test(contents)) {
      throw new Error(
        "with-bundled-models: no `android {` block in app/build.gradle, so the models would " +
          'be left out of the APK silently. Fix the anchor in the plugin.'
      );
    }

    gradleConfig.modResults.contents = contents.replace(ANCHOR, `android {\n${BLOCK}`);
    return gradleConfig;
  });
};

function withBundledModelsIos(config) {
  return withXcodeProject(config, (xcodeConfig) => {
    const { projectRoot, platformProjectRoot } = xcodeConfig.modRequest;
    const directory = path.join(projectRoot, MODELS_DIR);
    const models = fs.existsSync(directory)
      ? fs.readdirSync(directory).filter((name) => name.endsWith('.bin'))
      : [];

    if (models.length === 0) {
      throw new Error(
        `with-bundled-models: no .bin files in ${MODELS_DIR}, so the app would be built ` +
          'without its speech models. Run scripts/fetch-models.sh first.'
      );
    }

    const project = xcodeConfig.modResults;
    IOSConfig.XcodeUtils.ensureGroupRecursively(project, 'Resources');

    for (const name of models) {
      // A file already in the group is skipped by the helper, so a second
      // prebuild over an existing `ios/` adds nothing twice.
      IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: path.relative(platformProjectRoot, path.join(directory, name)),
        groupName: 'Resources',
        project,
        isBuildFile: true,
      });
    }

    return xcodeConfig;
  });
}

module.exports = function withBundledModels(config) {
  return withBundledModelsIos(withBundledModelsAndroid(config));
};
