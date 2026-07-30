import { addons } from "storybook/manager-api";
import docsLogo from "../../docs/public/logo-horizontal.svg";
import { storybookTheme } from "./theme";

addons.setConfig({
  theme: {
    ...storybookTheme,
    brandImage: docsLogo,
    brandTitle: "React Intersection Observer",
    brandUrl: "https://react-intersection-observer.vercel.app/",
  },
});
