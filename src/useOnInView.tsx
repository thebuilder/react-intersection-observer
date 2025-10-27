import * as React from "react";
import type {
  IntersectionChangeEffect,
  IntersectionEffectOptions,
} from "./index";
import { observe } from "./observe";

const useSyncEffect =
  (
    React as typeof React & {
      useInsertionEffect?: typeof React.useEffect;
    }
  ).useInsertionEffect ??
  React.useLayoutEffect ??
  React.useEffect;

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
  const observedElementRef = React.useRef<TElement | null>(null);
  const observerCleanupRef = React.useRef<(() => void) | undefined>(undefined);
  const callbackCleanupRef =
    React.useRef<ReturnType<IntersectionChangeEffect<TElement>>>(undefined);

  useSyncEffect(() => {
    onIntersectionChangeRef.current = onIntersectionChange;
  }, [onIntersectionChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Threshold arrays are normalized inside the callback
  return React.useCallback(
    (element: TElement | undefined | null) => {
      // React <19 never calls ref callbacks with `null` during unmount, so we
      // eagerly tear down existing observers manually whenever the target changes.
      const cleanupExisting = () => {
        if (observerCleanupRef.current) {
          const cleanup = observerCleanupRef.current;
          observerCleanupRef.current = undefined;
          cleanup();
        } else if (callbackCleanupRef.current) {
          const cleanup = callbackCleanupRef.current;
          callbackCleanupRef.current = undefined;
          cleanup();
        }
      };

      if (element === observedElementRef.current) {
        return observerCleanupRef.current;
      }

      if (!element || skip) {
        observedElementRef.current = element ?? null;
        cleanupExisting();
        return;
      }

      cleanupExisting();

      observedElementRef.current = element;
      const intersectionsStateTrigger = trigger !== "leave";
      let destroyed = false;

      const destroyObserver = observe(
        element,
        (inView, entry) => {
          if (callbackCleanupRef.current) {
            const cleanup = callbackCleanupRef.current;
            callbackCleanupRef.current = undefined;
            cleanup(entry);
            if (triggerOnce) {
              stopObserving();
              return;
            }
          }

          if (inView === intersectionsStateTrigger) {
            const nextCleanup = onIntersectionChangeRef.current(
              entry,
              stopObserving,
            );
            callbackCleanupRef.current =
              typeof nextCleanup === "function" ? nextCleanup : undefined;

            if (triggerOnce && !callbackCleanupRef.current) {
              stopObserving();
            }
          }
        },
        {
          threshold,
          root,
          rootMargin,
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
        const cleanup = callbackCleanupRef.current;
        callbackCleanupRef.current = undefined;
        cleanup?.();
        observerCleanupRef.current = undefined;
      }

      observerCleanupRef.current = stopObserving;

      return observerCleanupRef.current;
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
