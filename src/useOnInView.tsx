import * as React from "react";
import type {
  IntersectionChangeEffect,
  IntersectionEffectOptions,
} from "./index";
import { observe } from "./observe";

/**
 * React Hooks make it easy to monitor when elements come into and leave view. Call
 * the `useOnInView` hook with your callback and (optional) [options](#options).
 * It will return a ref callback that you can assign to the DOM element you want to monitor.
 * When the element enters or leaves the viewport, your callback will be triggered.
 *
 * This hook triggers no re-renders, and is useful for performance-critical use-cases or
 * when you need to trigger render independent side-effects like tracking or logging.
 *
 * @example
 * ```jsx
 * import React from 'react';
 * import { useOnInView } from 'react-intersection-observer';
 *
 * const Component = () => {
 *   const inViewRef = useOnInView((entry) => {
 *     console.log(`Element is in view`, entry?.target);
 *     // Optional: cleanup function:
 *     return () => {
 *       console.log('Element moved out of view or unmounted');
 *     };
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
export const useOnInView = <TElement extends Element>(
  onIntersectionChange: IntersectionChangeEffect<TElement>,
  {
    threshold,
    root,
    rootMargin,
    trackVisibility,
    delay,
    triggerOnce,
    skip,
    trigger,
  }: IntersectionEffectOptions = {},
) => {
  // Store the onIntersectionChange in a ref to avoid triggering recreation
  const onIntersectionChangeRef = React.useRef(onIntersectionChange);
  // https://react.dev/reference/react/useRef#caveats
  // > Do not write or read ref.current during rendering, except for initialization. This makes your component’s behavior unpredictable.
  //
  // With useInsertionEffect, ref.current can be updated after a successful render
  // from https://github.com/sanity-io/use-effect-event/blob/main/src/useEffectEvent.ts
  React.useInsertionEffect(() => {
    onIntersectionChangeRef.current = onIntersectionChange;
  }, [onIntersectionChange]);

  return React.useCallback(
    (element: TElement | undefined | null) => {
      if (!element || skip) {
        return;
      }

      let callbackCleanup:
        | undefined
        | ReturnType<IntersectionChangeEffect<TElement>>;

      // trigger "enter": intersectionsStateTrigger = true
      // trigger "leave": intersectionsStateTrigger = false
      const intersectionsStateTrigger = trigger !== "leave";

      const destroyInviewObserver = observe(
        element,
        (inView, entry) => {
          // Call the callback when the element is in view (if trigger is "enter")
          // Call the callback when the element is out of view (if trigger is "leave")
          if (inView === intersectionsStateTrigger) {
            callbackCleanup = onIntersectionChangeRef.current(entry);

            // if there is no cleanup function returned from the callback
            // and triggerOnce is true, the observer can be destroyed immediately
            if (triggerOnce && !callbackCleanup) {
              destroyInviewObserver();
            }
          }
          // Call cleanup when going out of view (if trigger is "enter")
          // Call cleanup when going in view (if trigger is "leave")
          else {
            if (callbackCleanup) {
              callbackCleanup(entry);
              callbackCleanup = undefined;
              // If the callbackCleanup was called and triggerOnce is true
              // the observer can be destroyed immediately after the callback is called
              if (triggerOnce) {
                destroyInviewObserver();
              }
            }
          }
        },
        {
          threshold,
          root,
          rootMargin,
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
      // Convert threshold array to string for stable dependency
      Array.isArray(threshold) ? threshold.toString() : threshold,
      root,
      rootMargin,
      trackVisibility,
      delay,
      triggerOnce,
      skip,
      trigger,
    ],
  );
};
