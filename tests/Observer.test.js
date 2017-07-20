import React from 'react'
import { shallow } from 'enzyme'
import Observer from '../src/index.js'

jest.mock('../src/intersection')

it('Should render <Observer />', () => {
  const callback = jest.fn()
  shallow(
    <Observer>
      {callback}
    </Observer>,
  )
  expect(callback).toHaveBeenCalledWith(false)
})

it('Should render <Observer /> inview', () => {
  const callback = jest.fn()
  const wrapper = shallow(
    <Observer>
      {callback}
    </Observer>,
  )
  wrapper.setState({ inView: true })
  expect(callback).toHaveBeenLastCalledWith(true)
})

it('Should render <Observer /> with children outside view', () => {
  const wrapper = shallow(
    <Observer className="observer">
      <div>Content</div>
    </Observer>,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should render <Observer /> with children inview', () => {
  const wrapper = shallow(
    <Observer className="observer">
      <div>Content</div>
    </Observer>,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should not render <Observer /> render outside view', () => {
  const wrapper = shallow(
    <Observer className="observer" render={() => <div>Render method</div>} />,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should render <Observer /> render when in view', () => {
  const wrapper = shallow(
    <Observer className="observer" render={() => <div>Render method</div>} />,
  )
  wrapper.setState({ inView: true })

  expect(wrapper).toMatchSnapshot()
})
