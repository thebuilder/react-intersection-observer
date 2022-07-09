import * as React from 'react';
import type { InViewHookResponse, IntersectionOptions } from './index';
import { observe } from './observe';

type State = {
  inView: boolean;
  entry?: IntersectionObserverEntry;
};

/**
 * React Hooks make it easy to monitor the `inView` state of your components. Call
 * the `useInView` hook with the (optional) [options](#options) you need. It will
 * return an array containing a `ref`, the `inView` status and the current
 * [`entry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry).
 * Assign the `ref` to the DOM element you want to monitor, and the hook will
 * report the status.
 *
 * @example
 * ```jsx
 * import React from 'react';
 * import { useInView } from 'react-intersection-observer';
 *
 * const Component = () => {
 *   const { ref, inView, entry } = useInView({
 *       threshold: 0,
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       <h2>{`Header inside viewport ${inView}.`}</h2>
 *     </div>
 *   );
 * };
 * ```
 */
export function useInView({
  threshold,
  delay,
  trackVisibility,
  rootMargin,
  root,
  triggerOnce,
  skip,
  initialInView,
  fallbackInView,
  onChange,
}: IntersectionOptions = {}): InViewHookResponse {
  const ref = React.useRef<Element | null>(null);
  const unobserve = React.useRef<Function>();
  const callback = React.useRef<IntersectionOptions['onChange']>();
  const [state, setState] = React.useState<State>({
    inView: !!initialInView,
    entry: undefined,
  });

  // Store the onChange callback in a `ref`, so we can access the latest instance
  // inside the `useCallback`, but without triggering a rerender.
  callback.current = onChange;

  const setRef = React.useCallback(
    (node: Element) => {
      ref.current = node;
      // Ensure we have node ref, and that we shouldn't skip observing
      if (skip || !node) return;

      // Store a reference the current unobserve function, so we can destroy it later
      const previousObserver = unobserve.current;

      // Create a new IntersectionObserver, and store the `unobserve` function.
      unobserve.current = observe(
        node,
        (inView, entry) => {
          setState({
            inView,
            entry,
          });

          // Trigger any onChange callback function
          if (callback.current) callback.current(inView, entry);

          if (entry.isIntersecting && triggerOnce && unobserve.current) {
            // If it should only trigger once, unobserve the element after it's inView
            unobserve.current();
            unobserve.current = undefined;
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
        fallbackInView,
      );

      if (previousObserver) {
        // Was already observing a node - Make sure we destroy the previous observer.
        // Do it after we create the new one, so the IntersectionObserver instance can be reused.
        previousObserver();
      }
    },
    // We break the rule here, because we aren't including the actual `threshold` variable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // If the threshold is an array, convert it to a string, so it won't change between renders.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Array.isArray(threshold) ? threshold.toString() : threshold,
      root,
      rootMargin,
      triggerOnce,
      skip,
      trackVisibility,
      fallbackInView,
      delay,
    ],
  );

  // We break the rule here, since we want to ensure we check the `ref` instances on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!ref.current && state.entry?.target && !triggerOnce && !skip) {
      // If we don't have a node ref, then reset the state (unless the hook is set to only `triggerOnce` or `skip`)
      // This ensures we correctly reflect the current state - If you aren't observing anything, then nothing is inView.
      setState({
        inView: !!initialInView,
        entry: undefined,
      });
    }

    return () => {
      if (!ref.current && unobserve.current) {
        // We no longer have a valid ref. Destroy the observer
        unobserve.current();
        unobserve.current = undefined;
        ref.current = null;
      }
    };
  });

  const result = [setRef, state.inView, state.entry] as InViewHookResponse;

  // Support object destructuring, by adding the specific values.
  result.ref = result[0];
  result.inView = result[1];
  result.entry = result[2];

  return result;
}
