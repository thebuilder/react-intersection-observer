import { addons } from "@storybook/manager-api";
import { themes } from "@storybook/theming";
addons.setConfig({
  theme: {
    ...themes.dark,
    brandTitle: "React IntersectionObserver",
    brandUrl: "https://github.com/thebuilder/react-intersection-observer",
  },
});
