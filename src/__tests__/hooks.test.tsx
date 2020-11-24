import React, { useCallback } from 'react';
import { render, screen } from '@testing-library/react';
import { useInView } from '../useInView';
import { intersectionMockInstance, mockAllIsIntersecting } from '../test-utils';
import { IntersectionOptions } from '../index';

const HookComponent = ({
  options,
  unmount,
}: {
  options?: IntersectionOptions;
  unmount?: boolean;
}) => {
  const [ref, inView] = useInView(options);
  return (
    <div data-testid="wrapper" ref={!unmount ? ref : undefined}>
      {inView.toString()}
    </div>
  );
};

const LazyHookComponent = ({ options }: { options?: IntersectionOptions }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);
  const [ref, inView] = useInView(options);
  if (isLoading) return <div>Loading</div>;
  return (
    <div data-testid="wrapper" ref={ref}>
      {inView.toString()}
    </div>
  );
};

test('should create a hook', () => {
  const { getByTestId } = render(<HookComponent />);
  const wrapper = getByTestId('wrapper');
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test('should create a hook with array threshold', () => {
  const { getByTestId } = render(
    <HookComponent options={{ threshold: [0.1, 1] }} />,
  );
  const wrapper = getByTestId('wrapper');
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test('should create a lazy hook', () => {
  const { getByTestId } = render(<LazyHookComponent />);
  const wrapper = getByTestId('wrapper');
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});

test('should create a hook inView', () => {
  const { getByText } = render(<HookComponent />);
  mockAllIsIntersecting(true);

  getByText('true');
});

test('should mock thresholds', () => {
  render(<HookComponent options={{ threshold: [0.5, 1] }} />);
  mockAllIsIntersecting(0.2);
  screen.getByText('false');
  mockAllIsIntersecting(0.5);
  screen.getByText('true');
  mockAllIsIntersecting(1);
  screen.getByText('true');
});

test('should create a hook with initialInView', () => {
  const { getByText } = render(
    <HookComponent options={{ initialInView: true }} />,
  );
  getByText('true');
  mockAllIsIntersecting(false);
  getByText('false');
});

test('should trigger a hook leaving view', () => {
  const { getByText } = render(<HookComponent />);
  mockAllIsIntersecting(true);
  mockAllIsIntersecting(false);
  getByText('false');
});

test('should respect trigger once', () => {
  const { getByText } = render(
    <HookComponent options={{ triggerOnce: true }} />,
  );
  mockAllIsIntersecting(true);
  mockAllIsIntersecting(false);

  getByText('true');
});

test('should respect skip', () => {
  const { getByText, rerender } = render(
    <HookComponent options={{ skip: true }} />,
  );
  mockAllIsIntersecting(false);
  getByText('false');

  rerender(<HookComponent options={{ skip: false }} />);
  mockAllIsIntersecting(true);
  getByText('true');
});

test('should not reset current state if changing skip', () => {
  const { getByText, rerender } = render(
    <HookComponent options={{ skip: false }} />,
  );
  mockAllIsIntersecting(true);
  rerender(<HookComponent options={{ skip: true }} />);
  getByText('true');
});

test('should unmount the hook', () => {
  const { unmount, getByTestId } = render(<HookComponent />);
  const wrapper = getByTestId('wrapper');
  const instance = intersectionMockInstance(wrapper);
  unmount();
  expect(instance.unobserve).toHaveBeenCalledWith(wrapper);
});

test('inView should be false when component is unmounted', () => {
  const { rerender, getByText } = render(<HookComponent />);
  mockAllIsIntersecting(true);

  getByText('true');
  rerender(<HookComponent unmount />);
  getByText('false');
});

test('should handle new options', () => {
  render(<HookComponent options={{ trackVisibility: true, delay: 100 }} />);
});

const SwitchHookComponent = ({
  options,
  toggle,
  unmount,
}: {
  options?: IntersectionOptions;
  toggle?: boolean;
  unmount?: boolean;
}) => {
  const [ref, inView] = useInView(options);
  return (
    <>
      <div
        data-testid="item-1"
        data-inview={!toggle && inView}
        ref={!toggle && !unmount ? ref : undefined}
      />
      <div
        data-testid="item-2"
        data-inview={!!toggle && inView}
        ref={toggle && !unmount ? ref : undefined}
      />
    </>
  );
};

/**
 * This is a test for the case where people move the ref around (please don't)
 */
test('should handle ref removed', () => {
  const { rerender, getByTestId } = render(<SwitchHookComponent />);
  mockAllIsIntersecting(true);

  const item1 = getByTestId('item-1');
  const item2 = getByTestId('item-2');

  // Item1 should be inView
  expect(item1.getAttribute('data-inview')).toBe('true');
  expect(item2.getAttribute('data-inview')).toBe('false');

  rerender(<SwitchHookComponent toggle />);
  mockAllIsIntersecting(true);

  // Item2 should be inView
  expect(item1.getAttribute('data-inview')).toBe('false');
  expect(item2.getAttribute('data-inview')).toBe('true');

  rerender(<SwitchHookComponent unmount />);

  // Nothing should be inView
  expect(item1.getAttribute('data-inview')).toBe('false');
  expect(item2.getAttribute('data-inview')).toBe('false');

  // Add the ref back
  rerender(<SwitchHookComponent />);
  mockAllIsIntersecting(true);
  expect(item1.getAttribute('data-inview')).toBe('true');
  expect(item2.getAttribute('data-inview')).toBe('false');
});

const MergeRefsComponent = ({ options }: { options?: IntersectionOptions }) => {
  const [inViewRef, inView] = useInView(options);
  const setRef = useCallback(
    (node) => {
      inViewRef(node);
    },
    [inViewRef],
  );

  return <div data-testid="inview" data-inview={inView} ref={setRef} />;
};

test('should handle ref merged', () => {
  const { rerender, getByTestId } = render(<MergeRefsComponent />);
  mockAllIsIntersecting(true);
  rerender(<MergeRefsComponent />);

  expect(getByTestId('inview').getAttribute('data-inview')).toBe('true');
});

const MultipleHookComponent = ({
  options,
}: {
  options?: IntersectionOptions;
}) => {
  const [ref1, inView1] = useInView(options);
  const [ref2, inView2] = useInView(options);
  const [ref3, inView3] = useInView();

  const mergedRefs = useCallback(
    (node) => {
      ref1(node);
      ref2(node);
      ref3(node);
    },
    [ref1, ref2, ref3],
  );

  return (
    <div ref={mergedRefs}>
      <div data-testid="item-1" data-inview={inView1}>
        {inView1}
      </div>
      <div data-testid="item-2" data-inview={inView2}>
        {inView2}
      </div>
      <div data-testid="item-3" data-inview={inView3}>
        {inView3}
      </div>
    </div>
  );
};

test('should handle multiple hooks on the same element', () => {
  const { getByTestId } = render(
    <MultipleHookComponent options={{ threshold: 0.1 }} />,
  );
  mockAllIsIntersecting(true);
  expect(getByTestId('item-1').getAttribute('data-inview')).toBe('true');
  expect(getByTestId('item-2').getAttribute('data-inview')).toBe('true');
  expect(getByTestId('item-3').getAttribute('data-inview')).toBe('true');
});

test('should handle thresholds missing on observer instance', () => {
  render(<HookComponent options={{ threshold: [0.1, 1] }} />);
  const wrapper = screen.getByTestId('wrapper');
  const instance = intersectionMockInstance(wrapper);
  // @ts-ignore
  instance.thresholds = undefined;
  mockAllIsIntersecting(true);

  screen.getByText('true');
});

test('should handle thresholds missing on observer instance with no threshold set', () => {
  render(<HookComponent />);
  const wrapper = screen.getByTestId('wrapper');
  const instance = intersectionMockInstance(wrapper);
  // @ts-ignore
  instance.thresholds = undefined;
  mockAllIsIntersecting(true);

  screen.getByText('true');
});
