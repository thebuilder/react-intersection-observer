import * as React from 'react';
import { CSSProperties } from 'react';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { IntersectionOptions, InView } from 'react-intersection-observer';
import {
  EntryDetails,
  InViewBlock,
  InViewIcon,
  RootComponent,
  Status,
  ScrollWrapper,
  ThresholdMarker,
  ErrorMessage,
  RootMargin,
} from './elements';
import { argTypes, useValidateOptions } from './story-utils';

type Props = IntersectionOptions & {
  style?: CSSProperties;
  className?: string;
};

type Story = StoryObj<Props>;

export default {
  title: 'InView Component',
  component: InView,
  argTypes: {
    ...argTypes,
    style: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: InViewRender,
} satisfies Meta<Props>;

function InViewRender({ style, className, ...rest }: Props) {
  const { options, error } = useValidateOptions(rest);
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <ScrollWrapper indicators={options.initialInView ? 'bottom' : 'all'}>
      <InView onChange={action('InView')} {...options}>
        {({ ref, inView, entry }) => (
          <>
            <Status inView={inView} />
            <InViewBlock ref={ref} inView={inView} style={style}>
              <InViewIcon inView={inView} />
              <EntryDetails options={options} />
            </InViewBlock>
            <ThresholdMarker threshold={options.threshold} />
            <RootMargin rootMargin={options.rootMargin} />
          </>
        )}
      </InView>
    </ScrollWrapper>
  );
}

export const Basic: Story = {
  args: {
    threshold: 0,
  },
};

export const WithRootMarginexport: Story = {
  args: {
    rootMargin: '25px 0px',
    threshold: 0,
  },
};

export const StartInView: Story = {
  args: {
    threshold: 0,
    initialInView: true,
  },
};

export const TallerThanViewport: Story = {
  args: {
    threshold: 0,
    style: { minHeight: '150vh' },
  },
};

export const WithThreshold100percentage: Story = {
  args: {
    threshold: 1,
  },
};

export const WithThreshold50percentage: Story = {
  args: {
    threshold: 0.5,
  },
};

export const TallerThanViewportWithThreshold100percentage: Story = {
  args: {
    threshold: 1,
    style: { minHeight: '150vh' },
  },
};

export const MultipleThresholds: Story = {
  args: {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  },
  argTypes: {
    threshold: {
      control: { type: 'array' },
    },
  },
};

export const TriggerOnce: Story = {
  args: {
    threshold: 0,
    triggerOnce: true,
  },
};

export const Skip: Story = {
  args: {
    threshold: 1,
    skip: true,
  },
};

export const WithRoot: Story = {
  args: {
    threshold: 0,
  },
  render: (props) => (
    <RootComponent>
      {(node) => <InViewRender {...props} root={node} />}
    </RootComponent>
  ),
};
export const WithRootAndRootMargin: Story = {
  args: {
    rootMargin: '25px 0px',
    threshold: 0,
  },
  render: (props) => (
    <RootComponent>
      {(node) => <InViewRender {...props} root={node} />}
    </RootComponent>
  ),
};

export const multipleObservers = () => (
  <ScrollWrapper>
    <InView threshold={0.25}>
      {({ ref, inView }) => (
        <>
          <InViewBlock ref={ref} inView={inView}>
            <InViewIcon inView={inView} />
          </InViewBlock>
        </>
      )}
    </InView>
    <InView threshold={0.25}>
      {({ ref, inView }) => (
        <>
          <InViewBlock ref={ref} inView={inView}>
            <InViewIcon inView={inView} />
          </InViewBlock>
        </>
      )}
    </InView>
    <InView threshold={0.25}>
      {({ ref, inView }) => (
        <>
          <InViewBlock ref={ref} inView={inView}>
            <InViewIcon inView={inView} />
          </InViewBlock>
        </>
      )}
    </InView>
  </ScrollWrapper>
);
