import { addons } from "@storybook/addons";
import { themes } from "@storybook/theming";

addons.setConfig({
  theme: {
    ...themes.dark,
    brandTitle: "React IntersectionObserver",
    brandUrl: "https://github.com/thebuilder/react-intersection-observer",
  },
});
