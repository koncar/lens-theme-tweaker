import { getInjectable2 } from "@k8slens/injectable";
import { showErrorNotificationInjectionToken } from "@k8slens/notifications-contracts";
import { runInAction } from "mobx";
import { darkThemeDefaults } from "../catalog/dark-theme-defaults";
import { lightThemeDefaults } from "../catalog/light-theme-defaults";
import { expandPresetOverrides } from "../presets/expand-preset-overrides";
import type { PresetDefinition } from "../presets/presets-catalog";
import type { PaletteMode } from "../state/palette-mode";
import type { SavedTheme } from "../state/theme-tweaker-persistables.injectable";
import { type ThemeTweakerState, themeTweakerStoreInjectable } from "../state/theme-tweaker-store.injectable";

const downloadJson = (filename: string, payload: unknown) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};

const defaultsFor = (mode: PaletteMode) => (mode === "light" ? lightThemeDefaults : darkThemeDefaults);

/** Every slot of the mode, taken from `colors` where it has a string and from the defaults otherwise. */
const completeSnapshot = (mode: PaletteMode, colors: Readonly<Record<string, unknown>>): Record<string, string> => {
  const snapshot: Record<string, string> = { ...defaultsFor(mode) };

  for (const name of Object.keys(snapshot)) {
    const value = colors[name];

    if (typeof value === "string") {
      snapshot[name] = value;
    }
  }

  return snapshot;
};

export interface ThemeTweakerActions {
  readonly setApplied: (isApplied: boolean) => void;
  readonly setMode: (next: PaletteMode) => void;
  readonly applyPreset: (preset: PresetDefinition) => void;
  readonly applySavedTheme: (theme: SavedTheme) => void;
  readonly saveCurrentAs: (name: string) => boolean;
  readonly deleteSaved: (theme: SavedTheme) => void;
  readonly resetCurrentMode: () => void;
  readonly resetColor: (name: string) => void;
  readonly setColors: (names: ReadonlyArray<string>, value: string) => void;
  readonly exportCurrent: () => void;
  readonly importTheme: (file: File) => Promise<void>;
}

export const themeTweakerActionsInjectable = getInjectable2({
  id: "theme-tweaker-actions",
  consumptions: [showErrorNotificationInjectionToken],
  instantiate: (di) => {
    const getStore = di.inject(themeTweakerStoreInjectable);
    const getShowErrorNotification = di.inject(showErrorNotificationInjectionToken);

    return (): ThemeTweakerActions => {
      const store = getStore();

      // The page renders only once the state is loaded, so an action taken before that is not a
      // user's: it is dropped rather than queued.
      const withState =
        <Args extends unknown[]>(act: (state: ThemeTweakerState, ...args: Args) => void) =>
        (...args: Args) => {
          const state = store.get();

          if (state) {
            act(state, ...args);
          }
        };

      // Writes a whole palette as the newly applied one: it becomes what "reset" returns to.
      const applySnapshot = (state: ThemeTweakerState, mode: PaletteMode, snapshot: Record<string, string>) => {
        runInAction(() => {
          state.mode.set(mode);

          for (const [name, value] of Object.entries(snapshot)) {
            state.colors[mode].set(name, value);
            state.baselines[mode].set(name, value);
          }

          state.isApplied.set(true);
        });
      };

      return {
        setApplied: withState((state, isApplied) => {
          runInAction(() => state.isApplied.set(isApplied));
        }),

        setMode: withState((state, next) => {
          runInAction(() => {
            state.mode.set(next);
            state.isApplied.set(true);
          });
        }),

        applyPreset: withState((state, preset) => {
          applySnapshot(state, preset.type, { ...defaultsFor(preset.type), ...expandPresetOverrides(preset.overrides) });
        }),

        applySavedTheme: withState((state, theme) => {
          applySnapshot(state, theme.mode, completeSnapshot(theme.mode, theme.colors));
        }),

        saveCurrentAs: (name) => {
          const state = store.get();
          const trimmed = name.trim();

          if (!state || !trimmed) {
            return false;
          }

          const currentMode = state.mode.get();
          const entry: SavedTheme = {
            name: trimmed,
            createdAt: new Date().toISOString(),
            mode: currentMode,
            colors: Object.fromEntries(state.colors[currentMode].entries()),
          };

          runInAction(() => {
            const existingIndex = state.savedThemes.findIndex((t) => t.name === trimmed);

            if (existingIndex >= 0) {
              state.savedThemes.splice(existingIndex, 1);
            }

            state.savedThemes.unshift(entry);
          });

          return true;
        },

        deleteSaved: withState((state, theme) => {
          runInAction(() => {
            const index = state.savedThemes.findIndex((t) => t.name === theme.name && t.createdAt === theme.createdAt);

            if (index >= 0) {
              state.savedThemes.splice(index, 1);
            }
          });
        }),

        resetCurrentMode: withState((state) => {
          const currentMode = state.mode.get();

          runInAction(() => {
            for (const [name, value] of state.baselines[currentMode].entries()) {
              state.colors[currentMode].set(name, value);
            }
          });
        }),

        resetColor: withState((state, name) => {
          const currentMode = state.mode.get();
          const baselineValue = state.baselines[currentMode].get(name) ?? defaultsFor(currentMode)[name] ?? "#000000";

          runInAction(() => state.colors[currentMode].set(name, baselineValue));
        }),

        // Editing a color is meant to be seen, so it also lays the palette over Lens.
        setColors: withState((state, names, value) => {
          const currentMode = state.mode.get();

          runInAction(() => {
            for (const name of names) {
              state.colors[currentMode].set(name, value);
            }

            state.isApplied.set(true);
          });
        }),

        exportCurrent: withState((state) => {
          const currentMode = state.mode.get();

          downloadJson(`lens-theme-tweaker-${currentMode}-${Date.now()}.json`, {
            name: "Exported theme",
            mode: currentMode,
            createdAt: new Date().toISOString(),
            colors: Object.fromEntries(state.colors[currentMode].entries()),
          });
        }),

        importTheme: async (file) => {
          const state = await store.whenLoaded;
          let parsed: unknown;

          try {
            parsed = JSON.parse(await file.text());
          } catch {
            parsed = undefined;
          }

          const colors = (parsed as { colors?: unknown } | undefined)?.colors;

          if (!colors || typeof colors !== "object") {
            getShowErrorNotification()(`"${file.name}" is not a theme exported from Theme Tweaker.`);

            return;
          }

          const importedMode: PaletteMode = (parsed as { mode?: unknown }).mode === "light" ? "light" : "dark";

          applySnapshot(state, importedMode, completeSnapshot(importedMode, colors as Record<string, unknown>));
        },
      };
    };
  },
});
