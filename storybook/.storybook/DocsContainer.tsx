import React from 'react';
import {
  DocsContainer as BaseContainer,
  DocsContextProps,
} from '@storybook/addon-docs';
import { useDarkMode } from 'storybook-dark-mode';
import { themes } from '@storybook/theming';

export const DocsContainer = ({
  children,
  context,
}: {
  children: React.ReactNode;
  context: DocsContextProps;
}) => {
  const isDark = useDarkMode();

  return (
    <BaseContainer
      theme={isDark ? themes.dark : themes.light}
      context={context}
    >
      {children}
    </BaseContainer>
  );
};
