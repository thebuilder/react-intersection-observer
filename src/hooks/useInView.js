// @flow
import * as React from 'react'
import { observe, unobserve } from '../intersection'
import type { IntersectionOptions } from '../index'

export function useInView(
  ref: React.ElementRef<*>,
  options: IntersectionOptions = {},
) {
  // $FlowFixMe - useState is not exposed in React Flow lib yet
  const [isInView, setInView] = React.useState(false)

  // $FlowFixMe - useEffect is not exposed in React Flow lib yet
  React.useEffect(
    () => {
      if (ref.current) {
        observe(
          ref.current,
          inView => {
            setInView(inView)
            if (inView && options.triggerOnce) {
              // If it should only trigger once, unobserve the element after it's inView
              unobserve(ref.current)
            }
          },
          {
            threshold: options.threshold,
            root: options.root,
            rootMargin: options.rootMargin,
          },
          options.rootId,
        )
      }

      return () => {
        unobserve(ref.current)
      }
    },
    [options.threshold, options.root, options.rootMargin, options.rootId],
  )

  return isInView
}
