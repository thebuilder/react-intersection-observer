module.exports = {
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
    builder: 'webpack5',
  },
};
