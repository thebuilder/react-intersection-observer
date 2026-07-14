import { act, render, screen } from "@testing-library/react";
import React, { useCallback } from "react";
import { defaultFallbackInView, type IntersectionOptions } from "../index";
import {
  destroyIntersectionMocking,
  intersectionMockInstance,
  mockAllIsIntersecting,
  mockIsIntersecting,
} from "../test-utils";
import { useInView } from "../useInView";

const HookComponent = ({
  options,
  unmount,
}: {
  options?: IntersectionOptions;
  unmount?: boolean;
}) => {
  const [ref, inView] = useInView(options);
  return (
    <div data-testid="wrapper" ref={!unmount ? ref : undefined}>
      {inView.toString()}
    </div>
  );
};

const observerInstances = () =>
  vi
    .mocked(window.IntersectionObserver)
    .mock.results.map((result) => result.value as IntersectionObserver);

const UseInViewLifecycleProbe = ({
  onChange,
  onRender,
  options,
  target = "a",
}: {
  onChange?: IntersectionOptions["onChange"];
  onRender?: () => void;
  options?: IntersectionOptions;
  target?: "a" | "b" | null;
}) => {
  onRender?.();
  const [ref, inView] = useInView({ ...options, onChange });

  return (
    <>
      <div
        data-testid="lifecycle-a"
        data-inview={inView.toString()}
        ref={target === "a" ? ref : undefined}
      />
      <div
        data-testid="lifecycle-b"
        data-inview={inView.toString()}
        ref={target === "b" ? ref : undefined}
      />
    </>
  );
};

const LazyHookComponent = ({ options }: { options?: IntersectionOptions }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);
  const [ref, inView] = useInView(options);
  if (isLoading) return <div>Loading</div>;
  return (
    <div data-testid="wrapper" ref={ref}>
      {inView.toString()}
    </div>
  );
};

test("should create a hook", () => {
  const { getByTestId } = render(<HookComponent />);
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test("should create a hook with array threshold", () => {
  const { getByTestId } = render(
    <HookComponent options={{ threshold: [0.1, 1] }} />,
  );
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test("should create a hook with scrollMargin", () => {
  const { getByTestId } = render(
    <HookComponent options={{ scrollMargin: "10px" }} />,
  );
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  expect(instance).toHaveProperty("scrollMargin", "10px");
});

test("should create a lazy hook", () => {
  const { getByTestId } = render(<LazyHookComponent />);
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test("should create a hook inView", () => {
  const { getByText } = render(<HookComponent />);
  mockAllIsIntersecting(true);

  getByText("true");
});

test("should mock thresholds", () => {
  render(<HookComponent options={{ threshold: [0.5, 1] }} />);
  mockAllIsIntersecting(0.2);
  screen.getByText("false");
  mockAllIsIntersecting(0.5);
  screen.getByText("true");
  mockAllIsIntersecting(1);
  screen.getByText("true");
});

test("should create a hook with initialInView", () => {
  const { getByText } = render(
    <HookComponent options={{ initialInView: true }} />,
  );
  getByText("true");
  mockAllIsIntersecting(false);
  getByText("false");
});

test("should trigger a hook leaving view", () => {
  const { getByText } = render(<HookComponent />);
  mockAllIsIntersecting(true);
  mockAllIsIntersecting(false);
  getByText("false");
});

test("should respect trigger once", () => {
  const { getByText } = render(
    <HookComponent options={{ triggerOnce: true }} />,
  );
  mockAllIsIntersecting(true);
  mockAllIsIntersecting(false);

  getByText("true");
});

test("should respect the threshold before triggering once", () => {
  const { getByTestId, getByText } = render(
    <HookComponent
      options={{ initialInView: true, threshold: 0.5, triggerOnce: true }}
    />,
  );
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);
  const callback = vi.mocked(window.IntersectionObserver).mock.calls[0][0];
  const createEntry = (
    intersectionRatio: number,
  ): IntersectionObserverEntry => ({
    boundingClientRect: wrapper.getBoundingClientRect(),
    intersectionRatio,
    intersectionRect: wrapper.getBoundingClientRect(),
    isIntersecting: true,
    rootBounds: null,
    target: wrapper,
    time: performance.now(),
  });

  act(() => callback([createEntry(0.25)], instance));

  getByText("false");
  expect(instance.unobserve).not.toHaveBeenCalled();

  act(() => callback([createEntry(0.5)], instance));

  getByText("true");
  expect(instance.unobserve).toHaveBeenCalledTimes(1);
});

test("should trigger onChange", () => {
  const onChange = vi.fn();
  render(<HookComponent options={{ onChange }} />);

  mockAllIsIntersecting(false);
  expect(onChange).not.toHaveBeenCalled();

  mockAllIsIntersecting(true);
  expect(onChange).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({ intersectionRatio: 1, isIntersecting: true }),
  );

  mockAllIsIntersecting(false);
  expect(onChange).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ intersectionRatio: 0, isIntersecting: false }),
  );
});

test("should respect skip", () => {
  const { getByText, rerender } = render(
    <HookComponent options={{ skip: true }} />,
  );
  mockAllIsIntersecting(false);
  getByText("false");

  rerender(<HookComponent options={{ skip: false }} />);
  mockAllIsIntersecting(true);
  getByText("true");
});

test("should not reset current state if changing skip", () => {
  const { getByText, rerender } = render(
    <HookComponent options={{ skip: false }} />,
  );
  mockAllIsIntersecting(true);
  rerender(<HookComponent options={{ skip: true }} />);
  getByText("true");
});

test("should unmount the hook", () => {
  const { unmount, getByTestId } = render(<HookComponent />);
  const wrapper = getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);
  unmount();
  expect(instance.unobserve).toHaveBeenCalledWith(wrapper);
});

