import { getInjectable2 } from "@k8slens/injectable";
import { action, observable } from "mobx";
import { themeTweakerActionsInjectable } from "../actions/theme-tweaker-actions.injectable";
import type { PaletteMode } from "../state/palette-mode";

export type PresetFilter = PaletteMode | "all";

const savedMessageTimeoutMs = 3000;

/** What the Theme Tweaker page itself remembers while it is open: filters, the name being typed. */
export const themeTweakerPageStateInjectable = getInjectable2({
  id: "theme-tweaker-page-state",
  instantiate: (di) => {
    const getActions = di.inject(themeTweakerActionsInjectable);

    return () => {
      const actions = getActions();
      const presetFilter = observable.box<PresetFilter>("all");
      const slotFilter = observable.box("");
      const pendingName = observable.box("");
      const savedMessage = observable.box<string | undefined>(undefined);
      let clearSavedMessage: ReturnType<typeof setTimeout> | undefined;

      return {
        presetFilter: () => presetFilter.get(),
        slotFilter: () => slotFilter.get(),
        pendingName: () => pendingName.get(),
        savedMessage: () => savedMessage.get(),

        setPresetFilter: action((filter: PresetFilter) => presetFilter.set(filter)),
        setSlotFilter: action((filter: string) => slotFilter.set(filter)),
        setPendingName: action((name: string) => pendingName.set(name)),

        saveAsPendingName: action(() => {
          const name = pendingName.get().trim();

          if (!actions.saveCurrentAs(name)) {
            return;
          }

          pendingName.set("");
          savedMessage.set(`Saved as "${name}"`);

          clearTimeout(clearSavedMessage);
          clearSavedMessage = setTimeout(
            action(() => savedMessage.set(undefined)),
            savedMessageTimeoutMs,
          );
        }),
      };
    };
  },
});
