import { Div, Span } from "@k8slens/element-components";
import { PlainButton, PrimaryButton, TextInput } from "@k8slens/input-components";
import { useInject } from "@k8slens/use-inject";
import { observer } from "mobx-react";
import { useRef } from "react";
import { themeTweakerActionsInjectable } from "../../actions/theme-tweaker-actions.injectable";
import { themeTweakerStoreInjectable } from "../../state/theme-tweaker-store.injectable";
import { Section } from "../components/section";
import { themeTweakerPageStateInjectable } from "../theme-tweaker-page-state.injectable";

export const ManageBlock = observer(() => {
  const state = useInject(themeTweakerStoreInjectable)().get();
  const actions = useInject(themeTweakerActionsInjectable)();
  const pageState = useInject(themeTweakerPageStateInjectable)();
  const importInputRef = useRef<HTMLInputElement>(null);

  if (!state) {
    return null;
  }

  const savedMessage = pageState.savedMessage();

  return (
    <Section title="Manage">
      <Div $flex={{ direction: "horizontal", verticalAlign: "center", gap: "s", wrap: true }}>
        <TextInput
          $width="11xl"
          placeholder="Theme name…"
          value={pageState.pendingName()}
          onChange={(event) => pageState.setPendingName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              pageState.saveAsPendingName();
            }
          }}
        />
        <PrimaryButton $disabled={pageState.pendingName().trim() === ""} $onClick={pageState.saveAsPendingName}>
          Save as…
        </PrimaryButton>
        <PlainButton $onClick={actions.resetCurrentMode}>{`Reset ${state.mode.get()}`}</PlainButton>
        <PlainButton $onClick={actions.exportCurrent}>Export JSON</PlainButton>
        <Div $hidden>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void actions.importTheme(file);
              }

              event.target.value = "";
            }}
          />
        </Div>
        <PlainButton $onClick={() => importInputRef.current?.click()}>Import JSON</PlainButton>
        {savedMessage ? (
          <Span
            role="status"
            aria-live="polite"
            $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
            $font={{ size: "xs", bold: "600" }}
            $color="success"
          >
            <Span aria-hidden>✓</Span>
            {savedMessage}
          </Span>
        ) : null}
      </Div>
    </Section>
  );
});
