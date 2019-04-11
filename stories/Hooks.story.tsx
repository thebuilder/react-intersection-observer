import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { useInView } from '../src/index'
import ScrollWrapper from './ScrollWrapper/index'
import { CSSProperties } from 'react'
import { IntersectionOptions } from '../src/typings/types'
import { withKnobs, number, boolean } from '@storybook/addon-knobs'
import Status from './Status'

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

const LazyHookComponent = ({ options, style, children, ...rest }: Props) => {
  const [ref, inView, entry] = useInView(getOptions(options))
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
      <Status inView={inView} />
      <h2>
        {children || 'Header is inside the viewport'}: {inView.toString()}
      </h2>
    </div>
  )
}
const HookComponent = ({ options, style, children, ...rest }: Props) => {
  const [ref, inView, entry] = useInView(getOptions(options))
  action('Inview')(inView, entry)

  return (
    <div ref={ref} style={{ ...sharedStyle, ...style }} {...rest}>
      <Status inView={inView} />
      <h2>
        {children || 'Header is inside the viewport'}: {inView.toString()}
      </h2>
    </div>
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
