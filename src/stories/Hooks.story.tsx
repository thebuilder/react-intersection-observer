/** @jsx jsx */
import { jsx } from '@emotion/react';
import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { IntersectionOptions, useInView } from '../index';
import ScrollWrapper from './ScrollWrapper';
import Status from './Status';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  className?: string;
  children?: React.ReactNode;
  options?: IntersectionOptions;
  lazy?: boolean;
};

const story: Meta = {
  title: 'useInView hook',
};

export default story;

const HookComponent = ({
  options,
  className,
  children,
  lazy,
  ...rest
}: Props) => {
  const { ref, inView, entry } = useInView(options);
  const [isLoading, setIsLoading] = useState(lazy);
  action('Inview')(inView, entry);

  useEffect(() => {
    if (isLoading) setIsLoading(false);
  }, [isLoading, lazy]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <Status inView={inView} />
      <motion.div
        ref={ref}
        animate={{ opacity: inView ? 1 : 0.5 }}
        data-inview={inView}
        className={className}
        css={{
          display: 'flex',
          minHeight: '25vh',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          background: '#148bb4',
          color: 'azure',
        }}
        {...rest}
      >
        <h2>
          {children || 'Inside the viewport'}: {inView.toString()}
        </h2>
        {options?.trackVisibility && (
          <h2>
            {/* @ts-ignore */}
            {'Fully visible'}: {entry?.isVisible.toString()}
          </h2>
        )}
      </motion.div>
    </React.Fragment>
  );
};

export const basic = () => (
  <ScrollWrapper>
    <HookComponent />
  </ScrollWrapper>
);

export const lazyHookRendering = () => (
  <ScrollWrapper>
    <HookComponent lazy />
  </ScrollWrapper>
);

export const startInView = () => (
  <HookComponent options={{ initialInView: true }} />
);

export const tallerThanViewport = () => (
  <ScrollWrapper>
    <HookComponent css={{ height: '150vh' }} />
  </ScrollWrapper>
);

export const withThreshold100percentage = () => (
  <ScrollWrapper>
    <HookComponent options={{ threshold: 1 }}>
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
);
export const withThreshold50percentage = () => (
  <ScrollWrapper>
    <HookComponent options={{ threshold: 0.5 }}>
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
);

export const tallerThanViewportWithThreshold100percentage = () => (
  <ScrollWrapper>
    <HookComponent options={{ threshold: 1 }} css={{ height: '150vh' }}>
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
);

export const multipleThresholds = () => (
  <ScrollWrapper>
    <HookComponent
      options={{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      css={{ height: '150vh' }}
    >
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
);

export const triggerOnce = () => (
  <ScrollWrapper>
    <HookComponent options={{ triggerOnce: true }} />
  </ScrollWrapper>
);

export const skip = () => (
  <ScrollWrapper>
    <HookComponent options={{ skip: true }} />
  </ScrollWrapper>
);

export const TrackVisibility = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} css={{ margin: '0 1rem' }}>
      <div
        css={{
          color: 'white',
          padding: '1rem',
          position: 'relative',
          textAlign: 'center',
          maxWidth: '80ch',
          margin: '0 auto',
        }}
      >
        <h2>Track Visibility</h2>
        <p
          css={{
            lineHeight: 1.4,
          }}
        >
          Use the new IntersectionObserver v2 to track if the object is visible.
          Try dragging the box on top of it. If the feature is unsupported, it
          will always return `isVisible`.
        </p>
        <motion.div
          drag
          dragElastic={0.2}
          dragConstraints={ref}
          css={{
            display: 'inline-block',
            background: '#8bc34a',
            padding: '1rem',
            borderRadius: 5,
            cursor: 'move',
            left: '50%',
          }}
        >
          Drag me
        </motion.div>
      </div>
      <HookComponent options={{ trackVisibility: true, delay: 100 }} />
      <div css={{ height: '50vh' }} />
    </div>
  );
};
