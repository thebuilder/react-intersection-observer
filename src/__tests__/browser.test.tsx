import React from "react";
import { render } from "vitest-browser-react";
import type { IntersectionOptions } from "../index";
import { useInView } from "../useInView";

/**
 * Test the real Intersection Observer API, without using the mocked version from `test-utils`
 * @param options
 * @constructor
 */

const HookComponent = ({ options }: { options?: IntersectionOptions }) => {
  const [ref, inView] = useInView(options);

  return (
    <div
      ref={ref}
      data-testid="wrapper"
      style={{ height: 200, background: "cyan" }}
      data-inview={inView}
    >
      InView block
    </div>
  );
};

test("should come into view on after rendering", async () => {
  const screen = render(<HookComponent />);
  const wrapper = screen.getByTestId("wrapper");
  await expect.element(wrapper).toHaveAttribute("data-inview", "true");
});

test("should come into view after scrolling", async () => {
  const screen = render(
    <>
      <div style={{ height: window.innerHeight }} />
      <HookComponent />
      <div style={{ height: window.innerHeight }} />
    </>,
  );
  const wrapper = screen.getByTestId("wrapper");

  // Should not be inside the view
  await expect.element(wrapper).toHaveAttribute("data-inview", "false");

  // Scroll so the element comes into view
  window.scrollTo(0, window.innerHeight);
  // Should not be updated until intersection observer triggers
  await expect.element(wrapper).toHaveAttribute("data-inview", "false");

  await expect.element(wrapper).toHaveAttribute("data-inview", "true");
});
