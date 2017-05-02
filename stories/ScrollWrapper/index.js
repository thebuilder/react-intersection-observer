import React from 'react'
import PropTypes from 'prop-types'

const style = {
  height: '101vh',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'papayawhip',
}

/**
 * ScrollWrapper directs the user to scroll the page to reveal it's children.
 * Use this on Modules that have scroll and/or observer triggers.
 */
function ScrollWrapper({ children, ...props }) {
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

ScrollWrapper.propTypes = {
  children: PropTypes.node,
}

export default ScrollWrapper
