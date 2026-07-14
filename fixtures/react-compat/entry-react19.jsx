import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { CompatibilityFixture, result, settle } from "./scenario";

const container = document.getElementById("root");
const root = createRoot(container);

async function run() {
  flushSync(() => root.render(<CompatibilityFixture attached />));
  await settle();
  flushSync(() => root.render(<CompatibilityFixture attached={false} />));
  await settle();
  flushSync(() => root.render(<CompatibilityFixture attached />));
  await settle();
  flushSync(() => root.unmount());
  await settle();

  window.__COMPAT_RESULT__ = result();
}

run();
