import { getInjectable2 } from "@k8slens/injectable";
import { type IObservableArray, type IObservableValue, type ObservableMap, observable, runInAction } from "mobx";
import type { PaletteMode } from "./palette-mode";
import {
  darkBaselineBunch,
  darkColorsBunch,
  isAppliedBunch,
  lightBaselineBunch,
  lightColorsBunch,
  paletteModeBunch,
  type SavedTheme,
  savedThemesBunch,
} from "./theme-tweaker-persistables.injectable";

export interface ThemeTweakerState {
  readonly colors: Readonly<Record<PaletteMode, ObservableMap<string, string>>>;
  readonly baselines: Readonly<Record<PaletteMode, ObservableMap<string, string>>>;
  readonly mode: IObservableValue<PaletteMode>;
  readonly isApplied: IObservableValue<boolean>;
  readonly savedThemes: IObservableArray<SavedTheme>;
}

export interface ThemeTweakerStore {
  /** Everything Theme Tweaker keeps, once it has been read from disk; undefined until then. Observable. */
  readonly get: () => ThemeTweakerState | undefined;
  readonly whenLoaded: Promise<ThemeTweakerState>;
}

// The persistables hydrate asynchronously, and components read through `useInject`, which does not
// unwrap promises. So the store starts reading at once and exposes the result as an observable box,
// letting everything that renders simply show nothing until the state is there.
export const themeTweakerStoreInjectable = getInjectable2({
  id: "theme-tweaker-store",
  instantiate: (di) => {
    const getDarkColors = di.inject(darkColorsBunch.persistable);
    const getLightColors = di.inject(lightColorsBunch.persistable);
    const getDarkBaseline = di.inject(darkBaselineBunch.persistable);
    const getLightBaseline = di.inject(lightBaselineBunch.persistable);
    const getMode = di.inject(paletteModeBunch.persistable);
    const getIsApplied = di.inject(isAppliedBunch.persistable);
    const getSavedThemes = di.inject(savedThemesBunch.persistable);

    return (): ThemeTweakerStore => {
      const loaded = observable.box<ThemeTweakerState | undefined>(undefined, { deep: false });

      const whenLoaded = (async () => {
        const [darkColors, lightColors, darkBaseline, lightBaseline, mode, isApplied, savedThemes] = await Promise.all([
          getDarkColors(),
          getLightColors(),
          getDarkBaseline(),
          getLightBaseline(),
          getMode(),
          getIsApplied(),
          getSavedThemes(),
        ]);

        const state: ThemeTweakerState = {
          colors: { dark: darkColors, light: lightColors },
          baselines: { dark: darkBaseline, light: lightBaseline },
          mode,
          isApplied,
          savedThemes,
        };

        runInAction(() => loaded.set(state));

        return state;
      })();

      whenLoaded.catch((error) => console.error("[theme-tweaker] Could not read the saved colors", error));

      return { get: () => loaded.get(), whenLoaded };
    };
  },
});
