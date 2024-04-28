import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.@(story|stories).@(ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials"],
  core: {
    builder: "@storybook/builder-vite",
  },
  typescript: {
    reactDocgen: "react-docgen", // or false if you don't need docgen at all
  },
  /**
   * In preparation for the vite build plugin, add the needed config here.
   * @param config {import('vite').UserConfig}
   */
  async viteFinal(config) {
    if (config.optimizeDeps) {
      config.optimizeDeps.include = [
        ...(config.optimizeDeps.include ?? []),
        "@storybook/theming",
        "@storybook/addon-essentials/docs/mdx-react-shim",
        "@storybook/addon-actions",
        "intersection-observer",
      ];
    }
    return config;
  },
};

export default config;
