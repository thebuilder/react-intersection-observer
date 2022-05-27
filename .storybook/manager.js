import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import { themeOptions } from './theme';
import { ignoreErrorMessages } from './utils/ignore-errors';

addons.setConfig({
  theme: {
    ...themes.dark,
    ...themeOptions,
  },
});

ignoreErrorMessages();
