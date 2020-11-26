module.exports = {
  stories: ['../src/stories/**/*.@(story|stories).@(ts|tsx|js|jsx|mdx)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    'storybook-dark-mode/register',
  ],
  reactOptions: {
    fastRefresh: true,
    strictMode: true,
  },
};
