import * as React from 'react';
import { InView } from './InView';
export { InView } from './InView';
export { useInView } from './useInView';
export { observe, defaultFallbackInView } from './observe';

export default InView;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ObserverInstanceCallback = (
  inView: boolean,
  entry: IntersectionObserverEntry,
) => void;

interface RenderProps {
  inView: boolean;
  entry: IntersectionObserverEntry | undefined;
  ref: React.RefObject<any> | ((node?: Element | null) => void);
}

export interface IntersectionOptions extends IntersectionObserverInit {
  /** The IntersectionObserver interface's read-only `root` property identifies the Element or Document whose bounds are treated as the bounding box of the viewport for the element which is the observer's target. If the `root` is null, then the bounds of the actual document viewport are used.*/
  root?: Element | null;
  /** Margin around the root. Can have values similar to the CSS margin property, e.g. `10px 20px 30px 40px` (top, right, bottom, left). */
  rootMargin?: string;
  /** Number between `0` and `1` indicating the percentage that should be visible before triggering. Can also be an `array` of numbers, to create multiple trigger points. */
  threshold?: number | number[];
  /** Only trigger the inView callback once */
  triggerOnce?: boolean;
  /** Skip assigning the observer to the `ref` */
  skip?: boolean;
  /** Set the initial value of the `inView` boolean. This can be used if you expect the element to be in the viewport to start with, and you want to trigger something when it leaves. */
  initialInView?: boolean;
  /** Fallback to this inView state if the IntersectionObserver is unsupported, and a polyfill wasn't loaded */
  fallbackInView?: boolean;
  /** IntersectionObserver v2 - Track the actual visibility of the element */
  trackVisibility?: boolean;
  /** IntersectionObserver v2 - Set a minimum delay between notifications */
  delay?: number;
}

export interface IntersectionObserverProps extends IntersectionOptions {
  /**
   * Children expects a function that receives an object
   * contain an `inView` boolean and `ref` that should be
   * assigned to the element root.
   */
  children: (fields: RenderProps) => React.ReactNode;

  /** Call this function whenever the in view state changes */
  onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
}

/**
 * Types specific to the PlainChildren rendering of InView
 * */
export type PlainChildrenProps = IntersectionOptions & {
  children?: React.ReactNode;

  /**
   * Render the wrapping element as this element.
   * @default `'div'`
   */
  as?: React.ReactType<any>;

  /**
   * Element tag to use for the wrapping component
   * @deprecated Replace with the 'as' prop
   */
  tag?: React.ReactType<any>;

  /** Call this function whenever the in view state changes */
  onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
} & Omit<React.HTMLProps<HTMLElement>, 'onChange'>;

/**
 * The Hook response supports both array and object destructing
 */
export type InViewHookResponse = [
  (node?: Element | null) => void,
  boolean,
  IntersectionObserverEntry | undefined,
] & {
  ref: (node?: Element | null) => void;
  inView: boolean;
  entry?: IntersectionObserverEntry;
};
