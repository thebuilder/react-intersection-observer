/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import { observe, unobserve } from './intersection'
import { InViewHookResponse, IntersectionOptions } from './index'
import { useEffect } from 'react'

type State = {
  inView: boolean
  entry?: IntersectionObserverEntry
}

const initialState: State = {
  inView: false,
  entry: undefined,
}

export function useInView(
  options: IntersectionOptions = {},
): InViewHookResponse {
  const ref = React.useRef<Element>()
  const previousOptions = React.useRef<IntersectionOptions>()
  const [state, setState] = React.useState<State>(initialState)

  const setRef = React.useCallback(
    (node) => {
      if (ref.current) {
        const prevOptions = previousOptions.current
        if (
          ref.current === node &&
          prevOptions &&
          prevOptions.triggerOnce === options.triggerOnce &&
          prevOptions.threshold === options.threshold &&
          prevOptions.rootMargin === options.rootMargin &&
          prevOptions.root === options.root
        ) {
          // Nothing changed - Most likely the component just tried to reassign the ref.
          // We can safely return early
          return
        }

        // Make sure we unobserve the current node, so we can create a new instance
        unobserve(ref.current)
      }

      if (node) {
        observe(
          node,
          (inView, intersection) => {
            setState({ inView, entry: intersection })

            if (inView && options.triggerOnce) {
              // If it should only trigger once, unobserve the element after it's inView
              unobserve(node)
            }
          },
          options,
        )
      }

      // Store a reference to the node, so we can unobserve it later
      ref.current = node
      previousOptions.current = options
    },
    [options.threshold, options.root, options.rootMargin, options.triggerOnce],
  )

  useEffect(() => {
    if (!ref.current && state !== initialState && !options.triggerOnce) {
      // If we don't have a ref, then reset the state (unless the hook is set to only `triggerOnce`)
      // This ensures we correctly reflect the current state - If you aren't observing anything, then nothing is inView
      setState(initialState)
    }
  })

  return [setRef, state.inView, state.entry]
}
