/** @jsx jsx */
import { jsx } from '@emotion/react'
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import InView from '../index'
import ScrollWrapper from './ScrollWrapper'
import RootComponent from './Root'
import Status from './Status'
import { motion } from 'framer-motion'

type Props = {
  className?: string
  children?: React.ReactNode
  inView?: boolean
}

const Header = React.forwardRef<any, Props>((props: Props, ref) => (
  <div ref={ref} data-inview={props.inView}>
    {props.inView !== undefined ? <Status inView={props.inView} /> : null}
    <motion.div
      animate={{ opacity: props.inView ? 1 : 0.5 }}
      className={props.className}
      css={{
        display: 'flex',
        minHeight: '25vh',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        background: '#148bb4',
        color: 'azure',
      }}
    >
      <h2>{props.children}</h2>
    </motion.div>
  </div>
))

storiesOf('InView Component', module)
  .add('Basic', () => (
    <ScrollWrapper>
      <InView onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref} inView={inView}>
            Header inside viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('With root margin', () => (
    <ScrollWrapper>
      <InView rootMargin="150px" onChange={action('Child Observer inview')}>
        {({ inView, ref }) => (
          <Header ref={ref} inView={inView}>
            Header inside viewport: {inView.toString()}
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('Start in view', () => (
    <InView onChange={action('Child Observer inview')}>
      {({ inView, ref }) => (
        <Header ref={ref} inView={inView}>
          Header inside viewport: {inView.toString()}
        </Header>
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
          <Header ref={ref} css={{ height: '150vh' }}>
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
          <Header ref={ref} inView={inView}>
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
          <Header ref={ref} inView={inView}>
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
          <Header ref={ref} inView={inView} css={{ height: '150vh' }}>
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
          <Header ref={ref} inView={inView}>
            Header is inside threshold: {inView.toString()} - onChange triggers
            multiple times.
          </Header>
        )}
      </InView>
    </ScrollWrapper>
  ))
  .add('With root', () => (
    <RootComponent>
      {(node) => (
        <ScrollWrapper>
          <InView
            threshold={0}
            root={node}
            onChange={action('Child Observer inview')}
          >
            {({ inView, ref }) => (
              <Header ref={ref} inView={inView}>
                Header is inside the root viewport: {inView.toString()}
              </Header>
            )}
          </InView>
        </ScrollWrapper>
      )}
    </RootComponent>
  ))
  .add('With root and rootMargin', () => (
    <RootComponent>
      {(node) => (
        <ScrollWrapper>
          <InView
            threshold={0}
            root={node}
            rootMargin="100px"
            onChange={action('Child Observer inview')}
          >
            {({ inView, ref }) => (
              <Header ref={ref} inView={inView}>
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
          <Header ref={ref} inView={inView}>
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
