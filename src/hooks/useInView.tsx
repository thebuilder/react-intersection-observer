import * as React from 'react'
import { IntersectionOptions } from '../index'
import { useIntersectionObserver } from './useIntersectionObserver'

/**
 * Returns true if the element is inside the viewport
 **/
export function useInView(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionOptions = {},
): boolean {
  const intersection = useIntersectionObserver(ref, options)
  return intersection.inView
}
