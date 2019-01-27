import React, { useRef } from 'react'
import * as ReactDOM from 'react-dom'
import { useInView } from '../hooks'
import { mount } from 'enzyme'
import { observe, unobserve } from '../intersection'

jest.mock('../intersection')

const triggerHook = () => ReactDOM.render(null, document.createElement('div'))
afterEach(() => {
  observe.mockReset()
})

const HookComponent = ({ options }) => {
  const ref = useRef()
  const inView = useInView(ref, options)
  return <div ref={ref}>{inView.toString()}</div>
}

test('should create a hook', () => {
  mount(<HookComponent />)
  triggerHook()
  expect(observe).toHaveBeenCalled()
})

test('should create a hook inView', () => {
  const hook = mount(<HookComponent />)
  observe.mockImplementation((el, callback, options) => {
    if (callback) callback(true, {})
  })
  triggerHook()
  expect(observe).toHaveBeenCalled()
  expect(hook.text()).toBe('true')
})

test('should respect trigger once', cb => {
  mount(<HookComponent options={{ triggerOnce: true }} />)
  observe.mockImplementation((el, callback) => {
    if (callback) callback(true, {})
  })
  triggerHook()
  expect(observe).toHaveBeenCalled()
  setTimeout(() => {
    // The next render phase should have triggered the unmount of the observer
    triggerHook()
    expect(unobserve).toHaveBeenCalled()
    cb()
  })
})

test('should unmount the hook', () => {
  const instance = mount(<HookComponent />)
  triggerHook()
  instance.unmount()
  expect(unobserve).toHaveBeenCalled()
})
