import { useInView, useOnInView } from "react-intersection-observer";

function CompatibilityFixture() {
  const callbackRef = useOnInView(() => {});
  const { ref: stateRef } = useInView();

  return (
    <>
      <div ref={callbackRef} />
      <div ref={stateRef} />
    </>
  );
}

window.__COMPAT_FIXTURE__ = CompatibilityFixture;