test("inView should be false when component is unmounted", () => {
  const { rerender, getByText } = render(<HookComponent />);
  mockAllIsIntersecting(true);

  getByText("true");
  rerender(<HookComponent unmount />);
  getByText("false");
});

test("should handle trackVisibility", () => {
  render(<HookComponent options={{ trackVisibility: true, delay: 100 }} />);
  mockAllIsIntersecting(true);
});

test("should handle trackVisibility when unsupported", () => {
  render(<HookComponent options={{ trackVisibility: true, delay: 100 }} />);
});

const SwitchHookComponent = ({
  options,
  toggle,
  unmount,
}: {
  options?: IntersectionOptions;
  toggle?: boolean;
  unmount?: boolean;
}) => {
  const [ref, inView] = useInView(options);
  return (
    <>
      <div
        data-testid="item-1"
        data-inview={(!toggle && inView).toString()}
        ref={!toggle && !unmount ? ref : undefined}
      />
      <div
        data-testid="item-2"
        data-inview={(!!toggle && inView).toString()}
        ref={toggle && !unmount ? ref : undefined}
      />
    </>
  );
};

/**
 * This is a test for the case where people move the ref around (please don't)
 */
test("should handle ref removed", () => {
  const { rerender, getByTestId } = render(<SwitchHookComponent />);
  mockAllIsIntersecting(true);

  const item1 = getByTestId("item-1");
  const item2 = getByTestId("item-2");

  // Item1 should be inView
  expect(item1.getAttribute("data-inview")).toBe("true");
  expect(item2.getAttribute("data-inview")).toBe("false");

  rerender(<SwitchHookComponent toggle />);
  mockAllIsIntersecting(true);

  // Item2 should be inView
  expect(item1.getAttribute("data-inview")).toBe("false");
  expect(item2.getAttribute("data-inview")).toBe("true");

  rerender(<SwitchHookComponent unmount />);

  // Nothing should be inView
  expect(item1.getAttribute("data-inview")).toBe("false");
  expect(item2.getAttribute("data-inview")).toBe("false");

  // Add the ref back
  rerender(<SwitchHookComponent />);
  mockAllIsIntersecting(true);
  expect(item1.getAttribute("data-inview")).toBe("true");
  expect(item2.getAttribute("data-inview")).toBe("false");
});

