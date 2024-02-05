import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { InView } from "../InView";
import { defaultFallbackInView } from "../observe";
import { intersectionMockInstance, mockAllIsIntersecting } from "../test-utils";

test("Should render <InView /> intersecting", () => {
  const callback = vi.fn();
  render(
    <InView onChange={callback}>
      {({ inView, ref }) => <div ref={ref}>{inView.toString()}</div>}
    </InView>,
  );

  mockAllIsIntersecting(false);
  expect(callback).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ isIntersecting: false }),
  );

  mockAllIsIntersecting(true);
  expect(callback).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({ isIntersecting: true }),
  );
});

test("should render plain children", () => {
  render(<InView>inner</InView>);
  screen.getByText("inner");
});

test("should render as element", () => {
  const { container } = render(<InView as="span">inner</InView>);
  const tagName = container.children[0].tagName.toLowerCase();
  expect(tagName).toBe("span");
});

test("should render with className", () => {
  const { container } = render(<InView className="inner-class">inner</InView>);
  expect(container.children[0].className).toBe("inner-class");
});

test("Should respect skip", () => {
  const cb = vi.fn();
  render(
    <InView skip onChange={cb}>
      inner
    </InView>,
  );
  mockAllIsIntersecting(true);

  expect(cb).not.toHaveBeenCalled();
});

test("Should handle initialInView", () => {
  const cb = vi.fn();
  render(
    <InView initialInView onChange={cb}>
      {({ inView }) => `InView: ${inView}`}
    </InView>,
  );
  screen.getByText("InView: true");
});

test("Should unobserve old node", () => {
  const { rerender } = render(
    <InView>
      {({ inView, ref }) => (
        <div key="1" ref={ref}>
          Inview: {inView.toString()}
        </div>
      )}
    </InView>,
  );
  rerender(
    <InView>
      {({ inView, ref }) => (
        <div key="2" ref={ref}>
          Inview: {inView.toString()}
        </div>
      )}
    </InView>,
  );
  mockAllIsIntersecting(true);
});

test("Should ensure node exists before observing and unobserving", () => {
  const { unmount } = render(<InView>{() => null}</InView>);
  unmount();
});

test("Should recreate observer when threshold change", () => {
  const { container, rerender } = render(<InView>Inner</InView>);
  mockAllIsIntersecting(true);
  const instance = intersectionMockInstance(container.children[0]);
  vi.spyOn(instance, "unobserve");

  rerender(<InView threshold={0.5}>Inner</InView>);
  expect(instance.unobserve).toHaveBeenCalled();
});

test("Should recreate observer when root change", () => {
  const { container, rerender } = render(<InView>Inner</InView>);
  mockAllIsIntersecting(true);
  const instance = intersectionMockInstance(container.children[0]);
  vi.spyOn(instance, "unobserve");

  const root = document.createElement("div");
  rerender(<InView root={root}>Inner</InView>);
  expect(instance.unobserve).toHaveBeenCalled();
});

test("Should recreate observer when rootMargin change", () => {
  const { container, rerender } = render(<InView>Inner</InView>);
  mockAllIsIntersecting(true);
  const instance = intersectionMockInstance(container.children[0]);
  vi.spyOn(instance, "unobserve");

  rerender(<InView rootMargin="10px">Inner</InView>);
  expect(instance.unobserve).toHaveBeenCalled();
});

test("Should unobserve when triggerOnce comes into view", () => {
  const { container } = render(<InView triggerOnce>Inner</InView>);
  mockAllIsIntersecting(false);
  const instance = intersectionMockInstance(container.children[0]);
  vi.spyOn(instance, "unobserve");
  mockAllIsIntersecting(true);

  expect(instance.unobserve).toHaveBeenCalled();
});

test("Should unobserve when unmounted", () => {
  const { container, unmount } = render(<InView triggerOnce>Inner</InView>);
  const instance = intersectionMockInstance(container.children[0]);

  vi.spyOn(instance, "unobserve");

  unmount();

  expect(instance.unobserve).toHaveBeenCalled();
});

test("plain children should not catch bubbling onChange event", () => {
  const onChange = vi.fn();
  const { getByLabelText } = render(
    <InView onChange={onChange}>
      <label>
        <input name="field" />
        input
      </label>
    </InView>,
  );
  const input = getByLabelText("input");
  fireEvent.change(input, { target: { value: "changed value" } });
  expect(onChange).not.toHaveBeenCalled();
});

test("should render with fallback", () => {
  const cb = vi.fn();
  // @ts-ignore
  window.IntersectionObserver = undefined;
  render(
    <InView fallbackInView={true} onChange={cb}>
      Inner
    </InView>,
  );
  expect(cb).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({ isIntersecting: true }),
  );

  render(
    <InView fallbackInView={false} onChange={cb}>
      Inner
    </InView>,
  );
  expect(cb).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ isIntersecting: false }),
  );

  expect(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<InView onChange={cb}>Inner</InView>);
    // @ts-ignore
    console.error.mockRestore();
  }).toThrowErrorMatchingInlineSnapshot(
    `[TypeError: IntersectionObserver is not a constructor]`,
  );
});

test("should render with global fallback", () => {
  const cb = vi.fn();
  // @ts-ignore
  window.IntersectionObserver = undefined;
  defaultFallbackInView(true);
  render(<InView onChange={cb}>Inner</InView>);
  expect(cb).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({ isIntersecting: true }),
  );

  defaultFallbackInView(false);
  render(<InView onChange={cb}>Inner</InView>);
  expect(cb).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ isIntersecting: false }),
  );

  defaultFallbackInView(undefined);
  expect(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<InView onChange={cb}>Inner</InView>);
    // @ts-ignore
    console.error.mockRestore();
  }).toThrowErrorMatchingInlineSnapshot(
    `[TypeError: IntersectionObserver is not a constructor]`,
  );
});
