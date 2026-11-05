import { Div, Span } from "@k8slens/element-components";
import { PlainButton, PrimaryButton } from "@k8slens/input-components";
import { useInject } from "@k8slens/use-inject";
import { observer } from "mobx-react";
import { themeTweakerActionsInjectable } from "../../actions/theme-tweaker-actions.injectable";
import { themeTweakerStoreInjectable } from "../../state/theme-tweaker-store.injectable";
import { Section } from "../components/section";

const swatchKeys = ["mainBackground", "primary", "magenta", "textColorAccent"] as const;

export const SavedThemesBlock = observer(() => {
  const state = useInject(themeTweakerStoreInjectable)().get();
  const actions = useInject(themeTweakerActionsInjectable)();

  if (!state) {
    return null;
  }

  return (
    <Section title="Saved themes">
      {state.savedThemes.length === 0 ? (
        <Div $font={{ size: "s" }} $padding={{ vertical: "s" }} $color="textMuted">
          No saved themes yet. Tweak some colors and use &ldquo;Save as&rdquo; above to keep them.
        </Div>
      ) : (
        <Div $flex={{ direction: "vertical", gap: "xs" }}>
          {state.savedThemes.map((theme) => (
            <Div
              key={`${theme.name}-${theme.createdAt}`}
              $flex={{ direction: "horizontal", verticalAlign: "center", gap: "s" }}
              $padding={{ vertical: "xs", horizontal: "s" }}
              $backgroundColor="backgroundPrimary"
              $border={{ radius: "s" }}
            >
              <Div $flex={{ direction: "horizontal" }} $border={{ radius: "s" }} $overflow="hidden" $width="11xl" $height="xl">
                {swatchKeys.map((k) => (
                  <Span key={k} $width="stretch" $block style={{ background: theme.colors[k] ?? "transparent" }} />
                ))}
              </Div>
              <Span $font={{ size: "s", bold: "600" }} $color="textHighlight" $width="stretch" $overflow="hidden">
                {theme.name}
              </Span>
              <Span
                $padding={{ horizontal: "xs" }}
                $border={{ width: "xxs", color: theme.mode === "light" ? "notice" : "grey25", radius: "s" }}
                $color={theme.mode === "light" ? "notice" : "textHighlight"}
                $font={{ size: "xxs", bold: "600", uppercase: true }}
              >
                {theme.mode}
              </Span>
              <Span $font={{ size: "xs" }} $color="textMuted">
                {new Date(theme.createdAt).toLocaleDateString()}
              </Span>
              <PrimaryButton $onClick={() => actions.applySavedTheme(theme)}>Apply</PrimaryButton>
              <PlainButton $onClick={() => actions.deleteSaved(theme)}>Delete</PlainButton>
            </Div>
          ))}
        </Div>
      )}
    </Section>
  );
});