const MergeRefsComponent = ({ options }: { options?: IntersectionOptions }) => {
  const [inViewRef, inView] = useInView(options);
  const setRef = useCallback(
    (node: Element | null) => {
      inViewRef(node);
    },
    [inViewRef],
  );

  return <div data-testid="inview" data-inview={inView} ref={setRef} />;
};

test("should handle ref merged", () => {
  const { rerender, getByTestId } = render(<MergeRefsComponent />);
  mockAllIsIntersecting(true);
  rerender(<MergeRefsComponent />);

  expect(getByTestId("inview").getAttribute("data-inview")).toBe("true");
});

const MultipleHookComponent = ({
  options,
}: {
  options?: IntersectionOptions;
}) => {
  const [ref1, inView1] = useInView(options);
  const [ref2, inView2] = useInView(options);
  const [ref3, inView3] = useInView();

  const mergedRefs = useCallback(
    (node: Element | null) => {
      ref1(node);
      ref2(node);
      ref3(node);
    },
    [ref1, ref2, ref3],
  );

  return (
    <div ref={mergedRefs}>
      <div data-testid="item-1" data-inview={inView1}>
        {inView1}
      </div>
      <div data-testid="item-2" data-inview={inView2}>
        {inView2}
      </div>
      <div data-testid="item-3" data-inview={inView3}>
        {inView3}
      </div>
    </div>
  );
};

test("should handle multiple hooks on the same element", () => {
  const { getByTestId } = render(
    <MultipleHookComponent options={{ threshold: 0.1 }} />,
  );
  mockAllIsIntersecting(true);
  expect(getByTestId("item-1").getAttribute("data-inview")).toBe("true");
  expect(getByTestId("item-2").getAttribute("data-inview")).toBe("true");
  expect(getByTestId("item-3").getAttribute("data-inview")).toBe("true");
});

test("should handle thresholds missing on observer instance", () => {
  render(<HookComponent options={{ threshold: [0.1, 1] }} />);
  const wrapper = screen.getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);
  // @ts-expect-error
  instance.thresholds = undefined;
  mockAllIsIntersecting(true);

  screen.getByText("true");
});

test("should handle thresholds missing on observer instance with no threshold set", () => {
  render(<HookComponent />);
  const wrapper = screen.getByTestId("wrapper");
  const instance = intersectionMockInstance(wrapper);
  // @ts-expect-error
  instance.thresholds = undefined;
  mockAllIsIntersecting(true);

  screen.getByText("true");
});

const HookComponentWithEntry = ({
  options,
  unmount,
}: {
  options?: IntersectionOptions;
  unmount?: boolean;
}) => {
  const { ref, entry } = useInView(options);
  return (
    <div data-testid="wrapper" ref={!unmount ? ref : undefined}>
      {entry && Object.entries(entry).map(([key, value]) => `${key}: ${value}`)}
    </div>
  );
};

test("should set intersection ratio as the largest threshold smaller than trigger", () => {
  render(
    <HookComponentWithEntry options={{ threshold: [0, 0.25, 0.5, 0.75, 1] }} />,
  );
  const wrapper = screen.getByTestId("wrapper");

  mockIsIntersecting(wrapper, 0.5);
  screen.getByText(/intersectionRatio: 0.5/);
});

test("useInView Strict Mode leaves no observer or React diagnostic", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  try {
    const { unmount } = render(
      <React.StrictMode>
        <UseInViewLifecycleProbe />
      </React.StrictMode>,
    );

    unmount();

    expect(observerInstances().length).toBeGreaterThan(0);
    for (const observer of observerInstances()) {
      expect(observer.observe).toHaveBeenCalledTimes(1);
      expect(observer.unobserve).toHaveBeenCalledTimes(1);
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    }
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  } finally {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  }
});

test("should handle fallback if unsupported", () => {
  destroyIntersectionMocking();
  // @ts-expect-error
  window.IntersectionObserver = undefined;
  const { rerender } = render(
    <HookComponent options={{ fallbackInView: true }} />,
  );
  screen.getByText("true");

  rerender(<HookComponent options={{ fallbackInView: false }} />);
  screen.getByText("false");

  expect(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    rerender(<HookComponent options={{ fallbackInView: undefined }} />);
    // @ts-expect-error
    console.error.mockRestore();
  }).toThrowErrorMatchingInlineSnapshot(
    `[TypeError: IntersectionObserver is not a constructor]`,
  );
});

