# react-intersection-observer

[![Version Badge][npm-version-svg]][package-url]
[![GZipped size][npm-minzip-svg]][bundlephobia-url]
![Test](https://github.com/thebuilder/react-intersection-observer/workflows/Test/badge.svg)
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

React implementation of the
[Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
to tell you when an element enters or leaves the viewport. Contains both a
[Hooks](#hooks-), [render props](#render-props) and
[plain children](#plain-children) implementation.

**Storybook Demo:**
[https://react-intersection-observer.now.sh/](https://react-intersection-observer.now.sh/)

## Features

- 🎣 **Hooks or Component API** - With `useInView` it's easier than ever to
  monitor elements
- ⚡️ **Optimized performance** - Auto reuses Intersection Observer instances
  where possible
- ⚙️ **Matches native API** - Intuitive to use
- 🌳 **Tree-shakeable** - Only include the parts you use
- 💥 **Tiny bundle** [~1.6 kB gzipped][bundlephobia-url]

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

### Hooks 🎣

#### `useInView`

```js
// Use object destructing, so you don't need to remember the exact order
const { ref, inView, entry } = useInView(options);

// Or array destructing, making it easy to customize the field names
const [ref, inView, entry] = useInView(options);
```

React Hooks make it easy to monitor the `inView` state of your components. Call
the `useInView` hook with the (optional) [options](#options) you need. It will
return an array containing a `ref`, the `inView` status and the current
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
containing DOM element. This is the element that the IntersectionObserver will
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

> ⚠️ When rendering a plain child, make sure you keep your HTML output semantic.
> Change the `as` to match the context, and add a `className` to style the
> `<InView />`. The component does not support Ref Forwarding, so if you need a
> `ref` to the HTML element, use the Render Props version instead.

## API

### Options

Provide these as props on the **`<InView />`** component or as the options
argument for the hooks.

| Name                   | Type               | Default   | Required | Description                                                                                                                                                                                                                                                                                 |
| ---------------------- | ------------------ | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **root**               | Element            | document  | false    | The IntersectionObserver interface's read-only root property identifies the Element or Document whose bounds are treated as the bounding box of the viewport for the element which is the observer's target. If the root is null, then the bounds of the actual document viewport are used. |
| **rootMargin**         | string             | '0px'     | false    | Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).                                                                                                                                                          |
| **threshold**          | number \| number[] | 0         | false    | Number between 0 and 1 indicating the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points.                                                                                                                              |
| **trackVisibility** 🧪 | boolean            | false     | false    | A boolean indicating whether this IntersectionObserver will track changes in a target’s visibility.                                                                                                                                                                                         |
| **delay** 🧪           | number             | undefined | false    | A number indicating the minimum delay in milliseconds between notifications from this observer for a given target. This must be set to at least `100` if `trackVisibility` is `true`.                                                                                                       |
| **skip**               | boolean            | false     | false    | Skip creating the IntersectionObserver. You can use this to enable and disable the observer as needed. If `skip` is set while `inView`, the current state will still be kept.                                                                                                               |
| **triggerOnce**        | boolean            | false     | false    | Only trigger the observer once.                                                                                                                                                                                                                                                             |
| **initialInView**      | boolean            | false     | false    | Set the initial value of the `inView` boolean. This can be used if you expect the element to be in the viewport to start with, and you want to trigger something when it leaves.                                                                                                            |

> ⚠️ When passing an array to `threshold`, store the array in a constant to
> avoid the component re-rendering too often. For example:

```jsx
const THRESHOLD = [0.25, 0.5, 0.75]; // Store multiple thresholds in a constant
const MyComponent = () => {
  const [ref, inView, entry] = useInView({ threshold: THRESHOLD });
  return (
    <div ref={ref}>
      Triggered at intersection ratio {entry.intersectionRatio}
    </div>
  );
};
```

### InView Props

The **`<InView />`** component also accepts the following props:

| Name         | Type                                                     | Default | Required | Description                                                                                                                                                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **as**       | `string`                                                 | 'div'   | false    | Render the wrapping element as this element. Defaults to `div`.                                                                                                                                                                                                                                                               |
| **children** | `({ref, inView, entry}) => React.ReactNode`, `ReactNode` |         | true     | Children expects a function that receives an object containing the `inView` boolean and a `ref` that should be assigned to the element root. Alternatively pass a plain child, to have the `<InView />` deal with the wrapping element. You will also get the `IntersectionObserverEntry` as `entry, giving you more details. |
| **onChange** | `(inView, entry) => void`                                |         | false    | Call this function whenever the in view state changes. It will receive the `inView` boolean, alongside the current `IntersectionObserverEntry`.                                                                                                                                                                               |

### IntersectionObserver v2 🧪

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
import React, { useRef } from 'react';
import { useInView } from 'react-intersection-observer';

function Component(props) {
  const ref = useRef();
  const [inViewRef, inView] = useInView();

  // Use `useCallback` so we don't recreate the function on each render - Could result in infinite loop
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
- [w3c/IntersectionObserver: IntersectionObserver rootMargin ignored within iframe](https://github.com/w3c/IntersectionObserver/issues/283#issuecomment-507397917)
  > If you want the root margin to apply to the iframe element's boundary, then
  > you'll have to use an observer with an explicit root, which should be
  > `document.scrollingElement` within the iframe. If you also need to compute
  > intersection with the top-level viewport (the implicit root), that will
  > require a second observer.

## Testing

In order to write meaningful tests, the `IntersectionObserver` needs to be
mocked. If you are writing your tests in Jest, you can use the included
`test-utils.js`. It mocks the `IntersectionObserver`, and includes a few methods
to assist with faking the `inView` state. When setting the `isIntersecting`
value you can pass either a `boolean` value or a threshold between `0` and `1`.

### `test-utils.js`

Import the methods from `react-intersection-observer/test-utils`.

**`mockAllIsIntersecting(isIntersecting:boolean | number)`**  
Set `isIntersecting` on all current IntersectionObserver instances.

**`mockIsIntersecting(element:Element, isIntersecting:boolean | number)`**  
Set `isIntersecting` for the IntersectionObserver of a specific element.

**`intersectionMockInstance(element:Element): IntersectionObserver`**  
Call the `intersectionMockInstance` method with an element, to get the (mocked)
`IntersectionObserver` instance. You can use this to spy on the `observe` and
`unobserve` methods.

### Test Example

```js
import React from 'react';
import { screen, render } from 'react-testing-library';
import { useInView } from 'react-intersection-observer';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';

const HookComponent = ({ options }) => {
  const [ref, inView] = useInView(options);
  return <div ref={ref}>{inView.toString()}</div>;
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
```

## Intersection Observer

[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
is the API used to determine if an element is inside the viewport or not.
[Browser support is really good](http://caniuse.com/#feat=intersectionobserver) -
With
[Safari adding support in 12.1](https://webkit.org/blog/8718/new-webkit-features-in-safari-12-1/),
all major browsers now support Intersection Observers natively. Add the
polyfill, so it doesn't break on older versions of iOS and IE11.

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
[dynamic imports](https://webpack.js.org/api/module-methods/#import-), to load
the Polyfill only if needed. A basic implementation could look something like
this:

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

[package-url]: https://npmjs.org/package/react-intersection-observer
[npm-version-svg]: https://img.shields.io/npm/v/react-intersection-observer.svg
[npm-minzip-svg]: https://img.shields.io/bundlephobia/minzip/react.svg
[bundlephobia-url]:
  https://bundlephobia.com/result?p=react-intersection-observer
[license-image]: http://img.shields.io/npm/l/react-intersection-observer.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/react-intersection-observer.svg
[downloads-url]:
  http://npm-stat.com/charts.html?package=react-intersection-observer
