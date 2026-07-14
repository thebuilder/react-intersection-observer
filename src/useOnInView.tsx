import type {
  IntersectionChangeEffect,
  IntersectionEffectOptions,
} from "./index";
import { useIntersectionObserverRef } from "./useIntersectionObserverRef";

/**
 * React Hooks make it easy to monitor when elements come into and leave view. Call
 * the `useOnInView` hook with your callback and (optional) [options](#options).
 * It will return a ref callback that you can assign to the DOM element you want to monitor.
 * When the element enters or leaves the viewport, your callback will be triggered.
 *
 * This hook triggers no re-renders, and is useful for performance-critical use-cases or
 * when you need to trigger render independent side effects like tracking or logging.
 *
 * @example
 * ```jsx
 * import React from 'react';
 * import { useOnInView } from 'react-intersection-observer';
 *
 * const Component = () => {
 *   const inViewRef = useOnInView((inView, entry) => {
 *     if (inView) {
 *       console.log("Element is in view", entry.target);
 *     } else {
 *       console.log("Element left view", entry.target);
 *     }
 *   });
 *
 *   return (
 *     <div ref={inViewRef}>
 *       <h2>This element is being monitored</h2>
 *     </div>
 *   );
 * };
 * ```
 */
export const useOnInView = <TElement extends Element>(
  onIntersectionChange: IntersectionChangeEffect<TElement>,
  {
    threshold,
    root,
    rootMargin,
    scrollMargin,
    trackVisibility,
    delay,
    triggerOnce,
    skip,
  }: IntersectionEffectOptions = {},
) => {
  return useIntersectionObserverRef<TElement>(
    (inView, entry, previousInView) => {
      // Ignore the very first `false` notification so consumers only hear about actual state changes.
      if (previousInView === undefined && !inView) {
        return;
      }

      onIntersectionChange(inView, entry);
    },
    {
      threshold,
      root,
      rootMargin,
      scrollMargin,
      trackVisibility,
      delay,
      triggerOnce,
      skip,
    },
  );
};
