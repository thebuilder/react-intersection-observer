import * as React from 'react';
import { InView } from './InView';
export { InView } from './InView';
export { useInView } from './useInView';
export default InView;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ObserverInstanceCallback = (
  entry: IntersectionObserverEntry,
) => void;

export type ObserverInstance = {
  inView: boolean;
  readonly callback: ObserverInstanceCallback;
  readonly element: Element;
  readonly observerId: string;
  readonly observer: IntersectionObserver;
  readonly thresholds: ReadonlyArray<number>;
};

interface RenderProps {
  inView: boolean;
  entry: IntersectionObserverEntry | undefined;
  ref: React.RefObject<any> | ((node?: Element | null) => void);
}

export interface IntersectionOptions extends IntersectionObserverInit {
  /** Only trigger the inView callback once */
  triggerOnce?: boolean;
  /** Skip assigning the observer to the `ref` */
  skip?: boolean;
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
  children: React.ReactNode;

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
