import { createRequire } from "node:module";
import { createElement } from "react";
import { useInView } from "react-intersection-observer";

const { renderToString } = createRequire(import.meta.url)("react-dom/server");

const errors: string[] = [];
const originalError = console.error;
console.error = (...arguments_: unknown[]) =>
  errors.push(arguments_.map(String).join(" "));

try {
  function CompatibilityFixture() {
    const { ref, inView } = useInView();
    return createElement("div", { ref }, String(inView));
  }

  renderToString(createElement(CompatibilityFixture));
} finally {
  console.error = originalError;
}

if (errors.length > 0) {
  throw new Error(`SSR produced console errors:\n${errors.join("\n")}`);
}
