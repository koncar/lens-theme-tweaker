import { Div, Span } from "@k8slens/element-components";
import { useInject } from "@k8slens/use-inject";
import { observer } from "mobx-react";
import type { ReactNode } from "react";
import { themeTweakerActionsInjectable } from "../../actions/theme-tweaker-actions.injectable";
import type { PaletteMode } from "../../state/palette-mode";
import { themeTweakerStoreInjectable } from "../../state/theme-tweaker-store.injectable";
import { Section } from "../components/section";
import { SegmentedToggle, type SegmentedToggleOption } from "../components/segmented-toggle";

const appliedOptions: ReadonlyArray<SegmentedToggleOption<"on" | "off">> = [
  { id: "on", label: "On" },
  { id: "off", label: "Off" },
];

const modeOptions: ReadonlyArray<SegmentedToggleOption<PaletteMode>> = [
  { id: "dark", label: "Dark", glyph: "◐" },
  { id: "light", label: "Light", glyph: "◑" },
];

const Labelled = ({ label, children }: { readonly label: string; readonly children: ReactNode }) => (
  <Div $flex={{ direction: "horizontal", verticalAlign: "center", gap: "s" }}>
    <Span $font={{ size: "s" }} $color="textDefault">
      {label}
    </Span>
    {children}
  </Div>
);

export const ApplyBlock = observer(() => {
  const state = useInject(themeTweakerStoreInjectable)().get();
  const actions = useInject(themeTweakerActionsInjectable)();

  if (!state) {
    return null;
  }

  return (
    <Section title="Colors">
      <Div $font={{ size: "s" }} $color="textDefault">
        Pick a preset, tweak every color live, save your favourites.
      </Div>

      <Div $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xl", wrap: true }}>
        <Labelled label="Apply to Lens">
          <SegmentedToggle
            label="Apply Theme Tweaker colors to Lens"
            options={appliedOptions}
            selected={state.isApplied.get() ? "on" : "off"}
            onSelect={(id) => actions.setApplied(id === "on")}
          />
        </Labelled>

        <Labelled label="Palette">
          <SegmentedToggle label="Palette" options={modeOptions} selected={state.mode.get()} onSelect={actions.setMode} />
        </Labelled>
      </Div>

      <Div $font={{ size: "xs" }} $color="textMuted">
        Theme Tweaker paints its colors over the Lens theme chosen in Preferences › Appearance. Editors and terminals
        keep that theme&apos;s own colors, so pair a light palette with a light Lens theme.
      </Div>
    </Section>
  );
});
