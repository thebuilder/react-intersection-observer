import * as React from 'react'
import { IntersectionOptions } from './'
import { observe, unobserve, ObserverInstance } from './intersection'

export type HookResponse = {
  inView: boolean
  entry?: IntersectionObserverEntry
}

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionOptions = {},
): HookResponse {
  const [isInView, setInView] = React.useState<boolean>(false)
  const instance = React.useRef<ObserverInstance | undefined>(undefined)
  const entry = React.useRef<IntersectionObserverEntry | undefined>(undefined)

  React.useEffect(
    () => {
      /* istanbul ignore else  */
      if (ref.current) {
        instance.current = observe(
          ref.current,
          (inView, intersection) => {
            entry.current = intersection
            setInView(inView)
            if (inView && options.triggerOnce) {
              // If it should only trigger once, unobserve the element after it's inView
              unobserve(ref.current)
            }
          },
          options,
        )
      } else {
        throw new Error(
          '[react-intersection-observer]: The hook is missing a "ref" to monitor. Make sure you create a new ref with "useRef()" and assign it a DOM element.',
        )
      }

      return () => {
        unobserve(ref.current)
      }
    },
    [options.threshold, options.root, options.rootMargin],
  )

  return { inView: isInView, entry: entry.current }
}

/**
 * Hook to observe an Element, and return boolean indicating if it's inside the viewport
 **/
export function useInView(
  ref: React.RefObject<Element>,
  options: IntersectionOptions = {},
): boolean {
  const intersection = useIntersectionObserver(ref, options)
  return intersection.inView
}
