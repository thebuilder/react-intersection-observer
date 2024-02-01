import { themes } from "@storybook/theming";
import "intersection-observer";
import "tailwindcss/tailwind.css";

export const parameters = {
  controls: {
    expanded: true,
  },
  theme: {
    ...themes.dark,
  },
  docs: {
    theme: themes.dark,
  },
};
