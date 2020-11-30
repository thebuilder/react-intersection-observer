import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import { themeOptions } from './theme';

addons.setConfig({
  theme: {
    ...themes.dark,
    ...themeOptions,
  },
});
