const path = require('path');
const postcssConfig = require('../postcss.config');

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
    'storybook-dark-mode/register',
  ],
  core: {
    builder: 'webpack5',
  },
  babel: async (options) => ({
    ...options,
  }),
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              ...postcssConfig,
            },
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    });

    return config;
  },
};
