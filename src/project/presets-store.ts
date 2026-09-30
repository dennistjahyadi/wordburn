/**
 * Looks the user has named: "my podcast style", "client A".
 *
 * `presets.json`, beside `settings.json`. A saved look is the same pair the
 * style sheet already writes — a preset and the choices made on top of it — so
 * applying one is `restyle` with a name attached, and nothing about the layout
 * or the burn-in knows these exist. A creator who cuts for several shows keeps a
 * look per show; the batch setup is where they pick one.
 */
import { File, Paths } from 'expo-file-system';

import type { StyleOverrides } from '../domain';

export interface SavedLook {
  id: string;
  name: string;
  styleId: string;
  styleOverrides: StyleOverrides;
  createdAt: string;
}

/** Enough for a look per show, and short enough to pick from without searching. */
export const MAX_SAVED_LOOKS = 20;

function presetsFile(): File {
  return new File(Paths.document, 'presets.json');
}

export function loadLooks(): SavedLook[] {
  const file = presetsFile();
  if (!file.exists) return [];
  try {
    const parsed = JSON.parse(file.textSync()) as SavedLook[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLooks(looks: SavedLook[]): void {
  presetsFile().write(JSON.stringify(looks));
}

/**
 * Saves a look under a name. A name already in use is replaced rather than
 * doubled, because two looks both called "podcast" is a question the user will
 * have to answer later with no way of telling them apart.
 */
export function saveLook(name: string, styleId: string, styleOverrides: StyleOverrides): SavedLook | null {
  const trimmed = name.trim().slice(0, 40);
  if (trimmed === '') return null;

  const looks = loadLooks();
  const existing = looks.find((look) => look.name.toLowerCase() === trimmed.toLowerCase());
  const look: SavedLook = {
    id: existing?.id ?? `look-${Date.now().toString(36)}`,
    name: trimmed,
    styleId,
    styleOverrides,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  const next = existing
    ? looks.map((candidate) => (candidate.id === existing.id ? look : candidate))
    : [...looks, look].slice(-MAX_SAVED_LOOKS);
  saveLooks(next);
  return look;
}

export function deleteLook(id: string): void {
  saveLooks(loadLooks().filter((look) => look.id !== id));
}
