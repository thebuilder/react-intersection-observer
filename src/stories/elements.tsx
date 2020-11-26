import React, { useEffect, useRef, useState } from 'react';
import { IntersectionOptions } from '../index';

type ScrollProps = {
  children: React.ReactNode;
  indicators?: 'all' | 'top' | 'bottom' | 'none';
};

export function useValidateOptions(options: IntersectionOptions) {
  try {
    new IntersectionObserver(() => {}, options);
  } catch (e) {
    return e.message.replace(
      "Failed to construct 'IntersectionObserver': ",
      '',
    );
  }

  return undefined;
}

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
    className="items-center bg-gradient-to-b border-purple-300 rounded-md border-4 flex flex-col from-purple-700 to-purple-500 justify-center my-16 p-8 text-blue-100 delay-100 duration-500 transition-opacity"
    {...rest}
  />
));

export function InViewIcon({ inView }: { inView: boolean }) {
  return inView ? (
    <div className="bg-green-600 border-green-400 rounded-full border-4 h-20 mb-8 p-2 w-20">
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
    </div>
  ) : (
    <div className="bg-yellow-600 border-yellow-400 rounded-full border-4 h-20 mb-8 p-2 w-20">
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
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
      {values.map((value) => (
        <div
          key={value}
          className="border-orange-600 border-dashed border-b-4 border-t-4 left-0 -mx-2 pointer-events-none absolute w-8"
          style={{
            top: `${(value > 0.5 ? 1 - value : value) * 100}%`,
            bottom: `${(value > 0.5 ? 1 - value : value) * 100}%`,
          }}
        />
      ))}
      {values.map((value) => (
        <div
          key={'right' + value}
          className="border-orange-600 border-dashed border-b-4 border-t-4 right-0 -mx-2 pointer-events-none absolute w-8"
          style={{
            top: `${(value > 0.5 ? 1 - value : value) * 100}%`,
            bottom: `${(value > 0.5 ? 1 - value : value) * 100}%`,
          }}
        />
      ))}
    </>
  );
}

export function EntryDetails({
  inView,
  entry,
}: {
  inView: boolean;
  entry?: IntersectionObserverEntry;
}) {
  const keyValues = [
    { key: 'inView', value: inView.toString() },
    { key: 'isIntersecting', value: entry?.isIntersecting.toString() },
    {
      key: 'isVisible',
      // @ts-ignore
      value: entry?.isVisible?.toString() ?? 'Not supported',
    },
    { key: 'intersectionRatio', value: entry?.intersectionRatio },
    {
      key: 'intersectionRect',
      value: <pre>{JSON.stringify(entry?.intersectionRect, null, 2)}</pre>,
    },
    {
      key: 'boundingClientRect',
      value: <pre>{JSON.stringify(entry?.boundingClientRect, null, 2)}</pre>,
    },
    {
      key: 'rootBounds',
      value: <pre>{JSON.stringify(entry?.rootBounds, null, 2)}</pre>,
    },
  ];

  return (
    <details className="px-4 w-full">
      <summary className="cursor-pointer">
        Show{' '}
        <code className="bg-gray-700 bg-opacity-50 px-2 py-1">
          IntersectionObserverEntry
        </code>{' '}
        details
      </summary>
      <dl className="mt-2">
        {keyValues.map(({ key, value }) => (
          <div
            key={key}
            className="bg-gray-100 even:bg-white px-2 py-3 sm:grid sm:gap-4 sm:grid-cols-3 sm:px-6"
          >
            <dt className="text-sm font-medium text-gray-500">{key}</dt>
            <dd className="font-mono text-sm mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
              {value ?? '-'}
            </dd>
          </div>
        ))}
      </dl>
    </details>
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
