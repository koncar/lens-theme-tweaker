import { Button, Span } from "@k8slens/element-components";
import { getInjectable2 } from "@k8slens/injectable";
import { statusBarItemInjectionToken } from "@k8slens/status-bar-contracts";
import { useInject } from "@k8slens/use-inject";
import { observer } from "mobx-react";
import { appliedCssInjectable, isAppliedInjectable } from "../applying/applied-css.injectable";
import { openThemeTweakerPreferencesInjectable } from "../preferences/open-theme-tweaker-preferences.injectable";
import { themeTweakerStoreInjectable } from "../state/theme-tweaker-store.injectable";

const swatchKeys = ["mainBackground", "primary", "magenta", "textColorAccent"] as const;

// The status bar is on screen for as long as the window is, so its item is what carries the
// palette: the `<style>` below is re-rendered as colors change, and leaves with the extension.
// Lens's stylesheet contract only takes CSS fixed at build time, which cannot follow live edits.
const ThemeTweakerStatusBarItem = observer(() => {
  const css = useInject(appliedCssInjectable)().get();
  const state = useInject(themeTweakerStoreInjectable)().get();
  const openPreferences = useInject(openThemeTweakerPreferencesInjectable)();
  const colors = state?.colors[state.mode.get()];

  return (
    <>
      <style>{css}</style>
      <Button
        $onClick={openPreferences}
        $tooltip="Theme Tweaker colors are on. Click to edit or turn them off."
        aria-label="Theme Tweaker"
        $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
        $padding={{ horizontal: "xs" }}
        $backgroundColor="transparent"
        $border={{ width: "zero" }}
        $color="inherit"
        $font={{ size: "xs" }}
        $cursor="pointer"
      >
        <Span $flex={{ direction: "horizontal" }} $border={{ width: "xxs", color: "grey60", radius: "s" }} $overflow="hidden">
          {swatchKeys.map((k) => (
            <Span key={k} $block style={{ width: 6, height: 10, background: colors?.get(k) ?? "transparent" }} />
          ))}
        </Span>
        Theme Tweaker
      </Button>
    </>
  );
});

export const themeTweakerStatusBarItemInjectable = getInjectable2({
  id: "theme-tweaker-status-bar-item",
  instantiate: (di) => {
    const getIsApplied = di.inject(isAppliedInjectable);

    return () => ({
      Component: ThemeTweakerStatusBarItem,
      position: "right" as const,
      orderNumber: 90,
      isVisible: getIsApplied(),
    });
  },
  injectionToken: statusBarItemInjectionToken,
});
