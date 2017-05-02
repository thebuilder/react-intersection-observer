import React from 'react'
import { storiesOf, action } from '@kadira/storybook'
import Observer from '../src/Observer'
import ScrollWrapper from './ScrollWrapper'

storiesOf('Intersection Observer', module)
  .add('Child as function', () => (
    <ScrollWrapper>
      <Observer onChange={action('Child Observer inview')}>
        {inView => <h2>{`Header inside viewport ${inView}.`}</h2>}
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
            <h2>
              Header is only rendered once observer is in view. Make sure that the Observer controls the height, so it does not change change.
            </h2>
          </div>
        )}
      />
    </ScrollWrapper>
  ))
  .add('Plain child', () => (
    <ScrollWrapper>
      <Observer onChange={action('Plain Observer inview')}>
        <h2>
          Plain children are always rendered. Use onChange to monitor state.
        </h2>
      </Observer>
    </ScrollWrapper>
  ))
