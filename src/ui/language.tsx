/**
 * Choosing what a clip is spoken in.
 *
 * One chip, one sheet, one rule, used by Home and the batch setup:
 * English is always there; the others need the downloaded model, and the sheet
 * is where that is said — before a video is picked, never after the work has
 * started (invariant 5, applied to a language). None of them is Pro: a free user
 * gets every language, inside the free tier's limit on videos.
 */
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

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
 * it cannot. English always can. The others need the model; a missing model is
 * offered for download on the spot, because the person asking has just shown
 * they want it.
 */
export function ensureLanguageReady(language: Language): boolean {
  if (!needsDownloadedModel(language)) return true;

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
 * The spoken language as a labelled setting: "Spoken language" on the left,
 * the value and a chevron on the right, the download's progress under the value
 * while there is one. Tapping opens the sheet.
 *
 * It was a chip reading "Spoken in English ›" above the New video button, and on
 * the phone that read as a caption or a status line rather than a control — no
 * label said what it set, and nothing about it looked tappable except a glyph.
 * A row with a label and a value is the pattern every settings screen has taught
 * people to tap.
 *
 * `framed` draws its own border and plane, for a screen where it stands alone.
 * Home sets it false and puts it inside the card it shares with New video, so
 * the setting reads as belonging to the action under it.
 */
export function LanguageField({
  language,
  onChange,
  accent,
  framed = true,
}: {
  language: Language;
  onChange: (next: Language) => void;
  accent: string;
  framed?: boolean;
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
        accessibilityLabel={`${copy.fieldLabel}: ${languageName(language)}${status ? `, ${status}` : ''}. Change.`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.field, framed && styles.framed, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Label variant="label" tone="mute" style={styles.fieldLabel}>
          {copy.fieldLabel}
        </Label>
        <View style={styles.fieldValue}>
          <Label variant="body" numberOfLines={1}>
            {languageName(language)}
          </Label>
          {status ? (
            <Label variant="micro" style={{ color: model.kind === 'failed' ? color.signal : accent }}>
              {status}
            </Label>
          ) : null}
        </View>
        <Label variant="heading" tone="mute">
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
            onChange(next);
            ensureLanguageReady(next);
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
  // Nine rows and two headings can outgrow a short screen at a large font
  // scale, so the list scrolls rather than pushing the title off the top.
  const { height } = useWindowDimensions();

  return (
    <Sheet onClose={onClose}>
      <View style={styles.sheet}>
        <Label variant="heading">{copy.sheetTitle}</Label>
        <Label variant="label" tone="mute">
          {copy.sheetNote}
        </Label>

        <ScrollView style={{ maxHeight: height * 0.62 }}>
          <LanguageOptions selected={selected} accent={accent} onPick={onPick} />
        </ScrollView>
      </View>
    </Sheet>
  );
}

/**
 * The languages in two groups: English, which is in the app, and the rest,
 * which share one download. Rows used to carry "Built in", "Pro" and "Download"
 * one word each, which said what but never why, and the one fact that explains
 * all of them — eight languages, one download — was small print under the list.
 * Now that fact is the second group's heading, said for where the download
 * stands (not yet, downloading, done), and a row only has to say whether it is
 * the one chosen.
 *
 * Home's sheet and first launch's language step both draw it, so the two can
 * never disagree about what a language costs.
 */
export function LanguageOptions({
  selected,
  accent,
  onPick,
}: {
  selected: Language;
  accent: string;
  onPick: (language: Language) => void;
}) {
  const model = useModelState();
  const size = modelSizeLabel();

  const builtIn = LANGUAGES.filter((language) => !needsDownloadedModel(language.code));
  const downloaded = LANGUAGES.filter((language) => needsDownloadedModel(language.code));

  const moreHeading =
    model.kind === 'ready'
      ? copy.group.ready
      : model.kind === 'downloading'
        ? copy.downloading(Math.floor(model.fraction * 100))
        : model.kind === 'failed'
          ? copy.failed
          : copy.group.download(size);

  const row = (language: (typeof LANGUAGES)[number]) => {
    const active = language.code === selected;
    return (
      <Pressable
        key={language.code}
        accessibilityRole="radio"
        accessibilityState={{ selected: active }}
        accessibilityLabel={language.native !== language.name ? `${language.name}, ${language.native}` : language.name}
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
        {active ? (
          <Label variant="body" style={{ color: accent }}>
            ✓
          </Label>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.options} accessibilityRole="radiogroup">
      <Label variant="micro" tone="mute" style={styles.group}>
        {copy.group.builtIn}
      </Label>
      {builtIn.map(row)}

      <Label
        variant="micro"
        tone={model.kind === 'failed' ? 'signal' : 'mute'}
        style={[styles.group, styles.groupGap]}
      >
        {moreHeading}
      </Label>
      {downloaded.map(row)}

      <Label variant="micro" tone="mute" style={styles.hint}>
        {copy.mixedHint}
      </Label>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MIN_TOUCH + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  framed: {
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
  },
  fieldLabel: { flexShrink: 0 },
  fieldValue: { flex: 1, alignItems: 'flex-end', gap: 2 },
  sheet: { gap: space.sm, paddingBottom: space.md },
  options: { gap: space.sm, marginTop: space.sm },
  group: { marginTop: space.xs },
  groupGap: { marginTop: space.md },
  hint: { marginTop: space.sm },
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
