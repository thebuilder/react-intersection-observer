/** @jsx jsx */
import { jsx } from '@emotion/react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { IntersectionOptions, useInView } from '../index'
import ScrollWrapper from './ScrollWrapper'
import { withKnobs, number, boolean } from '@storybook/addon-knobs'
import Status from './Status'
import { motion } from 'framer-motion'
import React from 'react'

type Props = {
  className?: string
  children?: React.ReactNode
  options?: IntersectionOptions
  lazy?: boolean
}

function getOptions(
  options: IntersectionOptions = { threshold: 0, triggerOnce: false },
) {
  const { threshold, triggerOnce } = options
  return {
    ...options,
    threshold:
      options && Array.isArray(threshold)
        ? threshold
        : number('Threshold', (threshold as number) || 0, {
            range: true,
            min: 0,
            max: 1,
            step: 0.1,
          }),
    triggerOnce: boolean('Trigger once', triggerOnce || false),
  }
}

const HookComponent = ({
  options,
  className,
  children,
  lazy,
  ...rest
}: Props) => {
  const [ref, inView, entry] = useInView(getOptions(options))
  const [isLoading, setIsLoading] = React.useState(lazy)
  action('Inview')(inView, entry)

  React.useEffect(() => {
    if (isLoading) setIsLoading(false)
  }, [isLoading, lazy])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <React.Fragment>
      <Status inView={inView} />
      <motion.div
        ref={ref}
        animate={{ opacity: inView ? 1 : 0.5 }}
        data-inview={inView}
        className={className}
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
        {...rest}
      >
        <h2>
          {children || 'Inside the viewport'}: {inView.toString()}
        </h2>
      </motion.div>
    </React.Fragment>
  )
}

storiesOf('useInView hook', module)
  .addDecorator(withKnobs)

  .add('Basic', () => (
    <ScrollWrapper>
      <HookComponent />
    </ScrollWrapper>
  ))
  .add('Lazy Hook rendering', () => (
    <ScrollWrapper>
      <HookComponent lazy />
    </ScrollWrapper>
  ))
  .add('Start in view', () => <HookComponent />)
  .add('Taller then viewport', () => (
    <ScrollWrapper>
      <HookComponent css={{ height: '150vh' }} />
    </ScrollWrapper>
  ))
  .add('With threshold 100%', () => (
    <ScrollWrapper>
      <HookComponent options={{ threshold: 1 }}>
        Header is fully inside the viewport
      </HookComponent>
    </ScrollWrapper>
  ))
  .add('With threshold 50%', () => (
    <ScrollWrapper>
      <HookComponent options={{ threshold: 0.5 }}>
        Header is 50% inside the viewport
      </HookComponent>
    </ScrollWrapper>
  ))
  .add('Taller then viewport with threshold 100%', () => (
    <ScrollWrapper>
      <HookComponent options={{ threshold: 1 }} css={{ height: '150vh' }}>
        Header is fully inside the viewport
      </HookComponent>
    </ScrollWrapper>
  ))
  .add('Multiple thresholds', () => (
    <ScrollWrapper>
      <HookComponent
        options={{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
        css={{ height: '150vh' }}
      >
        Header is fully inside the viewport
      </HookComponent>
    </ScrollWrapper>
  ))
  .add('Trigger once', () => (
    <ScrollWrapper>
      <HookComponent options={{ triggerOnce: true }} />
    </ScrollWrapper>
  ))
