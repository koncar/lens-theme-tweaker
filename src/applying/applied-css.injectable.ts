import { getInjectable2 } from "@k8slens/injectable";
import { computed } from "mobx";
import { darkThemeDefaults } from "../catalog/dark-theme-defaults";
import { lightThemeDefaults } from "../catalog/light-theme-defaults";
import { themeTweakerStoreInjectable } from "../state/theme-tweaker-store.injectable";
import { buildOverrideCss } from "./build-override-css";

const colorNames = [...new Set([...Object.keys(darkThemeDefaults), ...Object.keys(lightThemeDefaults)])];

const isColor = (value: string) => CSS.supports("color", value);

/** The CSS laying the current palette over Lens's theme, or nothing while Theme Tweaker is off. */
export const appliedCssInjectable = getInjectable2({
  id: "theme-tweaker-applied-css",
  instantiate: (di) => {
    const getStore = di.inject(themeTweakerStoreInjectable);

    return () => {
      const store = getStore();

      return computed(() => {
        const state = store.get();

        if (!state || !state.isApplied.get()) {
          return "";
        }

        return buildOverrideCss(colorNames, state.colors[state.mode.get()], isColor);
      });
    };
  },
});

/** Whether Theme Tweaker's colors are laid over Lens right now. */
export const isAppliedInjectable = getInjectable2({
  id: "theme-tweaker-is-applied",
  instantiate: (di) => {
    const getStore = di.inject(themeTweakerStoreInjectable);

    return () => {
      const store = getStore();

      return computed(() => store.get()?.isApplied.get() ?? false);
    };
  },
});
