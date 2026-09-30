/**
 * Naming a look so a batch can use it.
 *
 * A sheet with one field rather than a dialog, because Android has no text
 * prompt and every other text field in this app lives in a sheet already —
 * `Sheet` is also what keeps the field above the keyboard.
 */
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import type { StyleOverrides } from '../domain';
import { Sheet } from '../editor/Sheet';
import { saveLook } from '../project/presets-store';
import { Label, PrimaryButton, QuietButton } from './atoms';
import { looks as copy } from './copy';
import { color, radius, space, type } from './theme';

export function SaveLookSheet({
  styleId,
  styleOverrides,
  accent,
  onClose,
  onSaved,
}: {
  styleId: string;
  styleOverrides: StyleOverrides;
  accent: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState('');

  function save() {
    const look = saveLook(name, styleId, styleOverrides);
    if (look) onSaved(look.name);
  }

  return (
    <Sheet onClose={onClose}>
      <View style={styles.body}>
        <Label variant="heading">{copy.title}</Label>
        <Label variant="label" tone="mute">
          {copy.note}
        </Label>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={copy.placeholder}
          placeholderTextColor={color.mute}
          autoFocus
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={save}
          style={styles.input}
        />
        <PrimaryButton title={copy.confirm} accent={accent} disabled={name.trim() === ''} onPress={save} />
        <QuietButton title={copy.cancel} onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.md, paddingBottom: space.md },
  input: {
    ...type.body,
    color: color.paper,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.control,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
