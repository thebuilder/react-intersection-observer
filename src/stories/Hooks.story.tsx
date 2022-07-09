import { action } from '@storybook/addon-actions';
import { Meta, Story } from '@storybook/react';
import { IntersectionOptions, InView, useInView } from '../index';
import { motion } from 'framer-motion';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import {
  EntryDetails,
  InViewBlock,
  InViewIcon,
  Status,
  ScrollWrapper,
  ThresholdMarker,
  RootMargin,
  ErrorMessage,
} from './elements';
import {
  ArgsTable,
  Description,
  Primary,
  PRIMARY_STORY,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs';
import { useValidateOptions } from './story-utils';

type Props = IntersectionOptions & {
  style?: CSSProperties;
  className?: string;
  lazy?: boolean;
  inlineRef?: boolean;
};

const story: Meta = {
  title: 'useInView Hook',
  component: InView,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <ArgsTable
            story={PRIMARY_STORY}
            exclude={['children', 'as', 'onChange']}
          />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    rootMargin: { control: { type: 'text' } },
    threshold: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
    },
    root: {
      table: {
        disable: true,
      },
    },
    children: {
      table: {
        disable: true,
      },
    },
    as: {
      table: {
        disable: true,
      },
    },
    onChange: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    threshold: 0,
  },
};

export default story;

const Template: Story<Props> = ({
  style,
  className,
  lazy,
  inlineRef,
  ...rest
}) => {
  const { options, error } = useValidateOptions(rest);
  const { ref, inView, entry } = useInView(!error ? options : {});
  const [isLoading, setIsLoading] = useState(lazy);
  action('InView')(inView, entry);

  useEffect(() => {
    if (isLoading) setIsLoading(false);
  }, [isLoading, lazy]);

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollWrapper indicators={options.initialInView ? 'bottom' : 'all'}>
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
};

export const Basic = Template.bind({});
Basic.args = {};

export const LazyHookRendering = Template.bind({});
LazyHookRendering.args = {
  lazy: true,
};

export const InlineRef = Template.bind({});
InlineRef.args = {
  inlineRef: true,
};

export const StartInView = Template.bind({});
StartInView.args = {
  initialInView: true,
};

export const WithRootMargin = Template.bind({});
WithRootMargin.args = {
  rootMargin: '25px 0px',
};

export const TallerThanViewport = Template.bind({});
TallerThanViewport.args = {
  style: { minHeight: '150vh' },
};

export const WithThreshold100percentage = Template.bind({});
WithThreshold100percentage.args = {
  threshold: 1,
};

export const WithThreshold50percentage = Template.bind({});
WithThreshold50percentage.args = {
  threshold: 0.5,
};

export const TallerThanViewportWithThreshold100percentage = Template.bind({});
TallerThanViewportWithThreshold100percentage.args = {
  threshold: 1,
  style: { minHeight: '150vh' },
};

export const MultipleThresholds = Template.bind({});
MultipleThresholds.args = {
  threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
};
MultipleThresholds.argTypes = {
  threshold: {
    control: { type: 'array' },
  },
};

export const TriggerOnce = Template.bind({});
TriggerOnce.args = {
  triggerOnce: true,
};

export const Skip = Template.bind({});
Skip.args = {
  skip: true,
};

const VisibilityTemplate: Story<IntersectionOptions> = (args) => {
  const { options, error } = useValidateOptions(args);
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

export const TrackVisibility = VisibilityTemplate.bind({});
TrackVisibility.args = {
  trackVisibility: true,
  delay: 100,
};
