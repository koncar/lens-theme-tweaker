import { Button, Div, Span } from "@k8slens/element-components";
import { useInject } from "@k8slens/use-inject";
import { observer } from "mobx-react";
import { themeTweakerActionsInjectable } from "../../actions/theme-tweaker-actions.injectable";
import { presets } from "../../presets/presets-catalog";
import { activePresetIdsInjectable } from "../../state/active-preset-ids.injectable";
import { Section } from "../components/section";
import { type PresetFilter, themeTweakerPageStateInjectable } from "../theme-tweaker-page-state.injectable";

const filterLabel: Record<PresetFilter, string> = { all: "All", dark: "Dark", light: "Light" };

const PresetFilterBar = observer(() => {
  const pageState = useInject(themeTweakerPageStateInjectable)();
  const filter = pageState.presetFilter();

  return (
    <Div $flex={{ direction: "horizontal", gap: "xs" }}>
      {(["all", "dark", "light"] as const).map((f) => {
        const active = filter === f;

        return (
          <Button
            key={f}
            $onClick={() => pageState.setPresetFilter(f)}
            aria-pressed={active}
            $padding={{ vertical: "xxs", horizontal: "s" }}
            $border={{ width: "xxs", color: active ? "primary" : "grey60", radius: "s" }}
            $backgroundColor={active ? "primary" : "transparent"}
            $color={active ? "white" : "textDefault"}
            $font={{ size: "xs", bold: active ? "600" : false }}
            $cursor="pointer"
          >
            {filterLabel[f]}
          </Button>
        );
      })}
    </Div>
  );
});

const PresetGallery = observer(() => {
  const pageState = useInject(themeTweakerPageStateInjectable)();
  const activePresetIds = useInject(activePresetIdsInjectable)().get();
  const actions = useInject(themeTweakerActionsInjectable)();
  const filter = pageState.presetFilter();
  const visiblePresets = filter === "all" ? presets : presets.filter((p) => p.type === filter);

  return (
    <Div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
      {visiblePresets.map((preset) => {
        const active = activePresetIds.has(preset.id);

        return (
          <Button
            key={preset.id}
            $onClick={() => actions.applyPreset(preset)}
            $tooltip={preset.description}
            aria-pressed={active}
            $flex={{ direction: "vertical", gap: "xs" }}
            $padding="s"
            $border={{ width: "xxs", color: active ? "primary" : "grey60", radius: "s" }}
            $backgroundColor="backgroundPrimary"
            $cursor="pointer"
            $textAlign="left"
          >
            <Div $grid={{ columns: 4 }} $border={{ radius: "s" }} $overflow="hidden" style={{ height: 40 }}>
              {preset.swatch.map((c, i) => (
                <Span key={i} $block style={{ background: c }} />
              ))}
            </Div>
            <Div>
              <Div $font={{ size: "s", bold: "600" }} $color="textHighlight">
                {preset.name}
                <Span
                  $margin={{ left: "xs" }}
                  $padding={{ horizontal: "xs" }}
                  $border={{ width: "xxs", color: preset.type === "light" ? "notice" : "grey25", radius: "s" }}
                  $color={preset.type === "light" ? "notice" : "textHighlight"}
                  $font={{ size: "xxs", bold: "600", uppercase: true }}
                >
                  {preset.type}
                </Span>
              </Div>
              <Div $font={{ size: "xs" }} $margin={{ top: "xxs" }} $color="textMuted">
                by {preset.author}
              </Div>
            </Div>
          </Button>
        );
      })}
    </Div>
  );
});

export const PresetsBlock = () => (
  <Section title="Preset themes" aside={<PresetFilterBar />}>
    <PresetGallery />
  </Section>
);
