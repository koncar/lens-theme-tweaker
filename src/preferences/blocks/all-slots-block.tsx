import { Button, Div, Span } from "@k8slens/element-components";
import { TextInput } from "@k8slens/input-components";
import { useInject } from "@k8slens/use-inject";
import { observer } from "mobx-react";
import { themeTweakerActionsInjectable } from "../../actions/theme-tweaker-actions.injectable";
import { type ColorGroup, colorGroups, colorLabels } from "../../catalog/colors-catalog";
import { themeTweakerStoreInjectable } from "../../state/theme-tweaker-store.injectable";
import { ColorSwatchInput, ColorTextInput } from "../components/color-input";
import { Section } from "../components/section";
import { themeTweakerPageStateInjectable } from "../theme-tweaker-page-state.injectable";

interface ColorCardProps {
  readonly entry: ColorGroup["colors"][number];
  readonly current: string;
  readonly baseline: string;
}

const ColorCard = observer(({ entry, current, baseline }: ColorCardProps) => {
  const actions = useInject(themeTweakerActionsInjectable)();
  const isChanged = current !== baseline && baseline !== "";
  const setColor = (value: string) => actions.setColors([entry.name], value);

  return (
    <Div
      title={entry.name}
      $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
      $padding={{ vertical: "xxs", horizontal: "s" }}
      $border={{ width: "xxs", color: isChanged ? "primary" : "grey60", radius: "s" }}
      $backgroundColor="backgroundPrimary"
    >
      <ColorSwatchInput value={current} label={entry.label} onChange={setColor} />
      <Span
        $font={{ size: "xs", noWrap: true, textOverflow: "ellipsis", bold: isChanged ? "600" : false }}
        $color={isChanged ? "textHighlight" : "textDefault"}
        $width="stretch"
        $overflow="hidden"
      >
        {isChanged ? "• " : ""}
        {entry.label}
      </Span>
      <ColorTextInput value={current} label={entry.label} onChange={setColor} />
      <Button
        $onClick={() => actions.resetColor(entry.name)}
        $tooltip="Reset to last applied"
        aria-label={`Reset ${entry.label}`}
        $color={isChanged ? "textHighlight" : "grey60"}
        $cursor="pointer"
        $padding={{ vertical: "xxs", horizontal: "xs" }}
        $backgroundColor="transparent"
        $border={{ width: "zero", radius: "s" }}
        $font={{ size: "m" }}
        style={{ flexShrink: 0, minWidth: 28, lineHeight: 1 }}
      >
        ↺
      </Button>
    </Div>
  );
});

export const AllSlotsBlock = observer(() => {
  const state = useInject(themeTweakerStoreInjectable)().get();
  const pageState = useInject(themeTweakerPageStateInjectable)();

  if (!state) {
    return null;
  }

  const currentMode = state.mode.get();
  const colors = state.colors[currentMode];
  const baseline = state.baselines[currentMode];
  const filter = pageState.slotFilter();
  const needle = filter.trim().toLowerCase();

  const matches = (name: string): boolean =>
    !needle || name.toLowerCase().includes(needle) || (colorLabels[name] ?? "").toLowerCase().includes(needle);

  const visibleGroups = colorGroups
    .map((group) => ({ group, visible: group.colors.filter((c) => matches(c.name)) }))
    .filter(({ visible }) => visible.length > 0);

  return (
    <Section title={`All slots · ${colors.size} colors · ${currentMode}`}>
      <TextInput
        type="search"
        placeholder="Filter colors…"
        value={filter}
        onChange={(event) => pageState.setSlotFilter(event.target.value)}
      />
      {visibleGroups.map(({ group, visible }, index) => (
        <Div key={group.title} $flex={{ direction: "vertical", gap: "xs" }} $margin={{ top: index === 0 ? "zero" : "s" }}>
          <Div $font={{ size: "xs", bold: "600", uppercase: true }} $color="textHighlight">
            {group.title}
          </Div>
          <Div $grid={{ columns: 2, gap: "xs" }}>
            {visible.map((entry) => (
              <ColorCard
                key={entry.name}
                entry={entry}
                current={colors.get(entry.name) ?? ""}
                baseline={baseline.get(entry.name) ?? ""}
              />
            ))}
          </Div>
        </Div>
      ))}
      {visibleGroups.length === 0 ? (
        <Div $font={{ size: "s" }} $color="textMuted">
          No color matches &ldquo;{filter}&rdquo;.
        </Div>
      ) : null}
    </Section>
  );
});
