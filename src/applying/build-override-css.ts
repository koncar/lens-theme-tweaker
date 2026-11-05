/**
 * Lens paints its theme by setting one CSS custom property per color slot (`--mainBackground`,
 * `--grey80`, …) as an inline style on the root element. Theme Tweaker cannot register a theme of
 * its own with Lens, so it lays its palette over whichever theme is active: one `:root` rule that
 * re-declares those properties `!important`, which is the only thing that outranks an inline style.
 *
 * Only values the browser accepts as a color make it into the rule. That keeps a half-typed value
 * from blanking a slot while the user is still typing, and keeps an imported file from smuggling
 * anything but colors into the stylesheet.
 */
export type IsColor = (value: string) => boolean;

const outsideOfDeclaration = /[;{}<>\\]/;

export const buildOverrideCss = (
  colorNames: ReadonlyArray<string>,
  colors: ReadonlyMap<string, string>,
  isColor: IsColor,
): string => {
  const declarations: string[] = [];

  for (const name of colorNames) {
    const value = colors.get(name)?.trim();

    if (!value || outsideOfDeclaration.test(value) || !isColor(value)) {
      continue;
    }

    declarations.push(`  --${name}: ${value} !important;`);
  }

  return declarations.length === 0 ? "" : `:root {\n${declarations.join("\n")}\n}\n`;
};
