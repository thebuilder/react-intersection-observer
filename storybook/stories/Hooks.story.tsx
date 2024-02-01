import { Meta, StoryObj } from "@storybook/react";
import { motion } from "framer-motion";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import {
  InView,
  IntersectionOptions,
  useInView,
} from "react-intersection-observer";
import {
  EntryDetails,
  ErrorMessage,
  InViewBlock,
  InViewIcon,
  RootMargin,
  ScrollWrapper,
  Status,
  ThresholdMarker,
} from "./elements";
import { argTypes, useValidateOptions } from "./story-utils";

type Props = IntersectionOptions & {
  style?: CSSProperties;
  className?: string;
  lazy?: boolean;
  inlineRef?: boolean;
};

type Story = StoryObj<Props>;

export default {
  title: "useInView Hook",
  component: InView,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    ...argTypes,
    style: { table: { disable: true } },
    className: { table: { disable: true } },
    lazy: { table: { disable: true } },
    inlineRef: { table: { disable: true } },
  },
  args: {
    threshold: 0,
  },
  render: HooksRender,
} satisfies Meta<Props>;

function HooksRender({ style, className, lazy, inlineRef, ...rest }: Props) {
  const { options, error } = useValidateOptions(rest);
  const { ref, inView } = useInView(!error ? { ...options } : {});
  const [isLoading, setIsLoading] = useState(lazy);

  useEffect(() => {
    if (isLoading) setIsLoading(false);
  }, [isLoading]);

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollWrapper indicators={options.initialInView ? "bottom" : "all"}>
      <Status inView={inView} />
      <InViewBlock
        ref={inlineRef ? (node) => ref(node) : ref}
        inView={inView}
        style={style}
      >
        <InViewIcon inView={inView} />
        <EntryDetails options={options} />
      </InViewBlock>
      <ThresholdMarker threshold={options.threshold} />
      <RootMargin rootMargin={options.rootMargin} />
    </ScrollWrapper>
  );
}

export const Basic: Story = {
  args: {},
};

export const LazyHookRendering: Story = {
  args: { lazy: true },
};

export const InlineRef: Story = {
  args: {
    inlineRef: true,
  },
};

export const StartInView: Story = {
  args: {
    initialInView: true,
  },
};

export const WithRootMargin: Story = {
  args: {
    initialInView: true,
    rootMargin: "25px 0px",
  },
};

export const TallerThanViewport: Story = {
  args: {
    style: { minHeight: "150vh" },
  },
};

export const WithThreshold100percentage: Story = {
  args: {
    initialInView: true,
    threshold: 1,
  },
};

export const WithThreshold50percentage: Story = {
  args: {
    initialInView: true,
    threshold: 0.5,
  },
};

export const TallerThanViewportWithThreshold100percentage: Story = {
  args: {
    threshold: 1,
    style: { minHeight: "150vh" },
  },
};

export const MultipleThresholds: Story = {
  args: {
    threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
  },
  argTypes: {
    threshold: {
      control: { type: "array" },
    },
  },
};

export const TriggerOnce: Story = {
  args: {
    triggerOnce: true,
  },
};

export const Skip: Story = {
  args: {
    initialInView: true,
    skip: true,
  },
};

const VisibilityTemplate = (props: Props) => {
  const { options, error } = useValidateOptions(props);
  const ref = useRef<HTMLDivElement>(null);
  const { entry, inView, ref: inViewRef } = useInView(options);

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <div ref={ref} className="container mx-auto my-4">
      <div className="relative mx-auto my-8 max-w-3xl rounded-md bg-gray-800 p-4 text-center text-white">
        <h2 className="text-2xl font-bold">Track Visibility</h2>
        <p className="my-4 leading-normal">
          Use the new IntersectionObserver v2 to track if the object is visible.
          Try dragging the box on top of it. If the feature is unsupported, it
          will always return `isVisible`.
        </p>
        <motion.div
          drag
          dragElastic={0.2}
          dragConstraints={ref}
          className="left-1/2 inline-block cursor-move rounded-md bg-green-500 px-4 py-2 font-bold"
        >
          Drag me
        </motion.div>
      </div>
      <InViewBlock ref={inViewRef} inView={inView} className="my-4">
        {/* @ts-ignore */}
        <InViewIcon inView={entry?.isVisible} />
        <EntryDetails options={options} />
      </InViewBlock>
    </div>
  );
};

export const TrackVisibility: Story = {
  render: VisibilityTemplate,
  args: {
    trackVisibility: true,
    delay: 100,
  },
};
