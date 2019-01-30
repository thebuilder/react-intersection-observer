import React, { useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { Trail, config } from 'react-spring'

const LazyAnimation = () => {
  const ref = useRef(null)
  const inView = useInView(ref, {
    threshold: 0.5,
  })

  const items = 'Im inside the viewport!'
    .split('')
    .map((text, index) => ({ key: index, text }))

  return (
    <div ref={ref} style={{ overflow: 'hidden', fontSize: '3rem' }}>
      <Trail
        items={items}
        keys={item => item.key}
        config={config.stiff}
        reset={!inView}
        to={
          inView
            ? {
                transform: 'translate3d(0,0px,0)',
                opacity: 1,
              }
            : {
                transform: 'translate3d(0,40px,0)',
                opacity: 0,
              }
        }
      >
        {item => props => (
          <span
            style={{
              ...props,
              display: item.text !== ' ' ? 'inline-block' : null,
            }}
          >
            {item.text}
          </span>
        )}
      </Trail>
    </div>
  )
}

export default LazyAnimation
