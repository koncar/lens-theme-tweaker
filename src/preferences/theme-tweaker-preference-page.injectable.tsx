import { extensionsPreferenceNavigationGroupId, getPreferencePageInjectableBunch } from "@k8slens/preferences-contracts";
import { AllSlotsBlock } from "./blocks/all-slots-block";
import { ApplyBlock } from "./blocks/apply-block";
import { ManageBlock } from "./blocks/manage-block";
import { PresetsBlock } from "./blocks/presets-block";
import { QuickPaletteBlock } from "./blocks/quick-palette-block";
import { SavedThemesBlock } from "./blocks/saved-themes-block";
import { themeTweakerPageId } from "./theme-tweaker-page-id";

const ThemeTweakerLabel = () => <>Theme Tweaker</>;

export default getPreferencePageInjectableBunch({
  id: themeTweakerPageId,
  Label: ThemeTweakerLabel,
  orderNumber: 100,
  groupId: extensionsPreferenceNavigationGroupId,
  blocks: [
    { id: "apply", orderNumber: 10, Component: ApplyBlock },
    { id: "presets", orderNumber: 20, Component: PresetsBlock },
    { id: "quick-palette", orderNumber: 30, Component: QuickPaletteBlock },
    { id: "all-slots", orderNumber: 40, Component: AllSlotsBlock },
    { id: "manage", orderNumber: 50, Component: ManageBlock },
    { id: "saved-themes", orderNumber: 60, Component: SavedThemesBlock },
  ],
});
