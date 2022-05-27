import 'intersection-observer';
import 'tailwindcss/tailwind.css';
import { themes } from '@storybook/theming';
import { ignoreErrorMessages } from './utils/ignore-errors';

export const parameters = {
  docs: {
    theme: themes.dark,
  },
  controls: {
    expanded: true,
  },
};

if (process.env.NODE_ENV !== 'test') {
  ignoreErrorMessages();
}