test("should handle defaultFallbackInView if unsupported", () => {
  destroyIntersectionMocking();
  // @ts-expect-error
  window.IntersectionObserver = undefined;
  defaultFallbackInView(true);
  const { rerender } = render(<HookComponent key="true" />);
  screen.getByText("true");

  defaultFallbackInView(false);
  rerender(<HookComponent key="false" />);
  screen.getByText("false");

  defaultFallbackInView(undefined);
  expect(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    rerender(<HookComponent key="undefined" />);
    // @ts-expect-error
    console.error.mockRestore();
  }).toThrowErrorMatchingInlineSnapshot(
    `[TypeError: IntersectionObserver is not a constructor]`,
  );
});

test("should restore the browser IntersectionObserver", () => {
  expect(vi.isMockFunction(window.IntersectionObserver)).toBe(true);
  destroyIntersectionMocking();

  // This should restore the original IntersectionObserver
  expect(window.IntersectionObserver).toBeDefined();
  expect(vi.isMockFunction(window.IntersectionObserver)).toBe(false);
});

test("should trigger all hooks when using triggerOnce with merged refs", () => {
  const MultipleHooksWithTriggerOnce = () => {
    const [ref1, inView1] = useInView({ triggerOnce: true });
    const [ref2, inView2] = useInView({ triggerOnce: true });
    const [ref3, inView3] = useInView({ triggerOnce: true });

    const setRefs = useCallback(
      (node: Element | null) => {
        ref1(node);
        ref2(node);
        ref3(node);
      },
      [ref1, ref2, ref3],
    );

    return (
      <div ref={setRefs}>
        <div data-testid="item-1" data-inview={inView1.toString()}>
          {inView1.toString()}
        </div>
        <div data-testid="item-2" data-inview={inView2.toString()}>
          {inView2.toString()}
        </div>
        <div data-testid="item-3" data-inview={inView3.toString()}>
          {inView3.toString()}
        </div>
      </div>
    );
  };

  const { getByTestId } = render(<MultipleHooksWithTriggerOnce />);

  mockAllIsIntersecting(true);

  expect(getByTestId("item-1").getAttribute("data-inview")).toBe("true");
  expect(getByTestId("item-2").getAttribute("data-inview")).toBe("true");
  expect(getByTestId("item-3").getAttribute("data-inview")).toBe("true");
});

test("mounting useInView does not cause an attachment rerender", () => {
  const onRender = vi.fn();
  const onCommit = vi.fn();

  render(
    <React.Profiler id="useInView" onRender={onCommit}>
      <UseInViewLifecycleProbe onRender={onRender} />
    </React.Profiler>,
  );

  expect(onRender).toHaveBeenCalledTimes(1);
  expect(onCommit).toHaveBeenCalledTimes(1);
  expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
});

test("useInView does not churn for equal threshold arrays", () => {
  const { rerender } = render(
    <UseInViewLifecycleProbe options={{ threshold: [0.25, 0.75] }} />,
  );
  const target = screen.getByTestId("lifecycle-a");
  const observer = intersectionMockInstance(target);

  rerender(<UseInViewLifecycleProbe options={{ threshold: [0.25, 0.75] }} />);

  expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
  expect(observer.observe).toHaveBeenCalledTimes(1);
  expect(observer.unobserve).not.toHaveBeenCalled();
  expect(observer.disconnect).not.toHaveBeenCalled();
});

