import * as React from "react";
import type { IntersectionOptions, InViewHookResponse } from "./index";
import { useIntersectionObserverRef } from "./useIntersectionObserverRef";

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
  scrollMargin,
  root,
  triggerOnce,
  skip,
  initialInView,
  fallbackInView,
  onChange,
}: IntersectionOptions = {}): InViewHookResponse {
  const lastInViewRef = React.useRef<boolean | undefined>(initialInView);
  const [state, setState] = React.useState<State>({
    inView: !!initialInView,
    entry: undefined,
  });

  const observerRef = useIntersectionObserverRef<Element>(
    (inView, entry) => {
      if (lastInViewRef.current === undefined) {
        lastInViewRef.current = initialInView;
      }
      const previousInView = lastInViewRef.current;
      lastInViewRef.current = inView;

      // Ignore the very first `false` notification so consumers only hear about actual state changes.
      if (previousInView === undefined && !inView) {
        return;
      }

      setState({ inView, entry });
      onChange?.(inView, entry);
    },
    {
      threshold,
      root,
      rootMargin,
      scrollMargin,
      trackVisibility,
      delay,
      fallbackInView,
      skip,
      triggerOnce,
    },
  );

  const refState = React.useRef<
    [boolean, boolean, ((node?: Element | null) => void) | null]
  >([false, false, null]);

  const setRef = React.useCallback(
    function setRef(node?: Element | null) {
      const refStateValue = refState.current;
      if (!node && refStateValue[2] !== setRef) return;

      if (node) {
        refStateValue[0] = !skip;
        refStateValue[1] = false;
        refStateValue[2] = setRef;
      } else {
        refStateValue[1] = refStateValue[0];
        refStateValue[0] = false;
        refStateValue[2] = null;
      }

      const cleanup = observerRef(node);
      if (!cleanup) return;

      return () => {
        cleanup();
        if (refStateValue[2] === setRef) {
          refStateValue[1] = refStateValue[0];
          refStateValue[0] = false;
          refStateValue[2] = null;
        }
      };
    },
    [observerRef, skip],
  );

  React.useLayoutEffect(() => {
    if (!refState.current[1]) return;
    refState.current[1] = false;
    if (triggerOnce || skip) return;

    setState({ inView: !!initialInView, entry: undefined });
    lastInViewRef.current = initialInView;
  });

  const result = [setRef, state.inView, state.entry] as InViewHookResponse;

  // Support object destructuring, by adding the specific values.
  result.ref = result[0];
  result.inView = result[1];
  result.entry = result[2];

  return result;
}
