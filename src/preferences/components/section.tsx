import { Div } from "@k8slens/element-components";
import type { ReactNode } from "react";

interface SectionProps {
  readonly title: string;
  /** Rendered across from the title, such as a filter. */
  readonly aside?: ReactNode;
  readonly children: ReactNode;
}

export const Section = ({ title, aside, children }: SectionProps) => (
  <Div
    $flex={{ direction: "vertical", gap: "s" }}
    $padding="m"
    $margin={{ bottom: "m" }}
    $border={{ width: "xxs", color: "grey60", radius: "s" }}
  >
    <Div $flex={{ direction: "horizontal", verticalAlign: "center", horizontalAlign: "space-between", gap: "s", wrap: true }}>
      <Div $font={{ size: "m", bold: "600" }} $color="textHighlight">
        {title}
      </Div>
      {aside}
    </Div>
    {children}
  </Div>
);
