import 'intersection-observer';
import 'tailwindcss/tailwind.css';
import { themes } from '@storybook/theming';
import { DocsContainer } from './DocsContainer';

export const parameters = {
  controls: {
    expanded: true,
  },
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark },
    // Override the default light theme
    light: { ...themes.normal },
  },
  docs: {
    container: DocsContainer,
  },
};
