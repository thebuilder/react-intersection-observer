/* eslint-disable import/no-named-as-default-member */
import React from 'react'
import { mount } from 'enzyme'
import Observer from '../src/index.js'
import intersection from '../src/intersection'
import invariant from 'invariant'

jest.mock('../src/intersection')
jest.mock('invariant')

afterEach(() => {})

it('Should render <Observer />', () => {
  const callback = jest.fn()
  mount(<Observer>{callback}</Observer>)
  expect(callback).toHaveBeenCalledWith(false)
})

it('Should render <Observer /> inview', () => {
  const callback = jest.fn()
  const wrapper = mount(<Observer>{callback}</Observer>)
  wrapper.setState({ inView: true })
  expect(callback).toHaveBeenLastCalledWith(true)
})

it('Should render <Observer /> with children outside view', () => {
  const wrapper = mount(
    <Observer className="observer">
      <div>Content</div>
    </Observer>,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should render <Observer /> with children inview', () => {
  const wrapper = mount(
    <Observer className="observer">
      <div>Content</div>
    </Observer>,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should not render <Observer /> render outside view', () => {
  const wrapper = mount(
    <Observer
      render={({ inView, ref }) => (
        <div ref={ref}>Inview: {inView.toString()}</div>
      )}
    />,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should render <Observer /> render when in view', () => {
  const wrapper = mount(
    <Observer
      render={({ inView, ref }) => (
        <div ref={ref}>Inview: {inView.toString()}</div>
      )}
    />,
  )
  wrapper.setState({ inView: true })

  expect(wrapper).toMatchSnapshot()
})

it('Should unobserve old node', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  const instance = wrapper.instance()
  jest.spyOn(instance, 'observeNode')
  const node = wrapper.getDOMNode()
  instance.handleNode(<div />)
  expect(intersection.unobserve).toHaveBeenCalledWith(node)
  expect(instance.observeNode).toHaveBeenCalled()
  expect(intersection.observe).toHaveBeenCalled()
})

it('Should ensure node exists before observering', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  const instance = wrapper.instance()
  intersection.observe.mockReset()
  instance.handleNode(null)
  expect(intersection.observe).not.toHaveBeenCalled()
})

it('Should ensure node exists before unmounting', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  const instance = wrapper.instance()
  instance.handleNode(null)

  intersection.unobserve.mockReset()
  instance.componentWillUnmount()
  expect(intersection.unobserve).not.toHaveBeenCalled()
})

it('Should update state onChange', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  wrapper.instance().handleChange(true)
  expect(wrapper.state().inView).toBe(true)
  wrapper.instance().handleChange(false)
  expect(wrapper.state().inView).toBe(false)
})

it('Should recreate observer when threshold change', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  const instance = wrapper.instance()
  jest.spyOn(instance, 'observeNode')

  // Changing threshold should cause the instance to be observed once more
  wrapper.setProps({ threshold: 0.5 })
  expect(intersection.unobserve).toHaveBeenCalledWith(wrapper.getDOMNode())
  expect(instance.observeNode).toHaveBeenCalled()
})

it('Should recreate observer when root change', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  const instance = wrapper.instance()
  jest.spyOn(instance, 'observeNode')

  // Changing threshold should cause the instance to be observed once more
  wrapper.setProps({ root: {} })
  expect(intersection.unobserve).toHaveBeenCalledWith(wrapper.getDOMNode())
  expect(instance.observeNode).toHaveBeenCalled()
})

it('Should recreate observer when rootMargin change', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  const instance = wrapper.instance()
  jest.spyOn(instance, 'observeNode')

  // Changing threshold should cause the instance to be observed once more
  wrapper.setProps({ rootMargin: '10px' })
  expect(intersection.unobserve).toHaveBeenCalledWith(wrapper.getDOMNode())
  expect(instance.observeNode).toHaveBeenCalled()
})

it('Should trigger onChange callback', () => {
  const onChange = jest.fn()
  const wrapper = mount(<Observer onChange={onChange}>Content</Observer>)
  wrapper.instance().handleChange(true)
  expect(onChange).toHaveBeenLastCalledWith(true)
  wrapper.instance().handleChange(false)
  expect(onChange).toHaveBeenLastCalledWith(false)
})

it('Should unobserve when triggerOnce comes into view', () => {
  const wrapper = mount(<Observer triggerOnce>Content</Observer>)
  wrapper.setState({ inView: true })
  const node = wrapper.getDOMNode()
  expect(intersection.unobserve).toHaveBeenCalledWith(node)
})

it('Should unobserve when unounted', () => {
  const wrapper = mount(<Observer>Content</Observer>)
  const node = wrapper.getDOMNode()
  wrapper.instance().componentWillUnmount()
  expect(intersection.unobserve).toHaveBeenCalledWith(node)
})

it('Should throw error when not passing ref', () => {
  invariant.mockReset()

  mount(
    <Observer
      render={({ inView, ref }) => <div>Inview: {inView.toString()}</div>}
    />,
  )
  expect(invariant).toHaveBeenLastCalledWith(
    null,
    'react-intersection-observer: No DOM node found. Make sure you forward "ref" to the root DOM element you want to observe, when using render prop.',
  )
})
