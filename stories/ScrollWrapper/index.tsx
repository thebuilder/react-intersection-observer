import * as React from 'react'
import { CSSProperties } from 'react'

const style: CSSProperties = {
  height: '101vh',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'papayawhip',
}

type Props = {
  children: React.ReactNode
}

/**
 * ScrollWrapper directs the user to scroll the page to reveal it's children.
 * Use this on Modules that have scroll and/or observer triggers.
 */
function ScrollWrapper({ children, ...props }: Props) {
  return (
    <div {...props}>
      <section style={{ ...style }}>
        <h1>⬇ Scroll Down ⬇</h1>
      </section>
      {children}
      <section style={{ ...style }}>
        <h1>⬆︎ Scroll up ⬆︎</h1>
      </section>
    </div>
  )
}

export default ScrollWrapper
