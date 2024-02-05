import { ArgTypes } from "@storybook/react";
import type { IntersectionOptions } from "react-intersection-observer";

export const argTypes: ArgTypes<IntersectionOptions> = {
  root: {
    table: { disable: true },
    description:
      "The IntersectionObserver interface's read-only `root` property identifies the Element or Document whose bounds are treated as the bounding box of the viewport for the element which is the observer's target. If the `root` is null, then the bounds of the actual document viewport are used.",
  },
  rootMargin: {
    control: { type: "text" },
    description:
      "Margin around the root. Can have values similar to the CSS margin property, e.g. `10px 20px 30px 40px` (top, right, bottom, left).",
    defaultValue: "0px",
  },
  threshold: {
    control: {
      type: "range",
      min: 0,
      max: 1,
      step: 0.05,
    },
    description:
      "Number between `0` and `1` indicating the percentage that should be visible before triggering. Can also be an `array` of numbers, to create multiple trigger points.",
  },
  triggerOnce: {
    control: { type: "boolean" },
    description: "Only trigger the inView callback once",
  },
  skip: {
    control: { type: "boolean" },
    description: "Skip assigning the observer to the `ref`",
  },
  initialInView: {
    control: { type: "boolean" },
    description:
      "Set the initial value of the `inView` boolean. This can be used if you expect the element to be in the viewport to start with, and you want to trigger something when it leaves.",
  },
  fallbackInView: {
    control: { type: "boolean" },
    description:
      "Fallback to this inView state if the IntersectionObserver is unsupported, and a polyfill wasn't loaded",
  },
  trackVisibility: {
    control: { type: "boolean" },
    description:
      "IntersectionObserver v2 - Track the actual visibility of the element",
  },
  delay: {
    control: { type: "number" },
    description:
      "IntersectionObserver v2 - Set a minimum delay between notifications",
  },
  onChange: {
    table: { disable: true },
    action: "InView",
  },
};

export function getRoot(options: IntersectionOptions) {
  if (options.rootMargin && !options.root && window.self !== window.top) {
    return document as unknown as Element;
  }
  return options.root;
}

export function useValidateOptions(options: IntersectionOptions) {
  const finalOptions = { root: getRoot(options), ...options };
  // @ts-ignore
  finalOptions.as = undefined;
  if (!finalOptions.root) finalOptions.root = undefined;

  let error = undefined;
  try {
    new IntersectionObserver(() => {}, finalOptions);
  } catch (e) {
    if (e instanceof Error) {
      error = e.message.replace(
        "Failed to construct 'IntersectionObserver': ",
        "",
      );
    }
  }

  return { options: finalOptions, error };
}
