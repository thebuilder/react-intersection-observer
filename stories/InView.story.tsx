import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import InView from '../src/index'
import ScrollWrapper from './ScrollWrapper/index'
import RootComponent from './Root/index'
import { CSSProperties } from 'react'

type Props = {
  style?: CSSProperties
  children?: React.ReactNode
}

const Header = React.forwardRef<any, Props>((props: Props, ref) => (
  <div
    /* @ts-ignore */
    ref={ref}
    style={{
      display: 'flex',
      minHeight: '25vh',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      background: '#148bb4',
      color: 'azure',
      ...props.style,
    }}
  >
    <h2>{props.children}</h2>
  </div>
))

storiesOf('Intersection Observer', module)
  .add('Basic', () => (
    <ScrollWrapper>
      <InView onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>Header inside viewport: {inView.toString()}</Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('Start in view', () => (
    <InView onChange={action('Child Observer inview')}>
      {({ inView, ref }) => (
        <Header ref={ref}>Header inside viewport: {inView.toString()}</Header>
      )}
    </InView>
  ))
  .add('Plain children', () => (
    <ScrollWrapper>
      <InView
        onChange={action('Child Observer inview')}
        className="custom-class"
        as="div"
      >
        <Header>Plain children</Header>
      </InView>
    </ScrollWrapper>
  ))
  .add('Taller then viewport', () => (
    <ScrollWrapper>
      <InView onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref} style={{ height: '150vh' }}>
            Header is inside the viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('With threshold 100%', () => (
    <ScrollWrapper>
      <InView threshold={1} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('With threshold 50%', () => (
    <ScrollWrapper>
      <InView threshold={0.5} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header is 50% inside the viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('Taller then viewport with threshold 100%', () => (
    <ScrollWrapper>
      <InView threshold={1}>
        {({ inView, ref }) => (
          <Header ref={ref} style={{ height: '150vh' }}>
            Header is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('With threshold array', () => (
    <ScrollWrapper>
      <InView
        threshold={[0, 0.25, 0.5, 0.75, 1]}
        onChange={action('Hit threshold trigger')}
      >
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header is inside threshold: {inView.toString()} - onChange triggers
            multiple times.
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('With root', () => (
    <RootComponent>
      {node => (
        <ScrollWrapper>
          <InView
            threshold={0}
            root={node}
            rootMargin="64px"
            onChange={action('Child Observer inview')}
          >
            {({ inView, ref }) => (
              <Header ref={ref}>
                Header is inside the root viewport: {inView.toString()}
              </Header>
            )}
          </InView>
        </ScrollWrapper>
      )}
    </RootComponent>
  ))
  .add('With root and rootMargin', () => (
    <RootComponent style={{ padding: 64 }}>
      {node => (
        <ScrollWrapper>
          <InView
            threshold={0}
            root={node}
            rootMargin="64px"
            onChange={action('Child Observer inview')}
          >
            {({ inView, ref }) => (
              <Header ref={ref}>
                Header is inside the root viewport: {inView.toString()}
              </Header>
            )}
          </InView>
        </ScrollWrapper>
      )}
    </RootComponent>
  ))
  .add('Trigger once', () => (
    <ScrollWrapper>
      <InView
        threshold={1}
        triggerOnce
        onChange={action('Child Observer inview')}
      >
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header was fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('Multiple observers', () => (
    <ScrollWrapper>
      <InView threshold={1} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header 1 is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </InView>
      <InView threshold={1} onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref}>
            Header 2 is fully inside the viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
