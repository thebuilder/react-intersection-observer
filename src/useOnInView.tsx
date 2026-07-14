import * as React from "react";
import type {
  IntersectionChangeEffect,
  IntersectionEffectOptions,
} from "./index";
import { observe } from "./observe";

const useSyncEffect = ((Reflect.get(React, "useInsertionEffect") as
  | typeof React.useEffect
  | undefined) ??
  React.useLayoutEffect ??
  React.useEffect) as typeof React.useEffect;

const supportsRefCleanup = (() => {
  const majorVersion = Number.parseInt(React.version.split(".")[0], 10);
  return Number.isInteger(majorVersion) && majorVersion >= 19;
})();

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
  const onIntersectionChangeRef = React.useRef(onIntersectionChange);
  const observedElementRef = React.useRef<TElement | null>(null);
  const observerCleanupRef = React.useRef<(() => void) | undefined>(undefined);
  const lastInViewRef = React.useRef<boolean | undefined>(undefined);

  useSyncEffect(() => {
    onIntersectionChangeRef.current = onIntersectionChange;
  }, [onIntersectionChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Threshold arrays are normalized inside the callback
  return React.useCallback(
    (element: TElement | undefined | null) => {
      // React 17 and 18 call callback refs with `null` instead of invoking a
      // returned cleanup, so eagerly tear down whenever the target changes.
      const cleanupExisting = () => {
        if (observerCleanupRef.current) {
          const cleanup = observerCleanupRef.current;
          observerCleanupRef.current = undefined;
          cleanup();
        }
      };

      if (element === observedElementRef.current) {
        return supportsRefCleanup ? observerCleanupRef.current : undefined;
      }

      if (!element || skip) {
        cleanupExisting();
        observedElementRef.current = null;
        lastInViewRef.current = undefined;
        return;
      }

      cleanupExisting();

      observedElementRef.current = element;
      let destroyed = false;

      const destroyObserver = observe(
        element,
        (inView, entry) => {
          const previousInView = lastInViewRef.current;
          lastInViewRef.current = inView;

          // Ignore the very first `false` notification so consumers only hear about actual state changes.
          if (previousInView === undefined && !inView) {
            return;
          }

          onIntersectionChangeRef.current(
            inView,
            entry as IntersectionObserverEntry & { target: TElement },
          );
          if (triggerOnce && inView) {
            stopObserving();
          }
        },
        {
          threshold,
          root,
          rootMargin,
          scrollMargin,
          trackVisibility,
          delay,
        } as IntersectionObserverInit,
      );

      function stopObserving() {
        // Centralized teardown so both manual destroys and React ref updates share
        // the same cleanup path (needed for React versions that never call the ref with `null`).
        if (destroyed) return;
        destroyed = true;
        destroyObserver();
        observedElementRef.current = null;
        observerCleanupRef.current = undefined;
        lastInViewRef.current = undefined;
      }

      observerCleanupRef.current = stopObserving;

      return supportsRefCleanup ? observerCleanupRef.current : undefined;
    },
    [
      Array.isArray(threshold) ? threshold.toString() : threshold,
      root,
      rootMargin,
      scrollMargin,
      trackVisibility,
      delay,
      triggerOnce,
      skip,
    ],
  );
};
