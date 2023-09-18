# react-intersection-observer

[![Version Badge][npm-version-svg]][package-url]
[![GZipped size][npm-minzip-svg]][bundlephobia-url]
[![Test][test-image]][test-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

React implementation of the
[Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
to tell you when an element enters or leaves the viewport. Contains both a
[Hooks](#useinview-hook), [render props](#render-props) and
[plain children](#plain-children) implementation.

**Storybook Demo:**
[https://react-intersection-observer.vercel.app](https://react-intersection-observer.vercel.app)

## Features

- 🪝 **Hooks or Component API** - With `useInView` it's easier than ever to
  monitor elements
- ⚡️ **Optimized performance** - Reuses Intersection Observer instances where
  possible
- ⚙️ **Matches native API** - Intuitive to use
- 🛠 **Written in TypeScript** - It'll fit right into your existing TypeScript
  project
- 🧪 **Ready to test** - Mocks the Intersection Observer for easy testing with
  [Jest](https://jestjs.io/) or [Vitest](https://vitest.dev/)
- 🌳 **Tree-shakeable** - Only include the parts you use
- 💥 **Tiny bundle** - Around **~1.15kB** for `useInView` and **~1.6kB** for
  `<InView>`

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add react-intersection-observer
```

or NPM:

```sh
npm install react-intersection-observer --save
```

## Usage

### `useInView` hook

```js
// Use object destructuring, so you don't need to remember the exact order
const { ref, inView, entry } = useInView(options);

// Or array destructuring, making it easy to customize the field names
const [ref, inView, entry] = useInView(options);
```

The `useInView` hook makes it easy to monitor the `inView` state of your
components. Call the `useInView` hook with the (optional) [options](#options)
you need. It will return an array containing a `ref`, the `inView` status and
the current
[`entry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry).
Assign the `ref` to the DOM element you want to monitor, and the hook will
report the status.

```jsx
import React from 'react';
import { useInView } from 'react-intersection-observer';

const Component = () => {
  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
  });

  return (
    <div ref={ref}>
      <h2>{`Header inside viewport ${inView}.`}</h2>
    </div>
  );
};
```

[![Edit useInView](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/useinview-ud2vo?fontsize=14&hidenavigation=1&theme=dark)

### Render props

To use the `<InView>` component, you pass it a function. It will be called
whenever the state changes, with the new value of `inView`. In addition to the
`inView` prop, children also receive a `ref` that should be set on the
containing DOM element. This is the element that the Intersection Observer will
monitor.

If you need it, you can also access the
[`IntersectionObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry)
on `entry`, giving you access to all the details about the current intersection
state.

```jsx
import { InView } from 'react-intersection-observer';

const Component = () => (
  <InView>
    {({ inView, ref, entry }) => (
      <div ref={ref}>
        <h2>{`Header inside viewport ${inView}.`}</h2>
      </div>
    )}
  </InView>
);

export default Component;
```

[![Edit InView render props](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/inview-render-props-hvhcb?fontsize=14&hidenavigation=1&theme=dark)

### Plain children

You can pass any element to the `<InView />`, and it will handle creating the
wrapping DOM element. Add a handler to the `onChange` method, and control the
state in your own component. Any extra props you add to `<InView>` will be
passed to the HTML element, allowing you set the `className`, `style`, etc.

```jsx
import { InView } from 'react-intersection-observer';

const Component = () => (
  <InView as="div" onChange={(inView, entry) => console.log('Inview:', inView)}>
    <h2>Plain children are always rendered. Use onChange to monitor state.</h2>
  </InView>
);

export default Component;
```

[![Edit InView plain children](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/inview-plain-children-vv51y?fontsize=14&hidenavigation=1&theme=dark)

> **Note**<br> When rendering a plain child, make sure you keep your HTML output
> semantic. Change the `as` to match the context, and add a `className` to style
> the `<InView />`. The component does not support Ref Forwarding, so if you
> need a `ref` to the HTML element, use the Render Props version instead.

## API

### Options

Provide these as the options argument in the `useInView` hook or as props on the
**`<InView />`** component.

| Name                   | Type                      | Default     | Description                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **root**               | `Element`                 | `document`  | The Intersection Observer interface's read-only root property identifies the Element or Document whose bounds are treated as the bounding box of the viewport for the element which is the observer's target. If the root is `null`, then the bounds of the actual document viewport are used.  |
| **rootMargin**         | `string`                  | `'0px'`     | Margin around the root. Can have values similar to the CSS margin property, e.g. `"10px 20px 30px 40px"` (top, right, bottom, left).                                                                                                                                                            |
| **threshold**          | `number` or `number[]`    | `0`         | Number between `0` and `1` indicating the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points.                                                                                                                              |
| **onChange**           | `(inView, entry) => void` | `undefined` | Call this function whenever the in view state changes. It will receive the `inView` boolean, alongside the current `IntersectionObserverEntry`.                                                                                                                                                 |
| **trackVisibility** 🧪 | `boolean`                 | `false`     | A boolean indicating whether this Intersection Observer will track visibility changes on the target.                                                                                                                                                                                            |
| **delay** 🧪           | `number`                  | `undefined` | A number indicating the minimum delay in milliseconds between notifications from this observer for a given target. This must be set to at least `100` if `trackVisibility` is `true`.                                                                                                           |
| **skip**               | `boolean`                 | `false`     | Skip creating the IntersectionObserver. You can use this to enable and disable the observer as needed. If `skip` is set while `inView`, the current state will still be kept.                                                                                                                   |
| **triggerOnce**        | `boolean`                 | `false`     | Only trigger the observer once.                                                                                                                                                                                                                                                                 |
| **initialInView**      | `boolean`                 | `false`     | Set the initial value of the `inView` boolean. This can be used if you expect the element to be in the viewport to start with, and you want to trigger something when it leaves.                                                                                                                |
| **fallbackInView**     | `boolean`                 | `undefined` | If the `IntersectionObserver` API isn't available in the client, the default behavior is to throw an Error. You can set a specific fallback behavior, and the `inView` value will be set to this instead of failing. To set a global default, you can set it with the `defaultFallbackInView()` |

### InView Props

The **`<InView />`** component also accepts the following props:

| Name         | Type                                                 | Default     | Description                                                                                                                                                                                                                                                                                                                    |
| ------------ | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **as**       | `IntrinsicElement`                                   | `'div'`     | Render the wrapping element as this element. Defaults to `div`. If you want to use a custom component, please use the `useInView` hook or a render prop instead to manage the reference explictly.                                                                                                                                              |
| **children** | `({ref, inView, entry}) => ReactNode` or `ReactNode` | `undefined` | Children expects a function that receives an object containing the `inView` boolean and a `ref` that should be assigned to the element root. Alternatively pass a plain child, to have the `<InView />` deal with the wrapping element. You will also get the `IntersectionObserverEntry` as `entry`, giving you more details. |

### Intersection Observer v2 🧪

The new
[v2 implementation of IntersectionObserver](https://developers.google.com/web/updates/2019/02/intersectionobserver-v2)
extends the original API, so you can track if the element is covered by another
element or has filters applied to it. Useful for blocking clickjacking attempts
or tracking ad exposure.

To use it, you'll need to add the new `trackVisibility` and `delay` options.
When you get the `entry` back, you can then monitor if `isVisible` is `true`.

```jsx
const TrackVisible = () => {
  const { ref, entry } = useInView({ trackVisibility: true, delay: 100 });
  return <div ref={ref}>{entry?.isVisible}</div>;
};
```

This is still a very new addition, so check
[caniuse](https://caniuse.com/#feat=intersectionobserver-v2) for current browser
support. If `trackVisibility` has been set, and the current browser doesn't
support it, a fallback has been added to always report `isVisible` as `true`.

It's not added to the TypeScript `lib.d.ts` file yet, so you will also have to
extend the `IntersectionObserverEntry` with the `isVisible` boolean.

## Recipes

The `IntersectionObserver` itself is just a simple but powerful tool. Here's a
few ideas for how you can use it.

- [Lazy image load](docs/Recipes.md#lazy-image-load)
- [Trigger animations](docs/Recipes.md#trigger-animations)
- [Track impressions](docs/Recipes.md#track-impressions) _(Google Analytics, Tag
  Manager, etc)_

## FAQ

### How can I assign multiple refs to a component?

You can wrap multiple `ref` assignments in a single `useCallback`:

```jsx
import React, { useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

function Component(props) {
  const ref = useRef();
  const { ref: inViewRef, inView } = useInView();

  // Use `useCallback` so we don't recreate the function on each render
  const setRefs = useCallback(
    (node) => {
      // Ref's from useRef needs to have the node assigned to `current`
      ref.current = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );

  return <div ref={setRefs}>Shared ref is visible: {inView}</div>;
}
```

### `rootMargin` isn't working as expected

When using `rootMargin`, the margin gets added to the current `root` - If your
application is running inside a `<iframe>`, or you have defined a custom `root`
this will not be the current viewport.

You can read more about this on these links:

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#The_intersection_root_and_root_margin)
- [w3c/IntersectionObserver: rootMargin ignored within iframe](https://github.com/w3c/IntersectionObserver/issues/283#issuecomment-507397917)
- [w3c/IntersectionObserver: Cannot track intersection with an iframe's viewport](https://github.com/w3c/IntersectionObserver/issues/372)
- [w3c/Support iframe viewport tracking](https://github.com/w3c/IntersectionObserver/pull/465)

## Testing

In order to write meaningful tests, the `IntersectionObserver` needs to be
mocked. You can use the included `react-intersection-observer/test-utils` to
help with this. It mocks the `IntersectionObserver`, and includes a few methods
to assist with faking the `inView` state. When setting the `isIntersecting`
value you can pass either a `boolean` value or a threshold between 0 and 1. It
will emulate the real IntersectionObserver, allowing you to validate that your
components are behaving as expected.

| Method                                        | Description                                                                                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mockAllIsIntersecting(isIntersecting)`       | Set `isIntersecting` on all current Intersection Observer instances. The value of `isIntersecting` should be either a `boolean` or a threshold between 0 and 1.                   |
| `mockIsIntersecting(element, isIntersecting)` | Set `isIntersecting` for the Intersection Observer of a specific `element`. The value of `isIntersecting` should be either a `boolean` or a threshold between 0 and 1.            |
| `intersectionMockInstance(element)`           | Call the `intersectionMockInstance` method with an element, to get the (mocked) `IntersectionObserver` instance. You can use this to spy on the `observe` and`unobserve` methods. |
| `setupIntersectionMocking(mockFn)`            | Mock the `IntersectionObserver`, so we can interact with them in tests - Should be called in `beforeEach`. (**Done automatically in Jest environment**)                           |
| `resetIntersectionMocking()`                  | Reset the mocks on `IntersectionObserver` - Should be called in `afterEach`. (**Done automatically in Jest environment**)                                                         |

### Testing Libraries

This library comes with built-in support for writing tests in both
[Jest](https://jestjs.io/) and [Vitest](https://vitest.dev/)

#### Jest

Testing with Jest should work out of the box. Just import the
`react-intersection-observer/test-utils` in your test files, and you can use the
mocking methods.

#### Vitest

If you're running Vitest with [globals](https://vitest.dev/config/#globals),
then it'll automatically mock the IntersectionObserver, just like running with
Jest. Otherwise, you'll need to manually setup/reset the mocking in either the
individual tests, or a [setup file](https://vitest.dev/config/#setupfiles).

```js
import { vi, beforeEach, afterEach } from 'vitest';
import {
  setupIntersectionMocking,
  resetIntersectionMocking,
} from 'react-intersection-observer/test-utils';

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
});

afterEach(() => {
  resetIntersectionMocking();
});
```

You only need to do this if the test environment does not support `beforeEach`
globally, alongside either `jest.fn` or `vi.fn`.

#### Other Testing Libraries

See the instructions for [Vitest](#vitest). You should be able to use a similar
setup/reset code, adapted to the testing library you are using. Failing that,
copy the code from [test-utils.ts][test-utils-url], and make your own version.

### Fallback Behavior

You can create a
[Jest setup file](https://jestjs.io/docs/configuration#setupfilesafterenv-array)
that leverages the
[unsupported fallback](https://github.com/thebuilder/react-intersection-observer#unsupported-fallback)
option. In this case, you can override the `IntersectionObserver` in test files
were you actively import `react-intersection-observer/test-utils`.

**test-setup.js**

```js
import { defaultFallbackInView } from 'react-intersection-observer';

defaultFallbackInView(true); // or `false` - whichever consistent behavior makes the most sense for your use case.
```

Alternatively, you can mock the Intersection Observer in all tests with a global
setup file. Add `react-intersection-observer/test-utils` to
[setupFilesAfterEnv](https://jestjs.io/docs/configuration#setupfilesafterenv-array)
in the Jest config, or [setupFiles](https://vitest.dev/config/#setupfiles) in
Vitest.

```js
module.exports = {
  setupFilesAfterEnv: ['react-intersection-observer/test-utils'],
};
```

### Test Example

```js
import React from 'react';
import { screen, render } from '@testing-library/react';
import { useInView } from 'react-intersection-observer';
import {
  mockAllIsIntersecting,
  mockIsIntersecting,
  intersectionMockInstance,
} from 'react-intersection-observer/test-utils';

const HookComponent = ({ options }) => {
  const { ref, inView } = useInView(options);
  return (
    <div ref={ref} data-testid="wrapper">
      {inView.toString()}
    </div>
  );
};

test('should create a hook inView', () => {
  render(<HookComponent />);

  // This causes all (existing) IntersectionObservers to be set as intersecting
  mockAllIsIntersecting(true);
  screen.getByText('true');
});

test('should create a hook inView with threshold', () => {
  render(<HookComponent options={{ threshold: 0.3 }} />);

  mockAllIsIntersecting(0.1);
  screen.getByText('false');

  // Once the threshold has been passed, it will trigger inView.
  mockAllIsIntersecting(0.3);
  screen.getByText('true');
});

test('should mock intersecing on specific hook', () => {
  render(<HookComponent />);
  const wrapper = screen.getByTestId('wrapper');

  // Set the intersection state on the wrapper.
  mockIsIntersecting(wrapper, 0.5);
  screen.getByText('true');
});

test('should create a hook and call observe', () => {
  const { getByTestId } = render(<HookComponent />);
  const wrapper = getByTestId('wrapper');
  // Access the `IntersectionObserver` instance for the wrapper Element.
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});
```

## Intersection Observer

[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
is the API used to determine if an element is inside the viewport or not.
[Browser support is excellent](http://caniuse.com/#feat=intersectionobserver) -
With
[Safari adding support in 12.1](https://webkit.org/blog/8718/new-webkit-features-in-safari-12-1/),
all major browsers now support Intersection Observers natively. Add the
polyfill, so it doesn't break on older versions of iOS and IE11.

### Unsupported fallback

If the client doesn't have support for the `IntersectionObserver`, then the
default behavior is to throw an error. This will crash the React application,
unless you capture it with an Error Boundary.

If you prefer, you can set a fallback `inView` value to use if the
`IntersectionObserver` doesn't exist. This will make
`react-intersection-observer` fail gracefully, but you must ensure your
application can correctly handle all your observers firing either `true` or
`false` at the same time.

You can set the fallback globally:

```js
import { defaultFallbackInView } from 'react-intersection-observer';
defaultFallbackInView(true); // or 'false'
```

You can also define the fallback locally on `useInView` or `<InView>` as an
option. This will override the global fallback value.

```jsx
import React from 'react';
import { useInView } from 'react-intersection-observer';

const Component = () => {
  const { ref, inView, entry } = useInView({
    fallbackInView: true,
  });

  return (
    <div ref={ref}>
      <h2>{`Header inside viewport ${inView}.`}</h2>
    </div>
  );
};
```

### Polyfill

You can import the
[polyfill](https://www.npmjs.com/package/intersection-observer) directly or use
a service like [polyfill.io](https://polyfill.io/v2/docs/) to add it when
needed.

```sh
yarn add intersection-observer
```

Then import it in your app:

```js
import 'intersection-observer';
```

If you are using Webpack (or similar) you could use
[dynamic imports](https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import),
to load the Polyfill only if needed. A basic implementation could look something
like this:

```js
/**
 * Do feature detection, to figure out which polyfills needs to be imported.
 **/
async function loadPolyfills() {
  if (typeof window.IntersectionObserver === 'undefined') {
    await import('intersection-observer');
  }
}
```

## Low level API

You can access the [`observe`](src/observe.ts) method, that
`react-intersection-observer` uses internally to create and destroy
IntersectionObserver instances. This allows you to handle more advanced use
cases, where you need full control over when and how observers are created.

```js
import { observe } from 'react-intersection-observer';
const destroy = observe(element, callback, options);
```

| Name         | Type                       | Required | Description                                                |
| ------------ | -------------------------- | -------- | ---------------------------------------------------------- |
| **element**  | `Element`                  | true     | DOM element to observe                                     |
| **callback** | `ObserverInstanceCallback` | true     | The callback function that Intersection Observer will call |
| **options**  | `IntersectionObserverInit` | false    | The options for the Intersection Observer                  |

The `observe` method returns an `unobserve` function, that you must call in
order to destroy the observer again.

> **Warning**<br> You most likely won't need this, but it can be useful if you
> need to handle IntersectionObservers outside React, or need full control over
> how instances are created.

[package-url]: https://npmjs.org/package/react-intersection-observer
[npm-version-svg]: https://img.shields.io/npm/v/react-intersection-observer.svg
[npm-minzip-svg]:
  https://img.shields.io/bundlephobia/minzip/react-intersection-observer.svg
[bundlephobia-url]:
  https://bundlephobia.com/result?p=react-intersection-observer
[license-image]: http://img.shields.io/npm/l/react-intersection-observer.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/react-intersection-observer.svg
[downloads-url]:
  http://npm-stat.com/charts.html?package=react-intersection-observer
[test-image]:
  https://github.com/thebuilder/react-intersection-observer/workflows/Test/badge.svg
[test-url]:
  https://github.com/thebuilder/react-intersection-observer/actions?query=workflow%3ATest
[test-utils-url]:
  https://github.com/thebuilder/react-intersection-observer/blob/master/src/test-utils.ts
