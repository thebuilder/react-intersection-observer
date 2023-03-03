import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.@(story|stories).@(ts|tsx)',
  ],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
      },
    },
    'storybook-dark-mode',
  ],
  core: {
    builder: '@storybook/builder-vite',
  },
  /**
   * In preparation for the vite build plugin, add the needed config here.
   * @param config {import('vite').UserConfig}
   */
  async viteFinal(config) {
    if (config.optimizeDeps) {
      config.optimizeDeps.include = [
        ...(config.optimizeDeps.include ?? []),
        '@storybook/theming',
        '@storybook/addon-essentials/docs/mdx-react-shim',
        '@storybook/addon-actions',
        'intersection-observer',
      ];
    }
    return config;
  },
};

export default config;
