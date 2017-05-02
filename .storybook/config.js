import React from 'react'
import { configure } from '@kadira/storybook'
import './base.css'

/**
 * Use require.context to load dynamically: https://webpack.github.io/docs/context.html
 */
const req = require.context('../stories', true, /story\.js$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
