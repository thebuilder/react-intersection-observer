import * as React from "react";
import type { IntersectionObserverInitWithOptions } from "./index";
import { observe } from "./observe";

const useSyncEffect =
  Reflect.get(React, "useInsertionEffect") || React.useLayoutEffect;

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
  const observerStateRef = React.useRef<
    [
      TElement | null,
      (() => void) | undefined,
      ((element?: TElement | null) => void) | null,
    ]
  >([null, undefined, null]);

  useSyncEffect(() => {
    onIntersectionChangeRef.current = onIntersectionChange;
  }, [onIntersectionChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Threshold arrays are normalized inside the callback
  return React.useCallback(
    function setRef(element: TElement | undefined | null) {
      const observerState = observerStateRef.current;

      if (!element && observerState[2] !== setRef) {
        return;
      }

      if (element === observerState[0]) {
        observerState[2] = setRef;
        return canUseRefCleanup ? observerState[1] : undefined;
      }

      const cleanup = observerState[1];
      observerState[1] = undefined;
      cleanup?.();

      if (!element || skip) {
        observerState[0] = null;
        observerState[2] = element ? setRef : null;
        return;
      }

      observerState[0] = element;
      observerState[2] = setRef;

      let destroyObserver: (() => void) | undefined;
      let previousInView: boolean | undefined;

      function stopObserving() {
        destroyObserver?.();

        if (observerState[1] === stopObserving) {
          observerState[0] = null;
          observerState[1] = undefined;
        }
      }

      observerState[1] = stopObserving;
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

      if (observerState[1] !== stopObserving) destroyObserver();

      return canUseRefCleanup ? observerState[1] : undefined;
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
