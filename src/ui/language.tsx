/**
 * Choosing what a clip is spoken in.
 *
 * One chip, one sheet, one rule, used by Home, the batch setup and auto clip:
 * English is always there; the other four are Pro and need the downloaded model,
 * and the sheet is where both of those are said — before a video is picked,
 * never after the work has started (invariant 5, applied to a language).
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { track } from '../analytics/events';
import {
  canRunModel,
  downloadModel,
  NOT_ENOUGH_MEMORY,
  modelSizeLabel,
  modelState,
  subscribeModelState,
  type ModelState,
} from '../asr/model-store';
import { languageName, LANGUAGES, needsDownloadedModel, type Language } from '../domain';
import { Sheet } from '../editor/Sheet';
import { loadProStatus } from '../policy/entitlement-store';
import { isPro } from '../policy/pro';
import { Label } from './atoms';
import { languages as copy } from './copy';
import { color, MIN_TOUCH, radius, space } from './theme';

/** The downloaded model's state, kept current while the component is mounted. */
export function useModelState(): ModelState {
  const [state, setState] = useState<ModelState>(modelState);
  useEffect(() => subscribeModelState(setState), []);
  return state;
}

/**
 * Whether a clip in this language can be started right now, saying why not when
 * it cannot. English always can. The others need Pro and then the model; a
 * missing model is offered for download on the spot, because the person asking
 * has just shown they want it.
 */
export function ensureLanguageReady(language: Language, from: string): boolean {
  if (!needsDownloadedModel(language)) return true;

  if (!isPro(loadProStatus())) {
    Alert.alert(copy.proTitle, copy.proBody, [
      { text: copy.notNow, style: 'cancel' },
      { text: copy.proCta, onPress: () => router.push({ pathname: '/unlock', params: { from } }) },
    ]);
    return false;
  }

  const state = modelState();
  if (state.kind === 'ready') return true;

  if (!canRunModel()) {
    Alert.alert(copy.lowMemoryTitle, NOT_ENOUGH_MEMORY);
    return false;
  }

  if (state.kind === 'downloading') {
    Alert.alert(copy.stillDownloading, copy.stillDownloadingBody);
    return false;
  }

  Alert.alert(copy.downloadTitle, copy.downloadBody(modelSizeLabel()), [
    { text: copy.notNow, style: 'cancel' },
    { text: copy.download, onPress: () => void downloadModel() },
  ]);
  return false;
}

/**
 * "Spoken in English ›", with the download's progress beside it while there is
 * one. Tapping opens the sheet.
 */
export function LanguageChip({
  language,
  onChange,
  accent,
  from,
}: {
  language: Language;
  onChange: (next: Language) => void;
  accent: string;
  from: string;
}) {
  const [open, setOpen] = useState(false);
  const model = useModelState();

  const status =
    needsDownloadedModel(language) && model.kind === 'downloading'
      ? copy.downloading(Math.floor(model.fraction * 100))
      : needsDownloadedModel(language) && model.kind === 'failed'
        ? copy.failed
        : null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${copy.chip(languageName(language))}. Change language.`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Label variant="label">{copy.chip(languageName(language))}</Label>
        {status ? (
          <Label variant="micro" style={{ color: model.kind === 'failed' ? color.signal : accent }}>
            {status}
          </Label>
        ) : null}
        <Label variant="label" tone="mute">
          ›
        </Label>
      </Pressable>

      {open ? (
        <LanguageSheet
          selected={language}
          accent={accent}
          onClose={() => setOpen(false)}
          onPick={(next) => {
            setOpen(false);
            // Chosen even when the model is not there yet: the download prompt
            // is about getting it, not about whether this was the right answer.
            if (next !== language) track({ name: 'language_selected', language: next });
            if (needsDownloadedModel(next) && !isPro(loadProStatus())) {
              ensureLanguageReady(next, from);
              return;
            }
            onChange(next);
            ensureLanguageReady(next, from);
          }}
        />
      ) : null}
    </>
  );
}

function LanguageSheet({
  selected,
  accent,
  onClose,
  onPick,
}: {
  selected: Language;
  accent: string;
  onClose: () => void;
  onPick: (language: Language) => void;
}) {
  const pro = isPro(loadProStatus());
  const model = useModelState();

  return (
    <Sheet onClose={onClose}>
      <View style={styles.sheet}>
        <Label variant="heading">{copy.sheetTitle}</Label>
        <Label variant="label" tone="mute">
          {copy.sheetNote}
        </Label>

        <View style={styles.options} accessibilityRole="radiogroup">
          {LANGUAGES.map((language) => {
            const active = language.code === selected;
            // One word per row. What the four share is said once, under them.
            const note = !needsDownloadedModel(language.code)
              ? copy.builtIn
              : !pro
                ? copy.needsPro
                : model.kind === 'ready'
                  ? null
                  : copy.needsDownload;

            return (
              <Pressable
                key={language.code}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => onPick(language.code)}
                style={({ pressed }) => [
                  styles.option,
                  { borderColor: active ? accent : color.line, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={styles.optionText}>
                  <Label variant="body">{language.name}</Label>
                  {language.native !== language.name ? (
                    <Label variant="micro" tone="mute">
                      {language.native}
                    </Label>
                  ) : null}
                </View>
                {note ? (
                  <Label variant="micro" tone="mute">
                    {note}
                  </Label>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {model.kind !== 'ready' ? (
          <Label variant="micro" tone="mute">
            {copy.sharedModel(modelSizeLabel())}
          </Label>
        ) : null}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.line,
  },
  sheet: { gap: space.sm, paddingBottom: space.md },
  options: { gap: space.sm, marginTop: space.sm },
  option: {
    minHeight: MIN_TOUCH + 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderWidth: 1.5,
    borderRadius: radius.control,
  },
  optionText: { flex: 1 },
});
