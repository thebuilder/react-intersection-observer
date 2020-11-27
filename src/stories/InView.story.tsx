import * as React from 'react';
import { CSSProperties } from 'react';
import { action } from '@storybook/addon-actions';
import { Meta, Story } from '@storybook/react';
import { IntersectionOptions, InView } from '../index';
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
import { useValidateOptions } from './story-utils';

type Props = IntersectionOptions & {
  style?: CSSProperties;
  className?: string;
};

const story: Meta = {
  title: 'InView Component',
  component: InView,
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
    tag: {
      table: {
        disable: true,
      },
    },
  },
};

export default story;

const Template: Story<Props> = ({ style, className, ...rest }) => {
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
};

const RootTemplate: Story<Props> = (props) => {
  return (
    <RootComponent>
      {(node) => <Template {...props} root={node} />}
    </RootComponent>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  threshold: 0,
};

export const WithRootMargin = Template.bind({});
WithRootMargin.args = {
  rootMargin: '25px 0px',
  threshold: 0,
};

export const StartInView = Template.bind({});
StartInView.args = {
  threshold: 0,
  initialInView: true,
};

export const TallerThanViewport = Template.bind({});
TallerThanViewport.args = {
  threshold: 0,
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
  threshold: [0, 0.25, 0.5, 0.75, 1],
};

export const TriggerOnce = Template.bind({});
TriggerOnce.args = {
  threshold: 0,
  triggerOnce: true,
};

export const Skip = Template.bind({});
Skip.args = {
  threshold: 1,
  skip: true,
};

export const WithRoot = RootTemplate.bind({});
WithRoot.args = {
  threshold: 0,
};

export const WithRootAndRootMargin = RootTemplate.bind({});
WithRootAndRootMargin.args = {
  rootMargin: '25px 0px',
  threshold: 0,
};

export const multipleObservers = () => (
  <ScrollWrapper>
    <InView threshold={0.25}>
      {({ ref, inView, entry }) => (
        <>
          <InViewBlock ref={ref} inView={inView}>
            <InViewIcon inView={inView} />
          </InViewBlock>
        </>
      )}
    </InView>
    <InView threshold={0.25}>
      {({ ref, inView, entry }) => (
        <>
          <InViewBlock ref={ref} inView={inView}>
            <InViewIcon inView={inView} />
          </InViewBlock>
        </>
      )}
    </InView>
    <InView threshold={0.25}>
      {({ ref, inView, entry }) => (
        <>
          <InViewBlock ref={ref} inView={inView}>
            <InViewIcon inView={inView} />
          </InViewBlock>
        </>
      )}
    </InView>
  </ScrollWrapper>
);
