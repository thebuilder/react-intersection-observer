import React from 'react'
import { addParameters, configure } from '@storybook/react'
import { create } from '@storybook/theming'
import 'intersection-observer'
import './base.css'
import pck from '../package'

addParameters({
  options: {
    theme: create({
      base: 'dark',
      brandTitle: pck.name,
      brandUrl: pck.repository.url,
    }),
    isFullscreen: false,
    panelPosition: 'bottom',
  },
})

/**
 * Use require.context to load dynamically: https://webpack.github.io/docs/context.html
 */
const req = require.context('../stories', true, /story\.tsx$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
