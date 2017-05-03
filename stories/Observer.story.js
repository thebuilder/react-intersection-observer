/* eslint-disable react/prop-types */
import React from 'react'
import { storiesOf, action } from '@kadira/storybook'
import Observer from '../src/index'
import ScrollWrapper from './ScrollWrapper'

const Header = props => (
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
    }}
  >
    <h2>{props.children}</h2>
  </div>
)

storiesOf('Intersection Observer', module)
  .add('Child as function', () => (
    <ScrollWrapper>
      <Observer onChange={action('Child Observer inview')}>
        {inView => <Header>{`Header inside viewport: ${inView}`}</Header>}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With threshold 100%', () => (
    <ScrollWrapper>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {inView => (
          <Header>{`Header is fully inside the viewport: ${inView}`}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('Render method', () => (
    <ScrollWrapper>
      <Observer
        style={{ height: 200, position: 'relative' }}
        onChange={action('Render Observer inview')}
        render={() => (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
            }}
          >
            <Header>
              Header is only rendered once observer is in view. Make sure that the Observer controls the height, so it does not change.
            </Header>
          </div>
        )}
      />
    </ScrollWrapper>
  ))
  .add('Plain child', () => (
    <ScrollWrapper>
      <Observer onChange={action('Plain Observer inview')}>
        <Header>
          Plain children are always rendered. Use onChange to monitor state.
        </Header>
      </Observer>
    </ScrollWrapper>
  ))
