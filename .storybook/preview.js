import 'intersection-observer';
import 'tailwindcss/tailwind.css';
import { themes } from '@storybook/theming';
import { themeOptions } from './theme';

export const parameters = {
  darkMode: {
    current: 'dark',
    // Override the default dark theme
    dark: { ...themes.dark, ...themeOptions },
    // Override the default light theme
    light: { ...themes.normal, ...themeOptions },
  },
  docs: {
    theme: themes.dark,
  },
  controls: {
    expanded: true,
  },
};