test("useInView replaces the observer exactly once when options change", () => {
  const { rerender } = render(
    <UseInViewLifecycleProbe options={{ threshold: 0.25 }} />,
  );
  const target = screen.getByTestId("lifecycle-a");
  const firstObserver = intersectionMockInstance(target);

  rerender(<UseInViewLifecycleProbe options={{ threshold: 0.75 }} />);
  const secondObserver = intersectionMockInstance(target);

  expect(firstObserver.unobserve).toHaveBeenCalledTimes(1);
  expect(firstObserver.unobserve).toHaveBeenCalledWith(target);
  expect(firstObserver.disconnect).toHaveBeenCalledTimes(1);
  expect(secondObserver).not.toBe(firstObserver);
  expect(secondObserver.observe).toHaveBeenCalledTimes(1);
  expect(secondObserver.observe).toHaveBeenCalledWith(target);
  expect(window.IntersectionObserver).toHaveBeenCalledTimes(2);
});

test("useInView resets only while detached across A to B to detached to A", () => {
  const { rerender } = render(<UseInViewLifecycleProbe target="a" />);
  const targetA = screen.getByTestId("lifecycle-a");
  const targetB = screen.getByTestId("lifecycle-b");
  const firstObserver = intersectionMockInstance(targetA);

  mockIsIntersecting(targetA, true);
  expect(targetA).toHaveAttribute("data-inview", "true");

  rerender(<UseInViewLifecycleProbe target="b" />);
  const secondObserver = intersectionMockInstance(targetB);
  expect(targetB).toHaveAttribute("data-inview", "true");
  expect(firstObserver.unobserve).toHaveBeenCalledTimes(1);
  expect(secondObserver.observe).toHaveBeenCalledWith(targetB);

  mockIsIntersecting(targetB, true);
  rerender(<UseInViewLifecycleProbe target={null} />);
  expect(targetA).toHaveAttribute("data-inview", "false");
  expect(targetB).toHaveAttribute("data-inview", "false");
  expect(secondObserver.unobserve).toHaveBeenCalledTimes(1);

  rerender(<UseInViewLifecycleProbe target="a" />);
  const thirdObserver = intersectionMockInstance(targetA);
  expect(targetA).toHaveAttribute("data-inview", "false");
  expect(thirdObserver.observe).toHaveBeenCalledTimes(1);
  expect(thirdObserver.observe).toHaveBeenCalledWith(targetA);
});

test("useInView uses the latest onChange without recreating its observer", () => {
  const firstOnChange = vi.fn();
  const secondOnChange = vi.fn();
  const { rerender } = render(
    <UseInViewLifecycleProbe onChange={firstOnChange} />,
  );
  const target = screen.getByTestId("lifecycle-a");
  const observer = intersectionMockInstance(target);

  mockIsIntersecting(target, true);
  rerender(<UseInViewLifecycleProbe onChange={secondOnChange} />);
  mockIsIntersecting(target, false);

  expect(firstOnChange).toHaveBeenCalledTimes(1);
  expect(firstOnChange).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({ target }),
  );
  expect(secondOnChange).toHaveBeenCalledTimes(1);
  expect(secondOnChange).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ target }),
  );
  expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
  expect(observer.observe).toHaveBeenCalledTimes(1);
  expect(observer.unobserve).not.toHaveBeenCalled();
});

test("useInView skip toggles retain visibility and attach exactly once", () => {
  const { rerender } = render(
    <UseInViewLifecycleProbe options={{ skip: false }} />,
  );
  const target = screen.getByTestId("lifecycle-a");
  const firstObserver = intersectionMockInstance(target);

  mockIsIntersecting(target, true);
  rerender(<UseInViewLifecycleProbe options={{ skip: true }} />);
  expect(target).toHaveAttribute("data-inview", "true");
  expect(firstObserver.unobserve).toHaveBeenCalledTimes(1);
  expect(firstObserver.disconnect).toHaveBeenCalledTimes(1);

  rerender(<UseInViewLifecycleProbe options={{ skip: false }} />);
  const secondObserver = intersectionMockInstance(target);
  expect(target).toHaveAttribute("data-inview", "true");
  expect(secondObserver.observe).toHaveBeenCalledTimes(1);

  rerender(<UseInViewLifecycleProbe options={{ skip: true }} target={null} />);
  expect(target).toHaveAttribute("data-inview", "true");
  expect(secondObserver.unobserve).toHaveBeenCalledTimes(1);
  expect(secondObserver.disconnect).toHaveBeenCalledTimes(1);
});
