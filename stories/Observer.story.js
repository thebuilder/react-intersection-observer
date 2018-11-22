// @flow
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Observer, { useInView } from '../src/index'
import ScrollWrapper from './ScrollWrapper'
import RootComponent from './Root'
import type { IntersectionOptions } from '../src'

type Props = {
  style?: Object,
  children?: React.Node,
}

// $FlowFixMe forwardRef is not known
const Header = React.forwardRef((props: Props, ref) => (
  <div
    ref={ref}
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
    <h2>{props.children}</h2>
  </div>
))

const HookComponent = (options: IntersectionOptions) => {
  // $FlowFixMe
  const ref = React.useRef()
  const inView = useInView(ref, options)
  return <Header ref={ref}>Header inside viewport: {inView.toString()}</Header>
}

storiesOf('Intersection Observer', module)
  .add('Basic', () => (
    <ScrollWrapper>
      <Observer onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>Header inside viewport: {inView.toString()}</Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('Plain children', () => (
    <ScrollWrapper>
      <Observer onChange={action('Child Observer inview')}>
        <Header>Plain children</Header>
      </Observer>
    </ScrollWrapper>
  ))
  .add('Taller then viewport', () => (
    <ScrollWrapper>
      <Observer onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref} style={{ height: '150vh' }}>
            Header is inside the viewport: {inView.toString()}
          </Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With threshold 100%', () => (
    <ScrollWrapper>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With threshold 50%', () => (
    <ScrollWrapper>
      <Observer threshold={0.5} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header is 50% inside the viewport: {inView.toString()}
          </Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('Taller then viewport with threshold 100%', () => (
    <ScrollWrapper>
      <Observer threshold={1}>
        {({ inView, ref }) => (
          <Header ref={ref} style={{ height: '150vh' }}>
            Header is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With threshold array', () => (
    <ScrollWrapper>
      <Observer
        threshold={[0, 0.25, 0.5, 0.75, 1]}
        onChange={action('Hit threshold trigger')}
      >
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header is inside threshold: {inView.toString()} - onChange triggers
            multiple times.
          </Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('With root', () => (
    <RootComponent>
      {node => (
        <ScrollWrapper>
          <Observer
            threshold={0}
            root={node}
            rootMargin="64px"
            rootId="window1"
            onChange={action('Child Observer inview')}
          >
            {({ inView, ref }) => (
              <Header ref={ref}>
                Header is inside the root viewport: {inView.toString()}
              </Header>
            )}
          </Observer>
        </ScrollWrapper>
      )}
    </RootComponent>
  ))
  .add('With root and rootMargin', () => (
    <RootComponent style={{ padding: 64 }}>
      {node => (
        <ScrollWrapper>
          <Observer
            threshold={0}
            root={node}
            rootMargin="64px"
            rootId="window2"
            onChange={action('Child Observer inview')}
          >
            {({ inView, ref }) => (
              <Header ref={ref}>
                Header is inside the root viewport: {inView.toString()}
              </Header>
            )}
          </Observer>
        </ScrollWrapper>
      )}
    </RootComponent>
  ))
  .add('Trigger once', () => (
    <ScrollWrapper>
      <Observer
        threshold={1}
        triggerOnce
        onChange={action('Child Observer inview')}
      >
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header was fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
  .add('Multiple observers', () => (
    <ScrollWrapper>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header 1 is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </Observer>
      <Observer threshold={1} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header 2 is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </Observer>
    </ScrollWrapper>
  ))
