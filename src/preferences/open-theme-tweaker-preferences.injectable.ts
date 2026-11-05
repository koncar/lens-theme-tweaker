import { getInjectable2 } from "@k8slens/injectable";
import { navigateToPreferencesInjectionToken } from "@k8slens/preferences-contracts";
import { themeTweakerPageId } from "./theme-tweaker-page-id";

export const openThemeTweakerPreferencesInjectable = getInjectable2({
  id: "theme-tweaker-open-preferences",
  consumptions: [navigateToPreferencesInjectionToken],
  instantiate: (di) => {
    const navigateToPreferences = di.inject(navigateToPreferencesInjectionToken)();

    return () => () => {
      void navigateToPreferences({ pageId: themeTweakerPageId });
    };
  },
});
