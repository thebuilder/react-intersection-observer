import { useInView, useOnInView } from "react-intersection-observer";

const diagnostics = [];
let observeCount = 0;
let unobserveCount = 0;

console.error = (...args) => diagnostics.push(args.join(" "));
console.warn = (...args) => diagnostics.push(args.join(" "));

window.IntersectionObserver = class IntersectionObserver {
  observe() {
    observeCount += 1;
  }

  unobserve() {
    unobserveCount += 1;
  }

  disconnect() {}
};

export function CompatibilityFixture({ attached }) {
  const callbackRef = useOnInView(() => {});
  const { ref: stateRef } = useInView();

  return attached ? (
    <>
      <div ref={callbackRef} />
      <div ref={stateRef} />
    </>
  ) : null;
}

export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

export function result() {
  return { diagnostics, observeCount, unobserveCount };
}
