import React from 'react';
import { addParameters } from '@storybook/react';
import { create } from '@storybook/theming';
import 'intersection-observer';
import './styles.css';

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
