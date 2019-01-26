import * as React from 'react'
import { IntersectionOptions } from '../index'
import { useIntersectionObserver } from './useIntersectionObserver'

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
