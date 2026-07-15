import * as React from "react";
import type { IntersectionOptions, InViewHookResponse } from "./index";
import { useIntersectionObserverRef } from "./useIntersectionObserverRef";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

type State = {
  inView: boolean;
  entry?: IntersectionObserverEntry;
};

type RefState = {
  node: Element | null;
  reset: boolean;
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

  const refState = React.useRef<RefState>({
    node: null,
    reset: false,
  });

  const setRef = React.useCallback(
    function setRef(node?: Element | null) {
      if (node) {
        refState.current.node = node;
        refState.current.reset = false;
      } else if (refState.current.node) {
        refState.current.node = null;
        refState.current.reset = true;
      }

      const cleanup = observerRef(node);
      if (!cleanup) return;

      return () => {
        cleanup();
        if (refState.current.node === node) {
          refState.current.node = null;
          refState.current.reset = true;
        }
      };
    },
    [observerRef],
  );

  useIsomorphicLayoutEffect(() => {
    if (!refState.current.reset) return;
    refState.current.reset = false;
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
