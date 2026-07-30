import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { useInView } from "../useInView";

test("useInView renders on the server without diagnostics", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    function CompatibilityFixture() {
      const { ref, inView } = useInView();
      return createElement("div", { ref }, String(inView));
    }

    expect(renderToString(createElement(CompatibilityFixture))).toContain(
      ">false</div>",
    );
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});
