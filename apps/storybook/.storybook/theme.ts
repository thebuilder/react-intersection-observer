import { themes } from "storybook/theming";

// sRGB equivalent of the docs light-mode accent: oklch(0.6 0.15 290).
// Storybook's theme engine does not support oklch() values.
const docsAccent = "#816dd2";

export const storybookTheme = {
  ...themes.light,
  barSelectedColor: docsAccent,
  colorPrimary: docsAccent,
  colorSecondary: docsAccent,
};
