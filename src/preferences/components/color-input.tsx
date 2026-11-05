import { Div, Input } from "@k8slens/element-components";
import { TextInput } from "@k8slens/input-components";
import { hexValueOrFallback } from "./hex-value";

interface ColorInputProps {
  readonly value: string;
  readonly label: string;
  readonly onChange: (value: string) => void;
}

/** A color picker swatch, for picking by eye. */
export const ColorSwatchInput = ({ value, label, onChange }: ColorInputProps) => (
  <Div $width="7xl" $height="xxl" $border={{ radius: "s" }} $overflow="hidden" $relative style={{ flexShrink: 0 }}>
    <Input
      type="color"
      value={hexValueOrFallback(value)}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
      }}
    />
  </Div>
);

/** The slot's value as text, for anything the picker cannot express: alpha, rgb(), names. */
export const ColorTextInput = ({ value, label, onChange }: ColorInputProps) => (
  <Div style={{ width: 96, flexShrink: 0 }}>
    <TextInput value={value} aria-label={`${label} value`} onChange={(event) => onChange(event.target.value)} />
  </Div>
);
