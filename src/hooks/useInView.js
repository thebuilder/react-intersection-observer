// @flow
import * as React from 'react'
import type { IntersectionOptions } from '../index'
import { useIntersectionObserver } from './useIntersectionObserver'

/**
 * Returns true if the element is inside the viewport
 **/
export function useInView(
  ref: React.ElementRef<*>,
  options: IntersectionOptions = {},
): boolean {
  const intersection = useIntersectionObserver(ref, options)
  return intersection.inView
}
