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
  reactOptions: {
    fastRefresh: true,
    strictMode: true,
  },
};
