import * as React from 'react'

type RenderProps = {
  inView: boolean
  entry: IntersectionObserverEntry | undefined
  ref: React.RefObject<any> | ((node?: Element | null) => void)
}

export type IntersectionOptions = IntersectionObserverInit & {
  /** Only trigger the inView callback once */
  triggerOnce?: boolean
}

export type IntersectionObserverProps = IntersectionOptions & {
  /**
   * Children expects a function that receives an object
   * contain an `inView` boolean and `ref` that should be
   * assigned to the element root.
   */
  children?: React.ReactNode | ((fields: RenderProps) => React.ReactNode)

  /**
   * Render the wrapping element as this element.
   * @default `'div'`
   */
  as?: string

  /**
   * Element tag to use for the wrapping component
   * @deprecated Replace with the 'as' prop
   */
  tag?: string

  /** Call this function whenever the in view state changes */
  onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void
}

export type HookResponse = [
  ((node?: Element | null) => void),
  boolean,
  IntersectionObserverEntry | undefined
]
