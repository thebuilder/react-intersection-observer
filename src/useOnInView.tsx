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
 * when you need to trigger render independent side effects like tracking or logging.
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
  const onIntersectionChangeRef = React.useRef(onIntersectionChange);
  const syncEffect =
    (
      React as typeof React & {
        useInsertionEffect?: typeof React.useEffect;
      }
    ).useInsertionEffect ??
    React.useLayoutEffect ??
    React.useEffect;

  syncEffect(() => {
    onIntersectionChangeRef.current = onIntersectionChange;
  }, [onIntersectionChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Threshold is validated to be stable
  return React.useCallback(
    (element: TElement | undefined | null) => {
      if (!element || skip) {
        return;
      }

      let callbackCleanup:
        | undefined
        | ReturnType<IntersectionChangeEffect<TElement>>;

      const intersectionsStateTrigger = trigger !== "leave";

      const destroyInViewObserver = observe(
        element,
        (inView, entry) => {
          if (callbackCleanup) {
            callbackCleanup(entry);
            callbackCleanup = undefined;
            if (triggerOnce) {
              destroyInViewObserver();
              return;
            }
          }

          if (inView === intersectionsStateTrigger) {
            callbackCleanup = onIntersectionChangeRef.current(
              entry,
              destroyInViewObserver,
            );

            if (triggerOnce && !callbackCleanup) {
              destroyInViewObserver();
            }
          }
        },
        {
          threshold,
          root,
          rootMargin,
          // @ts-expect-error Track visibility is a non-standard extension
          trackVisibility,
          delay,
        },
      );

      return () => {
        destroyInViewObserver();
        callbackCleanup?.();
      };
    },
    [
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
