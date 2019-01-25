// @flow
import * as React from 'react'
import { observe, unobserve } from '../intersection'
import type { IntersectionOptions } from '../index'

export function useIntersectionObserver(
  ref: React.ElementRef<*>,
  options: IntersectionOptions = {},
): { inView: boolean, intersection: IntersectionObserverEntry } {
  const [isInView, setInView] = React.useState(false)
  const [intersectionEntry, setIntersectionEntry] = React.useState({})

  React.useEffect(() => {
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
  }, [options.threshold, options.root, options.rootMargin, options.rootId])

  return { inView: isInView, intersection: intersectionEntry }
}
