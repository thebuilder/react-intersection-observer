import * as React from "react";
import type { IntersectionOptions, InViewHookResponse } from "./index";
import { supportsRefCleanup } from "./reactVersion";
import { useOnInView } from "./useOnInView";

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
export function useInView(
  options: IntersectionOptions = {},
): InViewHookResponse {
  const [state, setState] = React.useState<State>({
    inView: !!options.initialInView,
    entry: undefined,
  });
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const entryTargetRef = React.useRef<Element | undefined>(undefined);

  const inViewRef = useOnInView((inView, entry) => {
    entryTargetRef.current = entry.target;
    setState({ inView, entry });
    if (optionsRef.current.onChange) {
      optionsRef.current.onChange(inView, entry);
    }
  }, options);

  const refCallback = React.useCallback(
    (node: Element | null) => {
      const resetIfNeeded = () => {
        const {
          skip,
          triggerOnce,
          initialInView: latestInitialInView,
        } = optionsRef.current;
        if (!skip && !triggerOnce && entryTargetRef.current) {
          setState({
            inView: !!latestInitialInView,
            entry: undefined,
          });
          entryTargetRef.current = undefined;
        }
      };
      const cleanup = inViewRef(node);

      if (!node) {
        resetIfNeeded();
        return;
      }

      if (!supportsRefCleanup) {
        return;
      }

      return () => {
        cleanup?.();
        resetIfNeeded();
      };
    },
    [inViewRef],
  );

  const result = [refCallback, state.inView, state.entry] as InViewHookResponse;

  // Support object destructuring, by adding the specific values.
  result.ref = result[0];
  result.inView = result[1];
  result.entry = result[2];

  return result;
}
