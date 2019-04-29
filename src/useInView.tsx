/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import { observe, unobserve } from './intersection'
import { InViewHookResponse, IntersectionOptions } from './index'

type State = {
  inView: boolean
  entry?: IntersectionObserverEntry
}

export function useInView(
  options: IntersectionOptions = {},
): InViewHookResponse {
  const [ref, setRef] = React.useState<Element | null | undefined>(null)
  const [state, setState] = React.useState<State>({
    inView: false,
    entry: undefined,
  })

  React.useEffect(
    () => {
      if (!ref) return
      observe(
        ref,
        (inView, intersection) => {
          setState({ inView, entry: intersection })

          if (inView && options.triggerOnce) {
            // If it should only trigger once, unobserve the element after it's inView
            unobserve(ref)
          }
        },
        options,
      )

      return () => {
        unobserve(ref)
      }
    },
    [
      // Only create a new Observer instance if the ref or any of the options have been changed.
      ref,
      options.threshold,
      options.root,
      options.rootMargin,
      options.triggerOnce,
    ],
  )

  React.useDebugValue(state.inView)

  return [setRef, state.inView, state.entry]
}
