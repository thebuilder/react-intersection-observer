import { render } from "@testing-library/react";
import React, { useCallback } from "react";
import type { IntersectionListenerOptions } from "../index";
import { intersectionMockInstance, mockAllIsIntersecting } from "../test-utils";
import { useOnInViewChanged } from "../useOnInViewChanged";

const OnInViewChangedComponent = ({
  options,
  unmount,
}: {
  options?: IntersectionListenerOptions;
  unmount?: boolean;
}) => {
  const [inView, setInView] = React.useState(false);
  const [callCount, setCallCount] = React.useState(0);
  const [cleanupCount, setCleanupCount] = React.useState(0);

  const inViewRef = useOnInViewChanged((entry) => {
    setInView(entry ? entry.isIntersecting : false);
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
  options?: IntersectionListenerOptions;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const inViewRef = useOnInViewChanged((entry) => {
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
  options?: IntersectionListenerOptions;
  unmount?: boolean;
}) => {
  const [callCount, setCallCount] = React.useState(0);
  const inViewRef = useOnInViewChanged(() => {
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

test("should create a hook with useOnInViewChanged", () => {
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

test("should create a lazy hook with useOnInViewChanged", () => {
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

test("should call callback with initialInView", () => {
  const { getByTestId } = render(
    <OnInViewChangedComponent options={{ initialInView: true }} />,
  );
  const wrapper = getByTestId("wrapper");

  // initialInView should have triggered the callback once
  expect(wrapper.getAttribute("data-call-count")).toBe("1");

  mockAllIsIntersecting(false);
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
}: { options?: IntersectionListenerOptions }) => {
  const [inView, setInView] = React.useState(false);

  const inViewRef = useOnInViewChanged((entry) => {
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
}: { options?: IntersectionListenerOptions }) => {
  const [inView1, setInView1] = React.useState(false);
  const [inView2, setInView2] = React.useState(false);
  const [inView3, setInView3] = React.useState(false);

  const ref1 = useOnInViewChanged((entry) => {
    setInView1(entry ? entry.isIntersecting : false);
    return () => setInView1(false);
  }, options);

  const ref2 = useOnInViewChanged((entry) => {
    setInView2(entry ? entry.isIntersecting : false);
    return () => setInView2(false);
  }, options);

  const ref3 = useOnInViewChanged((entry) => {
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
    const inViewRef = useOnInViewChanged((entry) => {
      capturedElement = entry?.target;
      return undefined;
    });

    return <div data-testid="element-test" ref={inViewRef} />;
  };

  const { getByTestId } = render(<ElementTestComponent />);
  const element = getByTestId("element-test");
  mockAllIsIntersecting(true);

  expect(capturedElement).toBe(element);
});
