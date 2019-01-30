import React, { useRef } from 'react'
import { useInView } from 'react-intersection-observer'

const LazyImage = ({ width, height, src, ...rest }) => {
  const ref = useRef(null)
  const inView = useInView(ref, {
    triggerOnce: true,
    threshold: 1,
  })

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        paddingBottom: `${(height / width) * 100}%`,
        background: '#2a4b7a',
      }}
    >
      {inView ? (
        <img
          {...rest}
          src={src}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      ) : null}
    </div>
  )
}

export default LazyImage
