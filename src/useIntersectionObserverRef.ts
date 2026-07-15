import * as React from "react";
import type { IntersectionObserverInitWithOptions } from "./index";
import { observe } from "./observe";

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const useInsertionEffect = Reflect.get(React, "useInsertionEffect") as
  | typeof React.useEffect
  | undefined;
const useSyncEffect = useInsertionEffect ?? React.useEffect;

export function supportsRefCleanup(version: string | undefined) {
  return version?.startsWith("19.") || false;
}

const canUseRefCleanup = supportsRefCleanup(React.version);

type ObserverCallback<TElement extends Element> = (
  inView: boolean,
  entry: IntersectionObserverEntry & { target: TElement },
  previousInView: boolean | undefined,
) => void;

type ObserverRefOptions = IntersectionObserverInitWithOptions & {
  fallbackInView?: boolean;
  skip?: boolean;
  triggerOnce?: boolean;
};

type ObserverRefCallback<TElement extends Element> = (
  element: TElement | undefined | null,
) => (() => void) | undefined;

type ObserverState<TElement extends Element> = {
  node: TElement | null;
  stop: (() => void) | undefined;
  owner: ObserverRefCallback<TElement> | null;
};

export function useIntersectionObserverRef<TElement extends Element>(
  onIntersectionChange: ObserverCallback<TElement>,
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
  }: ObserverRefOptions,
) {
  const onIntersectionChangeRef = React.useRef(onIntersectionChange);
  const observerStateRef = React.useRef<ObserverState<TElement>>({
    node: null,
    stop: undefined,
    owner: null,
  });

  // React 17 has no effect that runs before callback refs attach. Keep its
  // synchronous fallback behavior compatible by publishing during render.
  if (!useInsertionEffect) {
    onIntersectionChangeRef.current = onIntersectionChange;
  }

  useSyncEffect(() => {
    onIntersectionChangeRef.current = onIntersectionChange;
  }, [onIntersectionChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Threshold arrays are normalized inside the callback
  return React.useCallback(
    function setRef(element: TElement | undefined | null) {
      const observerState = observerStateRef.current;

      if (!element && observerState.owner !== setRef) {
        return;
      }

      if (element === observerState.node) {
        observerState.owner = setRef;
        return canUseRefCleanup ? observerState.stop : undefined;
      }

      const cleanup = observerState.stop;
      observerState.stop = undefined;
      cleanup?.();

      if (!element || skip) {
        observerState.node = null;
        observerState.owner = element ? setRef : null;
        return;
      }

      observerState.node = element;
      observerState.owner = setRef;

      let destroyObserver: (() => void) | undefined;
      let previousInView: boolean | undefined;

      function stopObserving() {
        destroyObserver?.();

        if (observerState.stop === stopObserving) {
          observerState.node = null;
          observerState.stop = undefined;
        }
      }

      observerState.stop = stopObserving;
      destroyObserver = observe(
        element,
        (inView, entry) => {
          onIntersectionChangeRef.current(
            inView,
            entry as IntersectionObserverEntry & { target: TElement },
            previousInView,
          );
          previousInView = inView;
          if (triggerOnce && inView) stopObserving();
        },
        {
          threshold,
          root,
          rootMargin,
          scrollMargin,
          trackVisibility,
          delay,
        },
        fallbackInView,
      );

      if (observerState.stop !== stopObserving) destroyObserver();

      return canUseRefCleanup ? observerState.stop : undefined;
    },
    [
      Array.isArray(threshold) ? threshold.toString() : threshold,
      root,
      rootMargin,
      scrollMargin,
      trackVisibility,
      delay,
      fallbackInView,
      skip,
      triggerOnce,
    ],
  );
}
