import type { StorybookConfig } from "@storybook/react-vite";

const favicon = `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`;

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  staticDirs: [{ from: "../../docs/public", to: "/" }],
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.@(story|stories).@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  // Storybook's generated brandImage rule uses !important, so this needs to be
  // appended after it and match that priority.
  managerHead: (head) => `
    ${head}
    ${favicon}
    <style>
      img[alt="React Intersection Observer"] {
        width: 100%;
        height: auto;
        max-width: 100% !important;
      }
    </style>
  `,
  previewHead: (head) => `${head}${favicon}`,
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
        "storybook/theming",
      ];
    }
    return config;
  },
};

export default config;
