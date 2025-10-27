import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";
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

type Props = IntersectionEffectOptions & {
  trigger?: NonNullable<IntersectionEffectOptions["trigger"]>;
};

type Story = StoryObj<Props>;

const meta = {
  title: "useOnInView Hook",
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    ...argTypes,
    trigger: {
      control: { type: "inline-radio" },
      options: ["enter", "leave"],
      description:
        'Trigger the callback when the element enters ("enter") or leaves ("leave") the viewport.',
    },
  },
  args: {
    threshold: 0,
    trigger: "enter",
    triggerOnce: false,
    skip: false,
  },
  render: UseOnInViewRender,
} satisfies Meta<Props>;

export default meta;

function UseOnInViewRender({ trigger = "enter", ...rest }: Props) {
  const { options, error } = useValidateOptions(rest as IntersectionOptions);

  const { onChange, initialInView, fallbackInView, ...observerOptions } =
    options;

  const effectOptions: IntersectionEffectOptions | undefined = error
    ? undefined
    : {
        ...observerOptions,
        trigger,
      };

  const [inView, setInView] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const optionsKey = useMemo(
    () =>
      JSON.stringify({
        trigger,
        threshold: effectOptions?.threshold,
        rootMargin: effectOptions?.rootMargin,
        trackVisibility: effectOptions?.trackVisibility,
        delay: effectOptions?.delay,
        triggerOnce: effectOptions?.triggerOnce,
        skip: effectOptions?.skip,
      }),
    [
      effectOptions?.delay,
      effectOptions?.rootMargin,
      effectOptions?.skip,
      effectOptions?.threshold,
      effectOptions?.trackVisibility,
      effectOptions?.triggerOnce,
      trigger,
    ],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when options change
  useEffect(() => {
    setEvents([]);
    setInView(false);
  }, [optionsKey]);

  const ref = useOnInView((entry) => {
    setInView(true);
    setEvents((prev) => [
      ...prev,
      `Entered viewport at ${(entry.time / 1000).toFixed(2)}s`,
    ]);
    return (exitEntry) => {
      setInView(false);
      setEvents((prev) => [
        ...prev,
        exitEntry
          ? `Exited viewport at ${(exitEntry.time / 1000).toFixed(2)}s`
          : "Observer disconnected or element unmounted",
      ]);
    };
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
        {effectOptions?.skip ? (
          <p className="mt-4 text-sm text-yellow-200">
            Observing is currently skipped. Toggle `skip` off to monitor the
            element.
          </p>
        ) : null}
      </InViewBlock>
      <ThresholdMarker threshold={effectOptions?.threshold} />
      <RootMargin rootMargin={effectOptions?.rootMargin} />
    </ScrollWrapper>
  );
}

export const Basic: Story = {
  args: {},
};

export const LeaveTrigger: Story = {
  args: {
    trigger: "leave",
  },
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
