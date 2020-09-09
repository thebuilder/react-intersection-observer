/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { InViewHookResponse, IntersectionOptions } from './index';
import { useEffect } from 'react';
import { observe } from './observers';
type State = {
  inView: boolean;
  entry?: IntersectionObserverEntry;
};

const initialState: State = {
  inView: false,
  entry: undefined,
};

export function useInView(
  options: IntersectionOptions = {},
): InViewHookResponse {
  const unobserve = React.useRef<Function>();
  const [state, setState] = React.useState<State>(initialState);

  const setRef = React.useCallback(
    (node) => {
      if (unobserve.current !== undefined) {
        unobserve.current();
        unobserve.current = undefined;
      }

      if (options.skip) {
        return;
      }

      if (node) {
        unobserve.current = observe(
          node,
          (inView, entry) => {
            setState({ inView, entry });

            if (
              entry.isIntersecting &&
              options.triggerOnce &&
              unobserve.current
            ) {
              // If it should only trigger once, unobserve the element after it's inView
              unobserve.current();
              unobserve.current = undefined;
            }
          },
          options,
        );
      }
    },
    [
      options.threshold,
      options.root,
      options.rootMargin,
      options.triggerOnce,
      options.skip,
      options.trackVisibility,
      options.delay,
    ],
  );

  useEffect(() => {
    if (!unobserve.current && !options.triggerOnce && !options.skip) {
      // If we don't have a ref, then reset the state (unless the hook is set to only `triggerOnce` or `skip`)
      // This ensures we correctly reflect the current state - If you aren't observing anything, then nothing is inView
      setState(initialState);
    }
  });

  const result = [setRef, state.inView, state.entry] as InViewHookResponse;

  // Support object destructuring, by adding the specific values.
  result.ref = result[0];
  result.inView = result[1];
  result.entry = result[2];

  return result;
}
