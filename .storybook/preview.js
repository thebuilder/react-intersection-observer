import 'intersection-observer';
import 'tailwindcss/tailwind.css';
import { themes } from '@storybook/theming';

export const parameters = {
  docs: {
    theme: themes.dark,
  },
  controls: {
    expanded: true,
  },
};
