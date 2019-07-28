/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import { observe, unobserve } from './intersection'
import { InViewHookResponse, IntersectionOptions } from './index'

export function useInView(
  options: IntersectionOptions = {},
): InViewHookResponse {
  const ref = React.useRef<Element>()
  const entryRef = React.useRef<IntersectionObserverEntry>()
  const [inView, setInView] = React.useState<boolean>(false)

  const setRef = React.useCallback(
    node => {
      if (ref.current) {
        unobserve(ref.current)
      }
      if (node) {
        observe(
          node,
          (inView, intersection) => {
            setInView(inView)
            entryRef.current = intersection

            if (inView && options.triggerOnce) {
              // If it should only trigger once, unobserve the element after it's inView
              unobserve(node)
            }
          },
          options,
        )
      }

      // Store a reference to the node
      ref.current = node
    },
    [options.threshold, options.root, options.rootMargin, options.triggerOnce],
  )

  React.useDebugValue(inView)

  return [setRef, inView, entryRef.current]
}
