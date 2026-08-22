<h1>
  <img src="apps/docs/public/logo-horizontal.svg" alt="React Intersection Observer" width="290" />
</h1>

[![Version Badge](https://img.shields.io/npm/v/react-intersection-observer.svg)](https://npmjs.org/package/react-intersection-observer)
[![Test](https://github.com/thebuilder/react-intersection-observer/workflows/Test/badge.svg)](https://github.com/thebuilder/react-intersection-observer/actions?query=workflow%3ATest)
[![License](http://img.shields.io/npm/l/react-intersection-observer.svg)](LICENSE)
[![Downloads](http://img.shields.io/npm/dm/react-intersection-observer.svg)](http://npm-stat.com/charts.html?package=react-intersection-observer)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/react-intersection-observer?exports=InView%2C%20useOnInView%2C%20useInView&externals=react&format=both)

A React implementation of the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
that tells you when an element enters or leaves the viewport. Use it for scroll
animations, lazy loading, impression tracking, and infinite scroll. It ships
[hooks](#useinview-hook), [render props](#render-props), and
[plain children](#plain-children).

## Features

- **Hooks or component API** - `useInView` for React state, `useOnInView` for
  callbacks, `<InView>` for render props and wrapper elements.
- **Shared observers** - Observers with matching options are reused, so watching
  many elements stays cheap.
- **Matches the native API** - Options map straight to
  `IntersectionObserverInit`.
- **Written in TypeScript** - Types ship with the package.
- **Ready to test** - Mocks the Intersection Observer for
  [Jest](https://jestjs.io/) and [Vitest](https://vitest.dev/).
- **Tree-shakeable** - Only the parts you import end up in your bundle.
- **Small** - Around 1.15kB gzipped for `useInView`, 1.6kB for `<InView>`.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/thebuilder/react-intersection-observer)

## Installation

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

Call `useInView` with the (optional) [options](#options) you need. It returns a
`ref`, the `inView` status, and the current
[`entry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry).
Assign the `ref` to the DOM element you want to watch, and the hook reports the
status.

```jsx
import React from "react";
import { useInView } from "react-intersection-observer";

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

> **Note:** The first `false` notification from the underlying IntersectionObserver is ignored so your handlers only run after a real visibility change. Subsequent transitions still report both `true` and `false` states as the element enters and leaves the viewport.

### `useOnInView` hook

```js
const inViewRef = useOnInView(
  (inView, entry) => {
    if (inView) {
      // Do something with the element that came into view
      console.log("Element is in view", entry.target);
    } else {
      console.log("Element left view", entry.target);
    }
  },
  options // Optional IntersectionObserver options
);
```

`useOnInView` takes a callback and returns a ref to assign to the DOM element
you want to watch. Whenever the element enters or leaves the viewport, the
callback runs with the latest in-view state.

Differences from `useInView`:

- **No re-renders** - The hook holds no state, so a visibility change never
  triggers a render.
- **Direct element access** - The callback receives the
  `IntersectionObserverEntry`, including the `target` element.
- **Boolean-first callback** - The first argument is the current `inView`
  boolean, matching the `onChange` signature from `useInView`.
- **Same options** - Accepts every [option](#options) `useInView` does, except
  `onChange`, `initialInView`, and `fallbackInView`.

> **Note:** Just like `useInView`, the initial `false` notification is skipped. Your callback fires the first time the element becomes visible, then on every enter and leave transition after that.

```jsx
import React from "react";
import { useOnInView } from "react-intersection-observer";

const Component = () => {
  // Track when element appears without causing re-renders
  const trackingRef = useOnInView(
    (inView, entry) => {
      if (inView) {
        // Element is in view, so log an impression
        console.log("Element appeared in view", entry.target);
      } else {
        console.log("Element left view", entry.target);
      }
    },
    {
      /* Optional options */
      threshold: 0.5,
      triggerOnce: true,
    },
  );

  return (
    <div ref={trackingRef}>
      <h2>This element is being tracked without re-renders</h2>
    </div>
  );
};
```

### Render props

Pass `<InView>` a function. It runs whenever the state changes, with the new
value of `inView`. Children also receive a `ref` that you set on the containing
DOM element. That element is the one the Intersection Observer watches.

The
[`IntersectionObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry)
is available on `entry` when you need the details of the current intersection
state.

```jsx
import { InView } from "react-intersection-observer";

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

> **Note:** `<InView>` behaves like the hooks. It suppresses the first `false` notification, so render props and `onChange` handlers only run after a real visibility change.

### Plain children

Pass any element to `<InView />` and it creates the wrapping DOM element for
you. Add a handler to `onChange` and keep the state in your own component. Extra
props on `<InView>` go to the HTML element, so you can set `className`, `style`,
and the rest.

```jsx
import { InView } from "react-intersection-observer";

const Component = () => (
  <InView as="div" onChange={(inView, entry) => console.log("Inview:", inView)}>
    <h2>Plain children are always rendered. Use onChange to monitor state.</h2>
  </InView>
);

export default Component;
```

> [!NOTE]
> When rendering a plain child, keep your HTML output semantic. Change `as` to
> match the context, and add a `className` to style the `<InView />`. The
> component does not forward refs, so use the render props version if you need a
> `ref` to the HTML element.

## API

### Options

Pass these as the options argument to `useInView`, or as props on `<InView />`.

| Name                   | Type                      | Default     | Description                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **root**               | `Element`                 | `document`  | The element whose bounds count as the viewport for the target. It must be an ancestor of the target. With `null`, the document viewport is used.                                                                                                                                                 |
| **rootMargin**         | `string`                  | `'0px'`     | Margin around the root. Can have values similar to the CSS margin property, e.g. `"10px 20px 30px 40px"` (top, right, bottom, left). Also supports percentages, to check if an element intersects with the center of the viewport for example `"-50% 0% -50% 0%"`.                              |
| **scrollMargin**       | `string`                  | `'0px'`     | Margin around nested scroll containers that clip the target. Can have values similar to the CSS margin property, e.g. `"10px 20px 30px 40px"` (top, right, bottom, left). Unlike `rootMargin`, this grows or shrinks every scroll container's clipping rectangle within the root, including the root itself if it is a scroll container.                              |
| **threshold**          | `number` or `number[]`    | `0`         | Number between `0` and `1` indicating the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points.                                                                                                                              |
| **onChange**           | `(inView, entry) => void` | `undefined` | Runs whenever the in view state changes, with the `inView` boolean and the current `IntersectionObserverEntry`.                                                                                                                                                                                  |
| **trackVisibility**    | `boolean`                 | `false`     | Experimental. Track visibility changes on the target, beyond plain intersection. See [Intersection Observer v2](#intersection-observer-v2).                                                                                                                                                          |
| **delay**              | `number`                  | `undefined` | Experimental. Minimum delay in milliseconds between notifications for a given target. Must be at least `100` if `trackVisibility` is `true`.                                                                                                                                                     |
| **skip**               | `boolean`                 | `false`     | Skip creating the IntersectionObserver, so you can turn observation on and off. Setting `skip` while `inView` keeps the current state.                                                                                                                                                           |
| **triggerOnce**        | `boolean`                 | `false`     | Only trigger the observer once.                                                                                                                                                                                                                                                                 |
| **initialInView**      | `boolean`                 | `false`     | The starting value of `inView`. Set it to `true` when the element starts in the viewport and you want to trigger something when it leaves.                                                                                                                                                       |
| **fallbackInView**     | `boolean`                 | `undefined` | The `inView` value to use when the client has no `IntersectionObserver`, instead of the default behavior of throwing. `defaultFallbackInView()` sets this globally.                                                                                                                              |

`useOnInView` accepts the same options as `useInView` except `onChange`,
`initialInView`, and `fallbackInView`.

### InView props

The **`<InView />`** component also accepts the following props:

| Name         | Type                                                 | Default     | Description                                                                                                                                                                                                                                                                                                                    |
| ------------ | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **as**       | `IntrinsicElement`                                   | `'div'`     | Render the wrapping element as this element. Defaults to `div`. If you want to use a custom component, use the `useInView` hook or a render prop instead to manage the reference explicitly.                                                                                                                             |
| **children** | `({ref, inView, entry}) => ReactNode` or `ReactNode` | `undefined` | A function receiving `inView`, a `ref` to assign to the element root, and the `IntersectionObserverEntry` as `entry`. Pass a plain child instead to let `<InView />` create the wrapping element.                                                                                                |

### Intersection Observer v2

[Intersection Observer v2](https://developers.google.com/web/updates/2019/02/intersectionobserver-v2)
extends the original API, so you can track whether the element is covered by
another element or has filters applied to it. Useful for blocking clickjacking
attempts or tracking ad exposure.

Add the `trackVisibility` and `delay` options, then check whether `isVisible`
is `true` on the `entry` you get back.

```jsx
const TrackVisible = () => {
  const { ref, entry } = useInView({ trackVisibility: true, delay: 100 });
  return <div ref={ref}>{entry?.isVisible}</div>;
};
```

Check [caniuse](https://caniuse.com/#feat=intersectionobserver-v2) for current
browser support. If you set `trackVisibility` and the browser doesn't support
it, the fallback always reports `isVisible` as `true`.

`isVisible` isn't in the TypeScript `lib.d.ts` file yet, so you also have to
extend `IntersectionObserverEntry` with the boolean yourself.

## Recipes

A few things you can build with it:

- [Lazy image load](apps/docs/docs/guides/recipes.mdx#lazy-image-loading)
- [Trigger animations](apps/docs/docs/guides/recipes.mdx#scroll-triggered-animation)
- [Track impressions](apps/docs/docs/guides/recipes.mdx#track-an-impression) _(Google Analytics, Tag
  Manager, etc.)_

## FAQ

### How can I assign multiple refs to a component?

You can wrap multiple `ref` assignments in a single `useCallback`:

```jsx
import React, { useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";

function Component(props) {
  const ref = useRef();
  const { ref: inViewRef, inView } = useInView();

  // Use `useCallback` so we don't recreate the function on each render
  const setRefs = useCallback(
    (node) => {
      // Refs from `useRef` need the node assigned to `current`
      ref.current = node;
      // Callback refs, like the one from `useInView`, are functions that take the node
      inViewRef(node);
    },
    [inViewRef],
  );

  return <div ref={setRefs}>Shared ref is visible: {inView}</div>;
}
```

### `rootMargin` isn't working as expected

`rootMargin` is added to the current `root`. If your application runs inside an
`<iframe>`, or you defined a custom `root`, that root is not the viewport.

If a scrollable container inside the `root` clips the target, use `scrollMargin`
to change when intersections are calculated for that nested scroll container.

More background:

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#The_intersection_root_and_root_margin)
- [IntersectionObserver scrollMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/scrollMargin)
- [w3c/IntersectionObserver: rootMargin ignored within iframe](https://github.com/w3c/IntersectionObserver/issues/283#issuecomment-507397917)
- [w3c/IntersectionObserver: Cannot track intersection with an iframe's viewport](https://github.com/w3c/IntersectionObserver/issues/372)
- [w3c/Support iframe viewport tracking](https://github.com/w3c/IntersectionObserver/pull/465)

## Testing

> [!TIP]
> Consider using [Vitest Browser Mode](https://vitest.dev/guide/browser/) instead of `jsdom` or `happy-dom`.
> It runs the browser's own implementation, so intersections trigger correctly when you scroll or add elements to the viewport. You can skip `react-intersection-observer/test-utils` there, or use it where you need it.

To write meaningful tests, mock the `IntersectionObserver`. The included
`react-intersection-observer/test-utils` does that, and adds a few methods for
faking the `inView` state. Pass `isIntersecting` either a `boolean` or a
threshold between 0 and 1; the mock emulates the real IntersectionObserver so
you can check that your components behave as expected.

| Method                                        | Description                                                                                                                                                                       |
|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mockAllIsIntersecting(isIntersecting)`       | Set `isIntersecting` on every current Intersection Observer instance. Pass a `boolean` or a threshold between 0 and 1.                                                            |
| `mockIsIntersecting(element, isIntersecting)` | Set `isIntersecting` for the Intersection Observer of one `element`. Pass a `boolean` or a threshold between 0 and 1.                                                             |
| `intersectionMockInstance(element)`           | Get the mocked `IntersectionObserver` instance for an element, so you can spy on its `observe` and `unobserve` methods.                                                           |
| `setupIntersectionMocking(mockFn)`            | Mock the `IntersectionObserver`. Call it in `beforeEach`. (Happens automatically in a Jest environment.)                                                                          |
| `resetIntersectionMocking()`                  | Reset the mocks on `IntersectionObserver`. Call it in `afterEach`. (Happens automatically in a Jest or Vitest environment.)                                                       |
| `destroyIntersectionMocking()`                | Destroy the mock and restore the browser's own `window.IntersectionObserver`.                                                                                                     |

### Testing libraries

The test utilities work with both [Jest](https://jestjs.io/) and
[Vitest](https://vitest.dev/).

#### Jest

Jest works out of the box. Import `react-intersection-observer/test-utils` in
your test files and use the mocking methods.

#### Vitest

With Vitest [globals](https://vitest.dev/config/#globals) enabled, the
IntersectionObserver is mocked automatically, just like in Jest. Otherwise, set
up and reset the mocking yourself, either in individual tests or in a
[setup file](https://vitest.dev/config/#setupfiles).

```js
import { vi, beforeEach, afterEach } from "vitest";
import {
  setupIntersectionMocking,
  resetIntersectionMocking,
} from "react-intersection-observer/test-utils";

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
});

afterEach(() => {
  resetIntersectionMocking();
});
```

You only need this if the test environment doesn't expose `beforeEach` globally
alongside either `jest.fn` or `vi.fn`.

#### Other testing libraries

Follow the [Vitest](#vitest) instructions. The same setup and reset code should
work, adapted to your test runner. Failing that, copy
[test-utils.ts](packages/react-intersection-observer/src/test-utils.ts) and make
your own version.

### Fallback behavior

You can create a
[Jest setup file](https://jestjs.io/docs/configuration#setupfilesafterenv-array)
that uses the
[unsupported fallback](https://github.com/thebuilder/react-intersection-observer#unsupported-fallback)
option, then override the `IntersectionObserver` in the test files where you
import `react-intersection-observer/test-utils`.

**test-setup.js**

```js
import { defaultFallbackInView } from "react-intersection-observer";

defaultFallbackInView(true); // or `false`, whichever is right for your app
```

To mock the Intersection Observer in every test instead, use a global setup
file. Add `react-intersection-observer/test-utils` to
[setupFilesAfterEnv](https://jestjs.io/docs/configuration#setupfilesafterenv-array)
in the Jest config, or [setupFiles](https://vitest.dev/config/#setupfiles) in
Vitest.

```js
module.exports = {
  setupFilesAfterEnv: ["react-intersection-observer/test-utils"],
};
```

### Test example

```js
import React from "react";
import { screen, render } from "@testing-library/react";
import { useInView } from "react-intersection-observer";
import {
  mockAllIsIntersecting,
  mockIsIntersecting,
  intersectionMockInstance,
} from "react-intersection-observer/test-utils";

const HookComponent = ({ options }) => {
  const { ref, inView } = useInView(options);
  return (
    <div ref={ref} data-testid="wrapper">
      {inView.toString()}
    </div>
  );
};

test("should create a hook inView", () => {
  render(<HookComponent />);

  // This causes all (existing) IntersectionObservers to be set as intersecting
  mockAllIsIntersecting(true);
  screen.getByText("true");
});

test("should create a hook inView with threshold", () => {
  render(<HookComponent options={{ threshold: 0.3 }} />);

  mockAllIsIntersecting(0.1);
  screen.getByText("false");

  // Once the threshold has been passed, it will trigger inView.
  mockAllIsIntersecting(0.3);
  screen.getByText("true");
});

test("should mock intersecting on a specific hook", () => {
  render(<HookComponent />);
  const wrapper = screen.getByTestId("wrapper");

  // Set the intersection state on the wrapper.
  mockIsIntersecting(wrapper, 0.5);
  screen.getByText("true");
});

test("should create a hook and call observe", () => {
  const { getByTestId } = render(<HookComponent />);
  const wrapper = getByTestId("wrapper");
  // Access the `IntersectionObserver` instance for the wrapper Element.
  const instance = intersectionMockInstance(wrapper);

  expect(instance.observe).toHaveBeenCalledWith(wrapper);
});
```

## Intersection Observer

[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
is the API used to determine whether an element is inside the viewport. Every
major browser
[supports it natively](http://caniuse.com/#feat=intersectionobserver), Safari
[since 12.1](https://webkit.org/blog/8718/new-webkit-features-in-safari-12-1/).
Add the polyfill if you still support older iOS versions or IE11.

### Unsupported fallback

If the client has no `IntersectionObserver`, the default behavior is to throw an
error. That crashes the React application unless an Error Boundary catches it.

You can instead set a fallback `inView` value to use when
`IntersectionObserver` doesn't exist. Make sure your application handles every
observer firing `true` (or `false`) at the same time.

You can set the fallback globally:

```js
import { defaultFallbackInView } from "react-intersection-observer";

defaultFallbackInView(true); // or 'false'
```

You can also set the fallback locally on `useInView` or `<InView>`. A local
value overrides the global one.

```jsx
import React from "react";
import { useInView } from "react-intersection-observer";

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

Import the [polyfill](https://www.npmjs.com/package/intersection-observer)
directly, or use a service like
[cdnjs.cloudflare.com/polyfill](https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js)
to add it when needed.

```sh
yarn add intersection-observer
```

Then import it in your app:

```js
import "intersection-observer";
```

With Webpack or a similar bundler, use
[dynamic imports](https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import)
to load the polyfill only when it's needed:

```js
/**
 * Feature detection, to figure out which polyfills need importing.
 **/
async function loadPolyfills() {
  if (typeof window.IntersectionObserver === "undefined") {
    await import("intersection-observer");
  }
}
```

## Low-level API

The [`observe`](src/observe.ts) method is the one
`react-intersection-observer` uses internally to create and destroy
IntersectionObserver instances. Use it when you need full control over when and
how observers are created.

```js
import { observe } from "react-intersection-observer";

const destroy = observe(element, callback, options);
```

| Name         | Type                       | Required | Description                                                |
| ------------ | -------------------------- | -------- | ---------------------------------------------------------- |
| **element**  | `Element`                  | true     | DOM element to observe                                     |
| **callback** | `ObserverInstanceCallback` | true     | The callback function that Intersection Observer will call |
| **options**  | `IntersectionObserverInit` | false    | The options for the Intersection Observer                  |

`observe` returns an `unobserve` function. Call it to destroy the observer
again.

> [!IMPORTANT]
> You most likely won't need this. It's here for handling
> IntersectionObservers outside React, or when you need full control over how
> instances are created.
