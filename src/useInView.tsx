import * as React from 'react';
import { InViewHookResponse, IntersectionOptions } from './index';
import { useEffect } from 'react';
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
}: IntersectionOptions = {}): InViewHookResponse {
  const unobserve = React.useRef<Function>();
  const [state, setState] = React.useState<State>({
    inView: !!initialInView,
  });
  const setRef = React.useCallback(
    (node: Element | null) => {
      if (unobserve.current !== undefined) {
        unobserve.current();
        unobserve.current = undefined;
      }

      // Skip creating the observer
      if (skip) return;

      if (node) {
        unobserve.current = observe(
          node,
          (inView, entry) => {
            setState({ inView, entry });

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
      }
    },
    // We break the rule here, because we aren't including the actual `threshold` variable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // If the threshold is an array, convert it to a string so it won't change between renders.
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

  /* eslint-disable-next-line */
  useEffect(() => {
    if (!unobserve.current && state.entry && !triggerOnce && !skip) {
      // If we don't have a ref, then reset the state (unless the hook is set to only `triggerOnce` or `skip`)
      // This ensures we correctly reflect the current state - If you aren't observing anything, then nothing is inView
      setState({
        inView: !!initialInView,
      });
    }
  });

  const result = [setRef, state.inView, state.entry] as InViewHookResponse;

  // Support object destructuring, by adding the specific values.
  result.ref = result[0];
  result.inView = result[1];
  result.entry = result[2];

  return result;
}
