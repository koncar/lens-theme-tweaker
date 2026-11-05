import { Div, Span } from "@k8slens/element-components";
import { useInject } from "@k8slens/use-inject";
import { observer } from "mobx-react";
import { themeTweakerActionsInjectable } from "../../actions/theme-tweaker-actions.injectable";
import { quickPalette } from "../../catalog/quick-palette";
import { themeTweakerStoreInjectable } from "../../state/theme-tweaker-store.injectable";
import { ColorSwatchInput, ColorTextInput } from "../components/color-input";
import { Section } from "../components/section";

export const QuickPaletteBlock = observer(() => {
  const state = useInject(themeTweakerStoreInjectable)().get();
  const actions = useInject(themeTweakerActionsInjectable)();

  if (!state) {
    return null;
  }

  const colors = state.colors[state.mode.get()];

  return (
    <Section title="Quick palette">
      <Div $grid={{ columns: 2, gap: "xs" }}>
        {quickPalette.map((entry) => {
          const current = colors.get(entry.read) ?? "";
          const setBundle = (value: string) => actions.setColors(entry.writes, value);

          return (
            <Div
              key={entry.id}
              $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
              $padding={{ vertical: "xxs", horizontal: "s" }}
              $backgroundColor="backgroundPrimary"
              $border={{ width: "xxs", color: "grey60", radius: "s" }}
            >
              <ColorSwatchInput value={current} label={entry.label} onChange={setBundle} />
              <Div $flex={{ direction: "vertical" }} $width="stretch" $overflow="hidden">
                <Div $font={{ size: "xs", bold: "600", noWrap: true, textOverflow: "ellipsis" }} $color="textHighlight">
                  {entry.label}
                </Div>
                <Span $font={{ size: "xxs", noWrap: true, textOverflow: "ellipsis" }} $color="textMuted">
                  {entry.hint}
                </Span>
              </Div>
              <ColorTextInput value={current} label={entry.label} onChange={setBundle} />
            </Div>
          );
        })}
      </Div>
    </Section>
  );
});
