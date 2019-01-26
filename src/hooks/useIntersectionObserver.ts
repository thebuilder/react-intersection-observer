import * as React from 'react'
import { IntersectionOptions } from '../'
import { observe, unobserve } from '../intersection'

export type HookResponse = {
  inView: boolean
  intersection?: IntersectionObserverEntry
}

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionOptions = {},
): HookResponse {
  const [isInView, setInView] = React.useState<boolean>(false)
  const [intersectionEntry, setIntersectionEntry] = React.useState<
    IntersectionObserverEntry | undefined
  >(undefined)

  React.useEffect(() => {
    /* istanbul ignore else  */
    if (ref.current) {
      observe(
        ref.current,
        (inView, intersection) => {
          setInView(inView)
          setIntersectionEntry(intersection)
          if (inView && options.triggerOnce) {
            // If it should only trigger once, unobserve the element after it's inView
            unobserve(ref.current)
          }
        },
        options,
      )
    }

    return () => {
      unobserve(ref.current)
    }
  }, [options.threshold, options.root, options.rootMargin])

  return { inView: isInView, intersection: intersectionEntry }
}
