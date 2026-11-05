import {
  getPersistableArrayInjectableBunch,
  getPersistableMapInjectableBunch,
  getPersistableValueInjectableBunch,
} from "@k8slens/persistable-contracts";
import { darkThemeDefaults } from "../catalog/dark-theme-defaults";
import { lightThemeDefaults } from "../catalog/light-theme-defaults";
import type { PaletteMode } from "./palette-mode";

export interface SavedTheme {
  readonly name: string;
  readonly createdAt: string;
  readonly mode: PaletteMode;
  readonly colors: Readonly<Record<string, string>>;
}

// The colors being edited, one palette per mode. Seeded with Lens's own palette for the mode.
export const darkColorsBunch = getPersistableMapInjectableBunch<string, string>()({
  id: "custom-dark-colors",
  defaultValue: { instantiate: () => async () => Object.entries(darkThemeDefaults) },
});

export const lightColorsBunch = getPersistableMapInjectableBunch<string, string>()({
  id: "custom-light-colors",
  defaultValue: { instantiate: () => async () => Object.entries(lightThemeDefaults) },
});

// The colors as last applied from a preset, a saved theme or an import: what "reset" returns to.
export const darkBaselineBunch = getPersistableMapInjectableBunch<string, string>()({
  id: "custom-dark-baseline",
  defaultValue: { instantiate: () => async () => Object.entries(darkThemeDefaults) },
});

export const lightBaselineBunch = getPersistableMapInjectableBunch<string, string>()({
  id: "custom-light-baseline",
  defaultValue: { instantiate: () => async () => Object.entries(lightThemeDefaults) },
});

export const paletteModeBunch = getPersistableValueInjectableBunch<PaletteMode>()({
  id: "custom-mode",
  defaultValue: { instantiate: () => async () => "dark" as const },
});

// Whether Theme Tweaker's colors are laid over Lens's theme at all.
export const isAppliedBunch = getPersistableValueInjectableBunch<boolean>()({
  id: "is-applied",
  defaultValue: { instantiate: () => async () => false },
});

export const savedThemesBunch = getPersistableArrayInjectableBunch<SavedTheme>()({
  id: "saved-themes",
});
