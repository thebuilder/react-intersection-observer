/* eslint-disable react/prop-types */
import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Observer from '../src/index'
import ScrollWrapper from './ScrollWrapper'

const Header = props =>
  <div
    style={{
      display: 'flex',
      minHeight: '25vh',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      background: 'lightcoral',
      color: 'azure',
      ...props.style,
    }}
  >
    <h2>
      {props.children}
    </h2>
  </div>

storiesOf('Intersection Observer', module)
  .add('Child as function', () =>
    <ScrollWrapper>
      <Observer onChange={action('Child Observer inview')}>
        {inView => <Header>{`Header inside viewport: ${inView}`}</Header>}
      </Observer>
    </ScrollWrapper>,
  )
  .add('With threshold 100%', () =>
    <ScrollWrapper>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {inView =>
          <Header>{`Header is fully inside the viewport: ${inView}`}</Header>}
      </Observer>
    </ScrollWrapper>,
  )
  .add('With threshold 50%', () =>
    <ScrollWrapper>
      <Observer threshold={0.5} onChange={action('Child Observer inview')}>
        {inView =>
          <Header>{`Header is 50% inside the viewport: ${inView}`}</Header>}
      </Observer>
    </ScrollWrapper>,
  )
  .add('With threshold array', () =>
    <ScrollWrapper>
      <Observer
        threshold={[0, 0.25, 0.5, 0.75, 1]}
        onChange={action('Hit threshold trigger')}
      >
        {inView =>
          <Header
          >{`Header is inside threshold: ${inView} - onChange triggers multiple times.`}</Header>}
      </Observer>
    </ScrollWrapper>,
  )
  .add('With rootMargin', () =>
    <ScrollWrapper>
      <Observer
        threshold={0}
        rootMargin="100px"
        onChange={action('Child Observer inview')}
      >
        {inView =>
          <Header>{`Header is fully inside the viewport: ${inView}`}</Header>}
      </Observer>
    </ScrollWrapper>,
  )
  .add('Trigger once', () =>
    <ScrollWrapper>
      <Observer
        threshold={1}
        triggerOnce
        onChange={action('Child Observer inview')}
      >
        {inView =>
          <Header>{`Header was fully inside the viewport: ${inView}`}</Header>}
      </Observer>
    </ScrollWrapper>,
  )
  .add('Multiple observers', () =>
    <ScrollWrapper>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {inView =>
          <Header>{`Header 1 is fully inside the viewport: ${inView}`}</Header>}
      </Observer>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {inView =>
          <Header>{`Header 2 is fully inside the viewport: ${inView}`}</Header>}
      </Observer>
    </ScrollWrapper>,
  )
  .add('Render method', () =>
    <ScrollWrapper>
      <Observer
        style={{ height: 200, position: 'relative' }}
        onChange={action('Render Observer inview')}
        render={() =>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Header style={{ minHeight: 0, height: '100%' }}>
              Header is only rendered once observer is in view. Make sure that
              the Observer controls the height, so it does not change.
            </Header>
          </div>}
      />
    </ScrollWrapper>,
  )
  .add('Plain child', () =>
    <ScrollWrapper>
      <Observer onChange={action('Plain Observer inview')}>
        <Header>
          Plain children are always rendered. Use onChange to monitor state.
        </Header>
      </Observer>
    </ScrollWrapper>,
  )
