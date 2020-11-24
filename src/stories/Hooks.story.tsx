import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { IntersectionOptions, useInView } from '../index';
import ScrollWrapper from './ScrollWrapper';
import Status from './Status';
import { motion } from 'framer-motion';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';

type Props = {
  className?: string;
  children?: React.ReactNode;
  options?: IntersectionOptions;
  lazy?: boolean;
  style?: CSSProperties;
};

const story: Meta = {
  title: 'useInView Hook',
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
      <div
        ref={ref}
        data-inview={inView}
        className={[
          'flex text-center text-blue-100 items-center flex-col justify-center py-24 bg-blue-700 transition-opacity duration-500 delay-200',
          inView ? 'opacity-100' : 'opacity-50',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        <h2 className="font-sans text-4xl">
          {children || 'Inside the viewport'}: {inView.toString()}
        </h2>
        {options?.trackVisibility && (
          <h2>
            {/* @ts-ignore */}
            {'Fully visible'}: {entry?.isVisible.toString()}
          </h2>
        )}
      </div>
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
    <HookComponent style={{ height: '150vh' }} />
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
    <HookComponent options={{ threshold: 1 }} style={{ height: '150vh' }}>
      Header is fully inside the viewport
    </HookComponent>
  </ScrollWrapper>
);

export const multipleThresholds = () => (
  <ScrollWrapper>
    <HookComponent
      options={{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      style={{ height: '150vh' }}
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
    <div ref={ref} className="my-4">
      <div className="text-center p-4 relative max-w-prose mx-auto my-0 text-white">
        <h2 className="font-bold text-2xl">Track Visibility</h2>
        <p className="my-4 leading-normal">
          Use the new IntersectionObserver v2 to track if the object is visible.
          Try dragging the box on top of it. If the feature is unsupported, it
          will always return `isVisible`.
        </p>
        <motion.div
          drag
          dragElastic={0.2}
          dragConstraints={ref}
          className="px-4 py-2 left-1/2 cursor-move inline-block bg-green-500 rounded-md "
        >
          Drag me
        </motion.div>
      </div>
      <HookComponent options={{ trackVisibility: true, delay: 100 }} />
      <div style={{ height: '50vh' }} />
    </div>
  );
};
