import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import { create } from '@storybook/theming';
import 'intersection-observer';
import { Global } from '@emotion/react';

addParameters({
  options: {
    theme: create({
      base: 'dark',
      brandTitle: 'react-intersection-observer',
      brandUrl: 'https://github.com/thebuilder/react-intersection-observer',
    }),
    isFullscreen: false,
    panelPosition: 'bottom',
  },
});

addDecorator((storyFn) => (
  <>
    <Global
      styles={{
        'html, body': {
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
          padding: 0,
          margin: 0,
          color: '#0c0c0c',
          fontSize: '16px',
        },
      }}
    />
    {storyFn()}
  </>
));
