import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { useInView } from '../src/index'
import ScrollWrapper from './ScrollWrapper/index'
import { CSSProperties } from 'react'
import { IntersectionOptions } from '../src/typings/types'

type Props = {
  style?: Object
  children?: React.ReactNode
  options?: IntersectionOptions
}

const sharedStyle: CSSProperties = {
  display: 'flex',
  minHeight: '25vh',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  background: '#148bb4',
  color: 'azure',
}

const LazyHookComponent = ({ options, style, children, ...rest }: Props) => {
  const [ref, inView, entry] = useInView(options)
  const [isLoading, setIsLoading] = React.useState(true)
  action('Inview')(inView, entry)

  React.useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div ref={ref} style={{ ...sharedStyle, ...style }} {...rest}>
      <h2>
        {children || 'Header is inside the viewport'}: {inView.toString()}
      </h2>
    </div>
  )
}
const HookComponent = ({ options, style, children, ...rest }: Props) => {
  const [ref, inView, entry] = useInView(options)
  action('Inview')(inView, entry)

  return (
    <div ref={ref} style={{ ...sharedStyle, ...style }} {...rest}>
      <h2>
        {children || 'Header is inside the viewport'}: {inView.toString()}
      </h2>
    </div>
  )
}

storiesOf('useInView hook', module)
  .add('Basic', () => (
    <ScrollWrapper>
      <HookComponent />
    </ScrollWrapper>
  ))
  .add('Lazy Hook rendering', () => (
    <ScrollWrapper>
      <LazyHookComponent />
    </ScrollWrapper>
  ))
  .add('Start in view', () => <HookComponent />)
  .add('Taller then viewport', () => (
    <ScrollWrapper>
      <HookComponent style={{ height: '150vh' }} />
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
      <HookComponent options={{ threshold: 1 }} style={{ height: '150vh' }}>
        Header is fully inside the viewport
      </HookComponent>
    </ScrollWrapper>
  ))
