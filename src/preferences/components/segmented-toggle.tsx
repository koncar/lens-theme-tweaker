import { Button, Div, Span } from "@k8slens/element-components";

export interface SegmentedToggleOption<Id extends string> {
  readonly id: Id;
  readonly label: string;
  readonly glyph?: string;
}

interface SegmentedToggleProps<Id extends string> {
  readonly options: ReadonlyArray<SegmentedToggleOption<Id>>;
  readonly selected: Id;
  readonly onSelect: (id: Id) => void;
  readonly label: string;
}

export const SegmentedToggle = <Id extends string>({ options, selected, onSelect, label }: SegmentedToggleProps<Id>) => (
  <Div
    $flex={{ direction: "horizontal", horizontalAlign: "left" }}
    $border={{ width: "xxs", color: "grey60", radius: "s" }}
    $overflow="hidden"
    role="tablist"
    aria-label={label}
  >
    {options.map((option) => {
      const active = option.id === selected;

      return (
        <Button
          key={option.id}
          role="tab"
          aria-selected={active}
          $onClick={() => onSelect(option.id)}
          $padding={{ vertical: "xxs", horizontal: "m" }}
          $backgroundColor={active ? "primary" : "transparent"}
          $color={active ? "white" : "textDefault"}
          $font={{ size: "s", bold: active ? "600" : false }}
          $cursor="pointer"
          $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
        >
          {option.glyph ? <Span aria-hidden>{option.glyph}</Span> : null}
          {option.label}
        </Button>
      );
    })}
  </Div>
);
