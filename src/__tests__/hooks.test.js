import React, { useRef } from 'react'
import * as ReactDOM from 'react-dom'
import { useInView } from '../hooks/useInView'
import { mount } from 'enzyme'
import { observe, unobserve } from '../intersection'

jest.mock('../intersection')

const HookComponent = ({ options, children }) => {
  const ref = useRef()
  useInView(ref, options)
  return <div ref={ref}>{children || 'Inner'}</div>
}

test('should create a hook', () => {
  mount(<HookComponent />)

  // Trigger a hook update
  ReactDOM.render(null, document.createElement('div'))

  expect(observe).toHaveBeenCalled()
})

test('should unmount the hook', () => {
  const instance = mount(<HookComponent />)
  // Trigger a hook update
  ReactDOM.render(null, document.createElement('div'))

  instance.unmount()
  expect(unobserve).toHaveBeenCalled()
})
