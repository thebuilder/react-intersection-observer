import { render } from "@testing-library/react";
import React, { useCallback } from "react";
import type { IntersectionEffectOptions } from "..";
import { intersectionMockInstance, mockAllIsIntersecting } from "../test-utils";
import { useOnInView } from "../useOnInView";

const OnInViewChangedComponent = ({
  options,
  unmount,
}: {
  options?: IntersectionEffectOptions;
  unmount?: boolean;
}) => {
  const [inView, setInView] = React.useState(false);
  const [callCount, setCallCount] = React.useState(0);
  const [cleanupCount, setCleanupCount] = React.useState(0);

  const inViewRef = useOnInView((entry) => {
    setInView(entry.isIntersecting);
    setCallCount((prev) => prev + 1);
    // Return cleanup function
    return (cleanupEntry) => {
      setCleanupCount((prev) => prev + 1);
      if (cleanupEntry) {
        setInView(false);
      }
    };
  }, options);

  return (
    <div
      data-testid="wrapper"
      ref={!unmount ? inViewRef : undefined}
      data-inview={inView.toString()}
      data-call-count={callCount}
      data-cleanup-count={cleanupCount}
    >
      {inView.toString()}
    </div>
  );
};

const LazyOnInViewChangedComponent = ({
  options,
}: {
  options?: IntersectionEffectOptions;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const inViewRef = useOnInView((entry) => {
    setInView(entry ? entry.isIntersecting : false);
    return () => setInView(false);
  }, options);

  if (isLoading) return <div>Loading</div>;

  return (
    <div data-testid="wrapper" ref={inViewRef} data-inview={inView.toString()}>
      {inView.toString()}
    </div>
  );
};

const OnInViewChangedComponentWithoutClenaup = ({
  options,
  unmount,
}: {
  options?: IntersectionEffectOptions;
  unmount?: boolean;
}) => {
  const [callCount, setCallCount] = React.useState(0);
  const inViewRef = useOnInView(() => {
    setCallCount((prev) => prev + 1);
  }, options);

  return (
    <div
      data-testid="wrapper-no-cleanup"
      ref={!unmount ? inViewRef : undefined}
      data-call-count={callCount}
    />
  );
};

const ThresholdTriggerComponent = ({
  options,
}: {
  options?: IntersectionEffectOptions;
}) => {
  const [triggerCount, setTriggerCount] = React.useState(0);
  const [cleanupCount, setCleanupCount] = React.useState(0);
  const [lastRatio, setLastRatio] = React.useState<number | null>(null);
  const [triggeredThresholds, setTriggeredThresholds] = React.useState<
    number[]
  >([]);

  const inViewRef = useOnInView((entry) => {
    setTriggerCount((prev) => prev + 1);
    setLastRatio(entry.intersectionRatio);

    // Add this ratio to our list of triggered thresholds
    setTriggeredThresholds((prev) => [...prev, entry.intersectionRatio]);

    return (exitEntry) => {
      setCleanupCount((prev) => prev + 1);
      if (exitEntry) {
        setLastRatio(exitEntry.intersectionRatio);
      }
    };
  }, options);

  return (
    <div
      data-testid="threshold-trigger"
      ref={inViewRef}
      data-trigger-count={triggerCount}
      data-cleanup-count={cleanupCount}
      data-last-ratio={lastRatio !== null ? lastRatio.toFixed(2) : "null"}
      data-triggered-thresholds={JSON.stringify(triggeredThresholds)}
    >
      Tracking thresholds
    </div>
  );
};

test("should create a hook with useOnInView", () => {
  const { getByTestId } = render(<OnInViewChangedComponent />);
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test("should create a hook with array threshold", () => {
  const { getByTestId } = render(
    <OnInViewChangedComponent options={{ threshold: [0.1, 1] }} />,
  );
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test("should create a lazy hook with useOnInView", () => {
  const { getByTestId } = render(<LazyOnInViewChangedComponent />);
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test("should call the callback when element comes into view", () => {
  const { getByTestId } = render(<OnInViewChangedComponent />);
  mockAllIsIntersecting(true);

  const wrapper = getByTestId("wrapper");
  expect(wrapper.getAttribute("data-inview")).toBe("true");
  expect(wrapper.getAttribute("data-call-count")).toBe("1");
});

test("should call cleanup when element leaves view", () => {
  const { getByTestId } = render(<OnInViewChangedComponent />);
  mockAllIsIntersecting(true);
  mockAllIsIntersecting(false);

  const wrapper = getByTestId("wrapper");
  expect(wrapper.getAttribute("data-inview")).toBe("false");
  expect(wrapper.getAttribute("data-cleanup-count")).toBe("1");
});

test("should respect threshold values", () => {
  const { getByTestId } = render(
    <OnInViewChangedComponent options={{ threshold: [0.5, 1] }} />,
  );
  const wrapper = getByTestId("wrapper");

  mockAllIsIntersecting(0.2);
  expect(wrapper.getAttribute("data-inview")).toBe("false");

  mockAllIsIntersecting(0.5);
  expect(wrapper.getAttribute("data-inview")).toBe("true");

  mockAllIsIntersecting(1);
  expect(wrapper.getAttribute("data-inview")).toBe("true");
});

test("should call callback with trigger: leave", () => {
  const { getByTestId } = render(
    <OnInViewChangedComponent options={{ trigger: "leave" }} />,
  );
  const wrapper = getByTestId("wrapper");

  mockAllIsIntersecting(false);
  // Should call callback
  expect(wrapper.getAttribute("data-call-count")).toBe("1");

  mockAllIsIntersecting(true);
  // Should call cleanup
  expect(wrapper.getAttribute("data-cleanup-count")).toBe("1");
});

test("should call callback with trigger: leave and triggerOnce is true", () => {
  const { getByTestId } = render(
    <OnInViewChangedComponent
      options={{ trigger: "leave", triggerOnce: true }}
    />,
  );
  const wrapper = getByTestId("wrapper");

  mockAllIsIntersecting(true);
  // the callback should not be called as it is triggered on leave
  expect(wrapper.getAttribute("data-call-count")).toBe("0");

  mockAllIsIntersecting(false);
  // Should call callback
  expect(wrapper.getAttribute("data-call-count")).toBe("1");

  mockAllIsIntersecting(true);
  // Should call cleanup
  expect(wrapper.getAttribute("data-cleanup-count")).toBe("1");
});

test("should respect triggerOnce option", () => {
  const { getByTestId } = render(
    <>
      <OnInViewChangedComponent />
      <OnInViewChangedComponentWithoutClenaup options={{ triggerOnce: true }} />
    </>,
  );
  const wrapper = getByTestId("wrapper");
  const wrapperTriggerOnce = getByTestId("wrapper-no-cleanup");

  mockAllIsIntersecting(true);
  expect(wrapper.getAttribute("data-call-count")).toBe("1");
  expect(wrapperTriggerOnce.getAttribute("data-call-count")).toBe("1");
  mockAllIsIntersecting(false);
  expect(wrapper.getAttribute("data-cleanup-count")).toBe("1");
  mockAllIsIntersecting(true);
  expect(wrapper.getAttribute("data-call-count")).toBe("2");
  expect(wrapperTriggerOnce.getAttribute("data-call-count")).toBe("1");
});

test("should respect skip option", () => {
  const { getByTestId, rerender } = render(
    <OnInViewChangedComponent options={{ skip: true }} />,
  );
  mockAllIsIntersecting(true);

  const wrapper = getByTestId("wrapper");
  expect(wrapper.getAttribute("data-inview")).toBe("false");
  expect(wrapper.getAttribute("data-call-count")).toBe("0");

  rerender(<OnInViewChangedComponent options={{ skip: false }} />);
  mockAllIsIntersecting(true);

  expect(wrapper.getAttribute("data-inview")).toBe("true");
  expect(wrapper.getAttribute("data-call-count")).toBe("1");
});

test("should handle unmounting properly", () => {
  const { unmount, getByTestId } = render(<OnInViewChangedComponent />);
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  unmount();
  expect(instance.unobserve).toHaveBeenCalledWith(wrapper);
});

test("should handle ref changes", () => {
  const { rerender, getByTestId } = render(<OnInViewChangedComponent />);
  mockAllIsIntersecting(true);

  rerender(<OnInViewChangedComponent unmount />);

  // Component should clean up when ref is removed
  const wrapper = getByTestId("wrapper");
  expect(wrapper.getAttribute("data-cleanup-count")).toBe("1");

  // Add the ref back
  rerender(<OnInViewChangedComponent />);
  mockAllIsIntersecting(true);

  expect(wrapper.getAttribute("data-inview")).toBe("true");
});

// Test for merging refs
const MergeRefsComponent = ({
  options,
}: { options?: IntersectionEffectOptions }) => {
  const [inView, setInView] = React.useState(false);

  const inViewRef = useOnInView((entry) => {
    setInView(entry ? entry.isIntersecting : false);
    return () => setInView(false);
  }, options);

  const setRef = useCallback(
    (node: Element | null) => inViewRef(node),
    [inViewRef],
  );

  return (
    <div data-testid="inview" data-inview={inView.toString()} ref={setRef} />
  );
};

test("should handle merged refs", () => {
  const { rerender, getByTestId } = render(<MergeRefsComponent />);
  mockAllIsIntersecting(true);
  rerender(<MergeRefsComponent />);

  expect(getByTestId("inview").getAttribute("data-inview")).toBe("true");
});

// Test multiple callbacks on the same element
const MultipleCallbacksComponent = ({
  options,
}: { options?: IntersectionEffectOptions }) => {
  const [inView1, setInView1] = React.useState(false);
  const [inView2, setInView2] = React.useState(false);
  const [inView3, setInView3] = React.useState(false);

  const ref1 = useOnInView((entry) => {
    setInView1(entry ? entry.isIntersecting : false);
    return () => setInView1(false);
  }, options);

  const ref2 = useOnInView((entry) => {
    setInView2(entry ? entry.isIntersecting : false);
    return () => setInView2(false);
  }, options);

  const ref3 = useOnInView((entry) => {
    setInView3(entry ? entry.isIntersecting : false);
    return () => setInView3(false);
  });

  const mergedRefs = useCallback(
    (node: Element | null) => {
      const cleanup = [ref1(node), ref2(node), ref3(node)];
      return () => cleanup.forEach((fn) => fn?.());
    },
    [ref1, ref2, ref3],
  );

  return (
    <div ref={mergedRefs}>
      <div data-testid="item-1" data-inview={inView1}>
        {inView1.toString()}
      </div>
      <div data-testid="item-2" data-inview={inView2}>
        {inView2.toString()}
      </div>
      <div data-testid="item-3" data-inview={inView3}>
        {inView3.toString()}
      </div>
    </div>
  );
};

test("should handle multiple callbacks on the same element", () => {
  const { getByTestId } = render(
    <MultipleCallbacksComponent options={{ threshold: 0.1 }} />,
  );
  mockAllIsIntersecting(true);

  expect(getByTestId("item-1").getAttribute("data-inview")).toBe("true");
  expect(getByTestId("item-2").getAttribute("data-inview")).toBe("true");
  expect(getByTestId("item-3").getAttribute("data-inview")).toBe("true");
});

test("should pass the element to the callback", () => {
  let capturedElement: Element | undefined;

  const ElementTestComponent = () => {
    const inViewRef = useOnInView((entry) => {
      capturedElement = entry.target;
      return undefined;
    });

    return <div data-testid="element-test" ref={inViewRef} />;
  };

  const { getByTestId } = render(<ElementTestComponent />);
  const element = getByTestId("element-test");
  mockAllIsIntersecting(true);

  expect(capturedElement).toBe(element);
});

test("should track which threshold triggered the visibility change", () => {
  // Using multiple specific thresholds
  const { getByTestId } = render(
    <ThresholdTriggerComponent options={{ threshold: [0.25, 0.5, 0.75] }} />,
  );
  const element = getByTestId("threshold-trigger");

  // Initially not in view
  expect(element.getAttribute("data-trigger-count")).toBe("0");

  // Trigger at exactly the first threshold (0.25)
  mockAllIsIntersecting(0.25);
  expect(element.getAttribute("data-trigger-count")).toBe("1");
  expect(element.getAttribute("data-last-ratio")).toBe("0.25");

  // Go out of view
  mockAllIsIntersecting(0);

  // Trigger at exactly the second threshold (0.5)
  mockAllIsIntersecting(0.5);
  expect(element.getAttribute("data-trigger-count")).toBe("2");
  expect(element.getAttribute("data-last-ratio")).toBe("0.50");

  // Go out of view
  mockAllIsIntersecting(0);

  // Trigger at exactly the third threshold (0.75)
  mockAllIsIntersecting(0.75);
  expect(element.getAttribute("data-trigger-count")).toBe("3");
  expect(element.getAttribute("data-last-ratio")).toBe("0.75");

  // Check all triggered thresholds were recorded
  const triggeredThresholds = JSON.parse(
    element.getAttribute("data-triggered-thresholds") || "[]",
  );
  expect(triggeredThresholds).toContain(0.25);
  expect(triggeredThresholds).toContain(0.5);
  expect(triggeredThresholds).toContain(0.75);
});

test("should track thresholds when crossing multiple in a single update", () => {
  // Using multiple specific thresholds
  const { getByTestId } = render(
    <ThresholdTriggerComponent options={{ threshold: [0.2, 0.4, 0.6, 0.8] }} />,
  );
  const element = getByTestId("threshold-trigger");

  // Initially not in view
  expect(element.getAttribute("data-trigger-count")).toBe("0");

  // Jump straight to 0.7 (crosses 0.2, 0.4, 0.6 thresholds)
  // The IntersectionObserver will still only call the callback once
  // with the highest threshold that was crossed
  mockAllIsIntersecting(0.7);
  expect(element.getAttribute("data-trigger-count")).toBe("1");
  expect(element.getAttribute("data-cleanup-count")).toBe("0");
  expect(element.getAttribute("data-last-ratio")).toBe("0.60");

  // Go out of view
  mockAllIsIntersecting(0);
  expect(element.getAttribute("data-cleanup-count")).toBe("1");

  // Jump to full visibility
  mockAllIsIntersecting(0.5);
  expect(element.getAttribute("data-trigger-count")).toBe("2");
  expect(element.getAttribute("data-last-ratio")).toBe("0.40");

  // Jump to full visibility
  mockAllIsIntersecting(1.0);
  expect(element.getAttribute("data-trigger-count")).toBe("3");
  expect(element.getAttribute("data-cleanup-count")).toBe("2");
  expect(element.getAttribute("data-last-ratio")).toBe("0.80");
});

test("should track thresholds when trigger is set to leave", () => {
  // Using multiple specific thresholds with trigger: leave
  const { getByTestId } = render(
    <ThresholdTriggerComponent
      options={{
        threshold: [0.25, 0.5, 0.75],
        trigger: "leave",
      }}
    />,
  );
  const element = getByTestId("threshold-trigger");

  // Make element 30% visible - above first threshold, should call cleanup
  mockAllIsIntersecting(0);
  expect(element.getAttribute("data-trigger-count")).toBe("1");
  expect(element.getAttribute("data-last-ratio")).toBe("0.00");
});
