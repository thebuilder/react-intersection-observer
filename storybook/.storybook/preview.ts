import { themes } from "storybook/theming";
import "../styles.css";

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
