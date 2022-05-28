module.exports = {
  // features: {
  //   storyStoreV7: true,
  // },
  stories: [
    '../src/stories/**/*.@(story|stories).mdx',
    '../src/stories/**/*.@(story|stories).@(ts|tsx|js|jsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-viewport',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  core: {
    builder: '@storybook/builder-vite',
  },
  /**
   * In preparation for the vite build plugin, add the needed config here.
   * @param config {import('vite').UserConfig}
   */
  async viteFinal(config) {
    // The build fails to correctly minify the `ansi-to-html` module with esbuild, so we fallback to Terser.
    // It's a package used by "Storybook" for the Webpreview, so it's interesting why it fails.
    config.build.minify = 'terser';

    if (config.optimizeDeps) {
      config.optimizeDeps.include = [
        ...config.optimizeDeps.include,
        '@storybook/react/dist/esm/client/docs/config',
        '@storybook/react/dist/esm/client/preview/config',
        '@storybook/addon-docs/preview.js',
        '@storybook/addon-actions/preview.js',
        '@storybook/theming',
        'intersection-observer',
      ];
    }
    return config;
  },
};
