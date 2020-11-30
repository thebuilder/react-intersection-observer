import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { IntersectionOptions } from '../index';

type ScrollProps = {
  children: React.ReactNode;
  indicators?: 'all' | 'top' | 'bottom' | 'none';
};

export function ErrorMessage({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mx-auto my-8 max-w-4xl text-gray-900">
      <div className="bg-red-500 border-red-700 rounded-md border-2 px-8 py-4">
        <h2 className="text-xl font-bold">Invalid options</h2>
        {children}
      </div>
    </div>
  );
}

/**
 * ScrollWrapper directs the user to scroll the page to reveal it's children.
 * Use this on Modules that have scroll and/or observer triggers.
 */
export function ScrollWrapper({
  children,
  indicators = 'all',
  ...props
}: ScrollProps) {
  return (
    <div className="container mx-auto" {...props}>
      {indicators === 'top' || indicators === 'all' ? (
        <section className="sbdocs-hidden items-center bg-gradient-to-b border-indigo-300 rounded-lg border-4 flex flex-col from-blue-700 to-blue-500 h-screen justify-center text-center text-white">
          <h1 className="text-3xl font-bold my-4">Scroll down</h1>
          <svg
            className="animate-bounce h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </section>
      ) : null}
      <section className="relative">{children}</section>
      {indicators === 'bottom' || indicators === 'all' ? (
        <section
          className="sbdocs-hidden items-center bg-gradient-to-t border-indigo-300 rounded-lg border-4 flex from-blue-700 to-blue-500 h-screen justify-center text-white"
          style={{ height: '101vh' }}
        >
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </section>
      ) : null}
    </div>
  );
}

export const InViewBlock = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement> & { inView: boolean }
>(({ className, inView, ...rest }, ref) => (
  <div
    ref={ref}
    data-inview={inView}
    className="items-center bg-gradient-to-b border-purple-300 rounded-md border-4 flex flex-col from-purple-700 to-purple-500 justify-center my-16 p-8 text-blue-100"
    {...rest}
  />
));

export function InViewIcon({ inView }: { inView: boolean }) {
  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        key={inView ? 'inview' : 'outside'}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className={`rounded-full border-4 h-20 p-2 w-20 ${
          inView
            ? 'bg-green-600 border-green-400'
            : 'bg-yellow-600 border-yellow-400'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {inView ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          )}
        </svg>
      </motion.div>
      )
    </AnimatePresence>
  );
}

export function Status({ inView }: { inView: boolean }) {
  return (
    <div
      className={[
        'sbdocs-hidden group items-center bg-white rounded-lg shadow-md flex right-0 top-0 justify-center m-1 p-1 fixed z-10',
        inView ? 'bg-green-300 text-green-900' : 'bg-red-300 text-red-900',
      ].join(' ')}
    >
      <code className="group-hover:block hidden font-mono ml-2 mr-1">
        InView: {inView.toString()}
      </code>
      <span className="group-hover:hidden h-6 w-6">
        {inView ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            aria-label="Outside the viewport"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </span>
    </div>
  );
}

export function RootMargin({ rootMargin }: { rootMargin?: string }) {
  if (!rootMargin) return null;
  // Invert the root margin, so it correctly renders the outline
  const invertedRootMargin = rootMargin
    .split(' ')
    .map((val) => (val.charAt(0) === '-' ? val.substr(1) : '-' + val))
    .join(' ');

  return (
    <div
      className="border-orange-600 border-dashed border-b-4 border-t-4 pointer-events-none absolute"
      style={{ inset: invertedRootMargin }}
    />
  );
}

export function ThresholdMarker({
  threshold = 0,
}: {
  threshold?: number | number[];
}) {
  const values = Array.isArray(threshold) ? threshold : [threshold];
  return (
    <>
      {values.map((value) => {
        return (
          <div className="pointer-events-none" key={value}>
            <div
              className="bg-green-600 left-0 -mx-3 absolute w-2"
              style={{
                top: 0,
                bottom: `${value * 100}%`,
              }}
            />
            <div
              className="bg-red-600 left-0 -mx-3 absolute w-2"
              style={{
                top: `${(1 - value) * 100}%`,
                bottom: 0,
              }}
            />
            <div
              className="bg-green-600 right-0 -mx-3 absolute w-2"
              style={{
                bottom: 0,
                top: `${value * 100}%`,
              }}
            />
            <div
              className="bg-red-600 right-0 -mx-3 absolute w-2"
              style={{
                bottom: `${(1 - value) * 100}%`,
                top: 0,
              }}
            />
          </div>
        );
      })}
    </>
  );
}

export function EntryDetails({ options }: { options?: IntersectionOptions }) {
  if (!options || !Object.keys(options).length) return null;
  const value = JSON.stringify(
    { ...options, root: options.root ? 'Element' : undefined },
    null,
    2,
  );
  if (value === '{}') return null;

  return (
    <pre className="bg-gray-900 bg-opacity-50 mt-8 overflow-x-scroll p-2 text-purple-100 w-full">
      <code>{value}</code>
    </pre>
  );
}

type RootProps = {
  children: (node: HTMLDivElement) => React.ReactNode;
};

export function RootComponent(props: RootProps) {
  const node = useRef<HTMLDivElement | null>(null);
  const [, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-gray-500 bg-opacity-25 h-screen relative">
      <div ref={node} className="inset-0 mx-8 my-24 overflow-y-scroll absolute">
        {node.current ? props.children(node.current) : null}
      </div>
    </div>
  );
}
