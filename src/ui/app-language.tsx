/**
 * Choosing what the interface is written in.
 *
 * Nine chips, each the language's own name for itself. A person looking for
 * their language finds it under the name they would write it, so the chips are
 * never translated, and they wrap into as many rows as the screen needs rather
 * than scrolling: Welcome has nothing else to show and Settings has a sheet.
 *
 * The same control on both screens, so the two can never disagree about what
 * the choice is called or which languages are on offer.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { LANGUAGES, type Language } from '../domain';
import { Sheet } from '../editor/Sheet';
import { useCopy, type Locale } from '../i18n';
import { Label } from './atoms';
import { color, MIN_TOUCH, radius, space } from './theme';

export function AppLanguageChips({
  selected,
  accent,
  onPick,
}: {
  selected: Locale;
  accent: string;
  onPick: (locale: Locale) => void;
}) {
  const names = useCopy().languageNames;

  return (
    <View style={styles.chips} accessibilityRole="radiogroup">
      {LANGUAGES.map((language) => {
        const active = language.code === selected;
        return (
          <Pressable
            key={language.code}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={
              language.native !== names[language.code]
                ? `${language.native}, ${names[language.code]}`
                : language.native
            }
            onPress={() => onPick(language.code as Language)}
            style={({ pressed }) => [
              styles.chip,
              active && { borderColor: accent, backgroundColor: color.surface },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Label variant="label" tone={active ? 'paper' : 'mute'}>
              {language.native}
            </Label>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Settings' way in: the chips in a sheet, with a line saying what they change. */
export function AppLanguageSheet({
  selected,
  accent,
  onClose,
  onPick,
}: {
  selected: Locale;
  accent: string;
  onClose: () => void;
  onPick: (locale: Locale) => void;
}) {
  const words = useCopy().appLanguage;

  return (
    <Sheet onClose={onClose}>
      <View style={styles.sheet}>
        <Label variant="heading">{words.title}</Label>
        <Label variant="label" tone="mute">
          {words.note}
        </Label>
        <AppLanguageChips selected={selected} accent={accent} onPick={onPick} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.line,
  },
  sheet: { gap: space.md, paddingBottom: space.md },
});
