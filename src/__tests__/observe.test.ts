import { observe } from "../";
import { optionsToId } from "../observe";
import { intersectionMockInstance, mockIsIntersecting } from "../test-utils";

test("should be able to use observe", () => {
  const element = document.createElement("div");
  const cb = vi.fn();
  const unmount = observe(element, cb, { threshold: 0.1 });

  mockIsIntersecting(element, true);
  expect(cb).toHaveBeenCalled();

  // should be unmounted after unmount
  unmount();
  expect(() =>
    intersectionMockInstance(element),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Failed to find IntersectionObserver for element. Is it being observed?]`,
  );
});

test("should only clean up each observer callback once", () => {
  const element = document.createElement("div");
  const firstCallback = vi.fn();
  const secondCallback = vi.fn();
  const firstCleanup = observe(element, firstCallback, { threshold: 0.1 });
  const secondCleanup = observe(element, secondCallback, { threshold: 0.1 });
  const observer = intersectionMockInstance(element);

  firstCleanup();
  firstCleanup();
  mockIsIntersecting(element, true);

  expect(firstCallback).not.toHaveBeenCalled();
  expect(secondCallback).toHaveBeenCalledTimes(1);
  expect(observer.unobserve).not.toHaveBeenCalled();

  secondCleanup();
  expect(observer.unobserve).toHaveBeenCalledTimes(1);
  expect(observer.unobserve).toHaveBeenCalledWith(element);
  expect(observer.disconnect).toHaveBeenCalledTimes(1);

  secondCleanup();
  expect(observer.unobserve).toHaveBeenCalledTimes(1);
  expect(observer.disconnect).toHaveBeenCalledTimes(1);
});

test("should convert options to id", () => {
  expect(
    optionsToId({
      root: document.createElement("div"),
      rootMargin: "10px 10px",
      threshold: [0, 1],
    }),
  ).toMatchInlineSnapshot(`"root_1,rootMargin_10px 10px,threshold_0,1"`);
  expect(
    optionsToId({
      root: null,
      rootMargin: "10px 10px",
      threshold: 1,
    }),
  ).toMatchInlineSnapshot(`"root_0,rootMargin_10px 10px,threshold_1"`);
  expect(
    optionsToId({
      threshold: 0,
      trackVisibility: true,
      delay: 500,
    }),
  ).toMatchInlineSnapshot(`"delay_500,threshold_0,trackVisibility_true"`);
  expect(
    optionsToId({
      threshold: 0,
    }),
  ).toMatchInlineSnapshot(`"threshold_0"`);
  expect(
    optionsToId({
      scrollMargin: "10px 20px",
      threshold: [0, 0.5, 1],
    }),
  ).toMatchInlineSnapshot(`"scrollMargin_10px 20px,threshold_0,0.5,1"`);
});
