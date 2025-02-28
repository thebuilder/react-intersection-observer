import * as React from "react";
import type {
  InViewHookChangeListener,
  IntersectionListenerOptions,
} from "./index";
import { observe } from "./observe";

/**
 * React Hooks make it easy to monitor when elements come into and leave view. Call
 * the `useOnInViewChanged` hook with your callback and (optional) [options](#options).
 * It will return a ref callback that you can assign to the DOM element you want to monitor.
 * When the element enters or leaves the viewport, your callback will be triggered.
 *
 * This hook triggers no re-renders, and is useful for performance-critical use-cases or
 * when you need to trigger render independent side-effects like tracking or logging.
 *
 * @example
 * ```jsx
 * import React from 'react';
 * import { useOnInViewChanged } from 'react-intersection-observer';
 *
 * const Component = () => {
 *   const inViewRef = useOnInViewChanged((inView, entry, element) => {
 *     console.log(`Element is ${inView ? 'in view' : 'out of view'}`);
 *     // Optional: cleanup function:
 *    return () => {
 *     console.log('Element moved out of view or unmounted');
 *    };
 *   }, {
 *     threshold: 0,
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
export const useOnInViewChanged = <TElement extends Element>(
  onGetsIntoView: InViewHookChangeListener<TElement>,
  {
    threshold,
    delay,
    trackVisibility,
    rootMargin,
    root,
    triggerOnce,
    skip,
    initialInView,
  }: IntersectionListenerOptions = {},
  dependencies: React.DependencyList = [],
) => {
  // Store the onGetsIntoView in a ref to avoid triggering recreation
  const onGetsIntoViewRef = React.useRef(onGetsIntoView);
  onGetsIntoViewRef.current = onGetsIntoView;

  return React.useCallback(
    (element: TElement | undefined | null) => {
      if (!element || skip) {
        return;
      }

      let callbackCleanup:
        | undefined
        | ReturnType<InViewHookChangeListener<TElement>>;
      let didTriggerOnce = false;

      // If initialInView is true, we have to call the callback immediately
      // to get a cleanup function for the out of view event
      if (initialInView) {
        callbackCleanup = onGetsIntoViewRef.current(element, undefined);
      }

      const destroyInviewObserver = observe(
        element,
        (inView, entry) => {
          // Call cleanup when going out of view
          if (!inView) {
            if (triggerOnce && didTriggerOnce) {
              destroyInviewObserver?.();
            }
            callbackCleanup?.(entry);
            callbackCleanup = undefined;
            return;
          }

          // Call callback with inView state, entry, and element
          callbackCleanup = onGetsIntoViewRef.current(element, entry);

          didTriggerOnce = true;

          // if the cleanup is not waiting for the element to go out of view
          // and triggerOnce is true, we can destroy the observer
          if (triggerOnce && !callbackCleanup) {
            destroyInviewObserver?.();
          }
        },
        {
          root,
          rootMargin,
          threshold,
          // @ts-ignore
          trackVisibility,
          // @ts-ignore
          delay,
        },
      );
      // Return cleanup function for React 19's ref callback
      return () => {
        destroyInviewObserver();
        callbackCleanup?.();
      };
    },
    // We break the rule here, because we aren't including the actual `threshold` variable
    [
      ...dependencies,
      root,
      rootMargin,
      // Convert threshold array to string for stable dependency
      Array.isArray(threshold) ? threshold.toString() : threshold,
      trackVisibility,
      delay,
      triggerOnce,
      skip,
    ],
  );
};
