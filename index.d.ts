import React = require('react')

export interface RenderProps {
  inView: boolean
  intersection: IntersectionObserverEntry | undefined
  ref: React.RefObject<any>
}

export interface IntersectionOptions {
  /**
   * The `HTMLElement` that is used as the viewport for checking visibility of
   * the target.
   * Defaults to the browser viewport if not specified or if `null`.
   */
  root?: Element | null

  /**
   * Margin around the root.
   * Can have values similar to the CSS margin property,
   * e.g. `"10px 20px 30px 40px"` (top, right, bottom, left).
   */
  rootMargin?: string

  /** Number between 0 and 1 indicating the the percentage that should be
   * visible before triggering. Can also be an array of numbers, to create
   * multiple trigger points.
   * @default `0`
   */
  threshold?: number | number[]

  /**
   * Only trigger this method once
   * @default `false`
   */
  triggerOnce?: boolean
}

export interface IntersectionObserverProps extends IntersectionOptions {
  /**
   * Children expects a function that receives an object
   * contain an `inView` boolean and `ref` that should be
   * assigned to the element root.
   */
  children?: React.ReactNode | ((fields: RenderProps) => React.ReactNode)

  /**
   * Element tag to use for the wrapping component
   * @default `'div'`
   */
  tag?: string

  /** Call this function whenever the in view state changes */
  onChange?: (inView: boolean, intersection: IntersectionObserverEntry) => void
}

/**
 * Hook to observe an Element, and return boolean indicating if it's inside the viewport
 **/
export type useInView = (
  ref: React.RefObject<any>,
  options: IntersectionOptions,
) => boolean

/**
 * Hook to observe an Element, and return an object with the inView status, and the IntersectionObserverEntry
 **/
export type useIntersectionObserver = (
  ref: React.RefObject<any>,
  options: IntersectionOptions,
) => {
  inView: boolean
  intersection?: IntersectionObserverEntry
}

export class InView extends React.Component<IntersectionObserverProps, {}> {}

export default class ReactIntersectionObserver extends React.Component<
  IntersectionObserverProps,
  {}
> {}
