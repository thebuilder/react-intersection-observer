import * as React from "react";
import type { InViewHookResponse, IntersectionOptions } from "./index";
import { useOnInViewChanged } from "./useOnInViewChanged";

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
  const {
    threshold,
    delay,
    trackVisibility,
    rootMargin,
    root,
    triggerOnce,
    skip,
    initialInView,
  } = options;

  // State for tracking inView status and the IntersectionObserverEntry
  const [state, setState] = React.useState<State>({
    inView: !!initialInView,
    entry: undefined,
  });

  // Store the onChange callback in a ref
  const latestOptions = React.useRef(options);
  latestOptions.current = options;

  // Create the ref tracking function using useOnInViewChanged
  const refCallback = useOnInViewChanged(
    // Combined callback - updates state, calls onChange, and returns cleanup if needed
    (inView, entry) => {
      setState({ inView, entry });

      // Call the external onChange if provided
      const { onChange } = latestOptions.current;
      if (onChange && entry) {
        onChange(inView, entry);
      }

      // If triggerOnce is true, we don't need to reset state in cleanup
      if (triggerOnce) {
        return undefined;
      }

      // Return cleanup function that will run when element is removed or goes out of view
      return (entry) => {
        // Call the external onChange if provided
        if (onChange && entry) {
          onChange(false, entry);
        }
        // should not reset current state if changing skip
        if (!latestOptions.current.skip) {
          setState({
            inView: false,
            entry: undefined,
          });
        }
      };
    },
    {
      root,
      rootMargin,
      threshold,
      // @ts-ignore
      trackVisibility,
      // @ts-ignore
      delay,
      initialInView,
      triggerOnce,
      skip,
    },
  );

  // Build the result with the same API as the original hook
  const result = [refCallback, state.inView, state.entry] as InViewHookResponse;

  // Add named properties for object destructuring support
  result.ref = result[0];
  result.inView = result[1];
  result.entry = result[2];

  return result;
}
