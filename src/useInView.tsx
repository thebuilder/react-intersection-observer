/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import { InViewHookResponse, IntersectionOptions } from './index'
import { useEffect } from 'react'
import { newObserve } from './observers'

export function useInView(
  options: IntersectionOptions = {},
): InViewHookResponse {
  const unobserve = React.useRef<Function>()
  const [intersectionEntry, setIntersectionEntry] = React.useState<
    IntersectionObserverEntry | undefined
  >(undefined)

  const setRef = React.useCallback(
    (node) => {
      if (unobserve.current !== undefined) {
        unobserve.current()
        unobserve.current = undefined
      }

      if (options.skip) {
        return
      }

      if (node) {
        unobserve.current = newObserve(
          node,
          (entry) => {
            setIntersectionEntry(entry)

            if (
              entry.isIntersecting &&
              options.triggerOnce &&
              unobserve.current
            ) {
              // If it should only trigger once, unobserve the element after it's inView
              unobserve.current()
              unobserve.current = undefined
            }
          },
          options,
        )
      }
    },
    [
      options.threshold,
      options.root,
      options.rootMargin,
      options.triggerOnce,
      options.skip,
    ],
  )

  useEffect(() => {
    if (!unobserve.current && !options.triggerOnce && !options.skip) {
      // If we don't have a ref, then reset the state (unless the hook is set to only `triggerOnce` or `skip`)
      // This ensures we correctly reflect the current state - If you aren't observing anything, then nothing is inView
      setIntersectionEntry(undefined)
    }
  })

  return [
    setRef,
    intersectionEntry ? intersectionEntry.isIntersecting : false,
    intersectionEntry,
  ]
}
