import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import {
  type IntersectionEffectOptions,
  type IntersectionOptions,
  useOnInView,
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

type Props = IntersectionEffectOptions;

type Story = StoryObj<Props>;

function getOptionsKey(options: IntersectionEffectOptions | undefined) {
  if (!options) return "disabled";

  const { threshold, rootMargin, trackVisibility, delay, triggerOnce, skip } =
    options;

  return JSON.stringify({
    threshold,
    rootMargin,
    trackVisibility,
    delay,
    triggerOnce,
    skip,
  });
}

function getEventLabel(isInView: boolean, time: number) {
  const action = isInView ? "Entered" : "Left";
  if (!Number.isFinite(time)) return `${action} viewport`;
  if (time < 0) return `${action} viewport`;
  return `${action} viewport at ${(time / 1000).toFixed(2)}s`;
}

function EventLog({ events }: { events: string[] }) {
  return (
    <div className="mt-6 w-full max-w-md text-left">
      <h3 className="mb-2 text-lg font-semibold text-white">Event log</h3>
      <div className="max-h-48 overflow-y-auto rounded-md bg-gray-900 bg-opacity-40 p-3 text-sm">
        {events.length === 0 ? (
          <p className="text-gray-200">
            Scroll this element in and out of view to trigger the callback.
          </p>
        ) : (
          <ul className="space-y-2 text-purple-100">
            {events.map((event, index) => (
              <li key={`${event}-${index.toString()}`}>{event}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SkippedObserverMessage({ skip }: { skip: boolean | undefined }) {
  if (!skip) return null;

  return (
    <p className="mt-4 text-sm text-yellow-200">
      Observing is currently skipped. Toggle `skip` off to monitor the element.
    </p>
  );
}

const meta = {
  title: "useOnInView Hook",
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    ...argTypes,
  },
  args: {
    threshold: 0,
    triggerOnce: false,
    skip: false,
  },
  render: UseOnInViewRender,
} satisfies Meta<Props>;

export default meta;

function UseOnInViewRender(rest: Props) {
  const { options, error } = useValidateOptions(rest as IntersectionOptions);

  const { onChange, initialInView, fallbackInView, ...observerOptions } =
    options;

  const effectOptions: IntersectionEffectOptions | undefined = error
    ? undefined
    : observerOptions;

  const [inView, setInView] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const optionsKey = getOptionsKey(effectOptions);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when options change
  useEffect(() => {
    setEvents([]);
    setInView(false);
  }, [optionsKey]);

  const ref = useOnInView((isInView, entry) => {
    setInView(isInView);
    setEvents((prev) => [...prev, getEventLabel(isInView, entry.time)]);
  }, effectOptions);

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <ScrollWrapper indicators="all">
      <Status inView={inView} />
      <InViewBlock ref={ref} inView={inView}>
        <InViewIcon inView={inView} />
        <EntryDetails options={effectOptions} />
        <EventLog events={events} />
        <SkippedObserverMessage skip={effectOptions?.skip} />
      </InViewBlock>
      <ThresholdMarker threshold={effectOptions?.threshold} />
      <RootMargin rootMargin={effectOptions?.rootMargin} />
    </ScrollWrapper>
  );
}

export const Basic: Story = {
  args: {},
};

export const TriggerOnce: Story = {
  args: {
    triggerOnce: true,
  },
};

export const SkipObserver: Story = {
  args: {
    skip: true,
  },
};
