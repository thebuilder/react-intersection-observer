import * as React from 'react'
import { IntersectionOptions } from './'
import { observe, unobserve } from './intersection'

export type HookResponse = {
  inView: boolean
  entry?: IntersectionObserverEntry
}

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionOptions = {},
): HookResponse {
  const [currentRef, setCurrentRef] = React.useState<Element | null>(
    ref.current,
  )
  const [state, setState] = React.useState<HookResponse>({
    inView: false,
    entry: undefined,
  })
  React.useEffect(() => {
    // Create a separate effect that always checks if the ref has changed.
    // If it changes, the Observer will need to be recreated, so set a new ref state
    // that the triggers an update of the next effect
    if (ref.current !== currentRef) {
      setCurrentRef(ref.current)
    }
  })

  React.useEffect(() => {
    if (currentRef) {
      observe(
        currentRef,
        (inView, intersection) => {
          setState({ inView, entry: intersection })

          if (inView && options.triggerOnce) {
            // If it should only trigger once, unobserve the element after it's inView
            unobserve(currentRef)
          }
        },
        options,
      )
    }

    return () => {
      unobserve(currentRef)
    }
  }, [
    // Only create a new Observer instance if the ref or any of the options have been changed.
    currentRef,
    options.threshold,
    options.root,
    options.rootMargin,
    options.triggerOnce,
  ])

  return state
}

/**
 * Hook to observe an Element, and return boolean indicating if it's inside the viewport
 **/
export function useInView(
  ref: React.RefObject<Element>,
  options: IntersectionOptions = {},
): boolean {
  const intersection = useIntersectionObserver(ref, options)
  React.useDebugValue(intersection.inView)

  return intersection.inView
}
