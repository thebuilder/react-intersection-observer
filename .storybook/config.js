import React from 'react'
import { addDecorator, configure } from '@storybook/react'
import { withOptions } from '@storybook/addon-options'
import { themes } from '@storybook/components'
import pck from '../package.json'
import 'intersection-observer'
import './base.css'

addDecorator(
  withOptions({
    name: pck.name,
    url: pck.repository ? pck.repository.url : null,
    theme: themes.dark,
  }),
)

/**
 * Use require.context to load dynamically: https://webpack.github.io/docs/context.html
 */
const req = require.context('../stories', true, /story\.tsx$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
