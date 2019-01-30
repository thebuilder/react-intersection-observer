import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { useInView, IntersectionOptions } from '../src/index'
import ScrollWrapper from './ScrollWrapper/index'

type Props = {
  style?: Object
  children?: React.ReactNode
  options?: IntersectionOptions
}

const HookComponent = ({ options, style, children, ...rest }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, options)
  action('Inview')(inView)

  return (
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
        ...style,
      }}
      {...rest}
    >
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
