import { DocsContainer as BaseContainer } from '@storybook/addon-docs';
import { useDarkMode } from 'storybook-dark-mode';
import { themes } from '@storybook/theming';

export const DocsContainer = ({ children, context }) => {
  const dark = useDarkMode();
  console.log(dark);
  return (
    <BaseContainer theme={dark ? themes.dark : themes.light} context={context}>
      {children}
    </BaseContainer>
  );
};
