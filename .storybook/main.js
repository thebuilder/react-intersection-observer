module.exports = {
  stories: ['../src/stories/**/*.@(story|stories).@(ts|tsx|js|jsx|mdx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-viewport'],
  reactOptions: {
    fastRefresh: true,
    strictMode: true,
  },
};
