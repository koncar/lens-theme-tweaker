import { getInjectable2 } from "@k8slens/injectable";
import { computed } from "mobx";
import { darkThemeDefaults } from "../catalog/dark-theme-defaults";
import { lightThemeDefaults } from "../catalog/light-theme-defaults";
import { presets } from "../presets/presets-catalog";
import { themeTweakerStoreInjectable } from "./theme-tweaker-store.injectable";

const colorsMatch = (a: Record<string, string>, b: Record<string, string>, keys: ReadonlyArray<string>): boolean =>
  keys.every((k) => (a[k] ?? "").toLowerCase() === (b[k] ?? "").toLowerCase());

/** The presets the colors laid over Lens currently match, so the gallery can mark them. */
export const activePresetIdsInjectable = getInjectable2({
  id: "theme-tweaker-active-preset-ids",
  instantiate: (di) => {
    const getStore = di.inject(themeTweakerStoreInjectable);

    return () => {
      const store = getStore();

      return computed<ReadonlySet<string>>(() => {
        const state = store.get();

        if (!state || !state.isApplied.get()) {
          return new Set<string>();
        }

        const currentMode = state.mode.get();
        const snapshot = Object.fromEntries(state.colors[currentMode].entries());
        const modeDefaults = currentMode === "light" ? lightThemeDefaults : darkThemeDefaults;

        const matchingIds = new Set<string>();

        for (const preset of presets) {
          if (preset.type !== currentMode) {
            continue;
          }

          const overrideKeys = Object.keys(preset.overrides);

          if (overrideKeys.length === 0) {
            // A preset with no overrides (e.g. "Lens Dark") is active when the current colors
            // match the mode's defaults exactly.
            if (colorsMatch(snapshot, modeDefaults, Object.keys(modeDefaults))) {
              matchingIds.add(preset.id);
            }
          } else if (colorsMatch(snapshot, preset.overrides as Record<string, string>, overrideKeys)) {
            matchingIds.add(preset.id);
          }
        }

        return matchingIds;
      });
    };
  },
});
