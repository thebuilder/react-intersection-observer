/** @jsx jsx */
import { jsx } from '@emotion/react'
import { action } from '@storybook/addon-actions'
import { IntersectionOptions, useInView } from '../index'
import ScrollWrapper from './ScrollWrapper'
import Status from './Status'
import { motion } from 'framer-motion'
import React from 'react'

type Props = {
  className?: string
  children?: React.ReactNode
  options?: IntersectionOptions
  lazy?: boolean
}

const HookComponent = ({
  options,
  className,
  children,
  lazy,
  ...rest
}: Props) => {
  const [ref, inView, entry] = useInView(options)
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

export default {
  title: 'useInView hook',
}

export const basic = () => (
  <ScrollWrapper>
    <HookComponent />
  </ScrollWrapper>
)

export const lazyHookRendering = () => (
  <ScrollWrapper>
    <HookComponent lazy />
  </ScrollWrapper>
)

export const startInView = () => <HookComponent />

export const tallerThanViewport = () => (
  <ScrollWrapper>
    <HookComponent css={{ height: '150vh' }} />
  </ScrollWrapper>
)

export const withThreshold100percentage = () => (
  <ScrollWrapper>
    <HookComponent options={{ threshold: 1 }}>
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
)
export const withThreshold50percentage = () => (
  <ScrollWrapper>
    <HookComponent options={{ threshold: 0.5 }}>
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
)

export const tallerThanViewportWithThreshold100percentage = () => (
  <ScrollWrapper>
    <HookComponent options={{ threshold: 1 }} css={{ height: '150vh' }}>
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
)

export const multipleThresholds = () => (
  <ScrollWrapper>
    <HookComponent
      options={{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      css={{ height: '150vh' }}
    >
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
)

export const triggerOnce = () => (
  <ScrollWrapper>
    <HookComponent options={{ triggerOnce: true }} />
  </ScrollWrapper>
)
