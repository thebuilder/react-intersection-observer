# react-intersection-observer

[![Version Badge][npm-version-svg]][package-url]
[![GZipped size][npm-minzip-svg]][bundlephobia-url]
[![Build Status][travis-svg]][travis-url]
[![Coverage Statu][coveralls-svg]][coveralls-url]
[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Greenkeeper badge][greenkeeper-svg]][greenkeeper-url]
[![styled with prettier][prettier-svg]][prettier-url]

React implementation of the
[Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
to tell you when an element enters or leaves the viewport. Contains both a
[Hooks](#hooks), [render props](#render-props) and
[plain children](#plain-children) implementation.

**Storybook Demo:** https://thebuilder.github.io/react-intersection-observer/

## Features

- 🎣 **Hooks or Component API** - With `useInView` it's easier than ever to
  monitor elements
- ⚡️ **Optimized performance** - Auto reuses Intersection Observer instances
  where possible
- ⚙️ **Matches native API** - Intuitive to use
- 🌳 **Tree-shakeable** - Only include the parts you use
- 💥 **Tiny bundle** [~1.7 kB gzipped][bundlephobia-url]

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add react-intersection-observer
```

or NPM:

```sh
npm install react-intersection-observer --save
```

> ⚠️ You also want to add the
> [intersection-observer](https://www.npmjs.com/package/react-intersection-observer)
> polyfill for full browser support. Check out adding the [polyfill](#polyfill)
> for details about how you can include it.

## Usage

### Hooks 🎣

#### `useInView`

```js
const [ref, inView, entry] = useInView(options)
```

The new React Hooks make it easier than ever to monitor the `inView` state of
your components. Call the `useInView` hook with the (optional)
[options](#options) you need. It will return an array containing a `ref`, the
`inView` status and the current
[`IntersectionObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry).
Assign the `ref` to the DOM element you want to monitor, and the hook will
report the status.

```jsx
import React, { useRef } from 'react'
import { useInView } from 'react-intersection-observer'

const Component = () => {
  const [ref, inView, entry] = useInView({
    /* Optional options */
    threshold: 0,
  })

  return (
    <div ref={ref}>
      <h2>{`Header inside viewport ${inView}.`}</h2>
    </div>
  )
}
```

[![Edit react-intersection-observer](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-intersection-observer-ud2vo?fontsize=14&hidenavigation=1&theme=dark)

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
import { InView } from 'react-intersection-observer'

const Component = () => (
  <InView>
    {({ inView, ref, entry }) => (
      <div ref={ref}>
        <h2>{`Header inside viewport ${inView}.`}</h2>
      </div>
    )}
  </InView>
)

export default Component
```

### Plain children

You can pass any element to the `<InView />`, and it will handle creating the
wrapping DOM element. Add a handler to the `onChange` method, and control the
state in your own component. Any extra props you add to `<InView>` will be
passed to the HTML element, allowing you set the `className`, `style`, etc.

```jsx
import { InView } from 'react-intersection-observer'

const Component = () => (
  <InView as="div" onChange={(inView, entry) => console.log('Inview:', inView)}>
    <h2>Plain children are always rendered. Use onChange to monitor state.</h2>
  </InView>
)

export default Component
```

> ⚠️ When rendering a plain child, make sure you keep your HTML output semantic.
> Change the `as` to match the context, and add a `className` to style the
> `<InView />`. The component does not support Ref Forwarding, so if you need a
> `ref` to the HTML element, use the Render Props version instead.

## API

### Options

Provide these as props on the **`<InView />`** component and as the options
argument for the hooks.

| Name            | Type               | Default | Required | Description                                                                                                                                                    |
| --------------- | ------------------ | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **root**        | Element            | window  | false    | The Element that is used as the viewport for checking visibility of the target. Defaults to the browser viewport (`window`) if not specified or if null.       |
| **rootMargin**  | string             | '0px'   | false    | Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).                             |
| **threshold**   | number \| number[] | 0       | false    | Number between 0 and 1 indicating the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points. |
| **triggerOnce** | boolean            | false   | false    | Only trigger this method once                                                                                                                                  |

> ⚠️ When passing an array to `threshold`, store the array in a constant to
> avoid the component re-rendering too often. For example:

```js
const THRESHOLD = [0.25, 0.5, 0.75] // Store multiple thresholds in a constant
const MyComponent = () => {
  const [ref, inView, entry] = useInView({ threshold: THRESHOLD })
  return (
    <div ref={ref}>
      Triggered at intersection ratio {entry.intersectionRatio}
    </div>
  )
}
```

### InView Props

The **`<InView />`** component also accepts the following props:

| Name         | Type                                                     | Default | Required | Description                                                                                                                                                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **as**       | `string`                                                 | 'div'   | false    | Render the wrapping element as this element. Defaults to `div`.                                                                                                                                                                                                                                                               |
| **children** | `({ref, inView, entry}) => React.ReactNode`, `ReactNode` |         | true     | Children expects a function that receives an object containing the `inView` boolean and a `ref` that should be assigned to the element root. Alternatively pass a plain child, to have the `<InView />` deal with the wrapping element. You will also get the `IntersectionObserverEntry` as `entry, giving you more details. |
| **onChange** | `(inView, entry) => void`                                |         | false    | Call this function whenever the in view state changes. It will receive the `inView` boolean, alongside the current `IntersectionObserverEntry`.                                                                                                                                                                               |

## Recipes

The `IntersectionObserver` itself is just a simple but powerful tool. Here's a
few ideas for how you can use it.

- [Lazy image load](docs/Recipes.md#lazy-image-load)
- [Trigger animations](docs/Recipes.md#trigger-animations)
- [Track impressions](docs/Recipes.md#track-impressions) _(Google Analytics, Tag
  Manager, etc)_

## FAQ

### How can i assign multiple ref's to a component?

You can wrap multiple `ref` assignments in a single `useCallback`:

```js
const setRefs = useCallback(
  node => {
    // Ref's from useRef needs to have the node assigned to `current`
    ref.current = node
    // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
    inViewRef(node)
  },
  [inViewRef],
)
```

## Testing

In order to write meaningful tests, the `IntersectionObserver` needs to be
mocked. If you are writing your tests in Jest, you can use the included
`test-utils.js`. It mocks the `IntersectionObserver`, and includes a few methods
to assist with faking the `inView` state.

### `test-utils.js`

Import the methods from `react-intersection-observer/test-utils`.

**`mockAllIsIntersecting(isIntersecting:boolean)`**  
Set the `isIntersecting` on all current IntersectionObserver instances.

**`mockIsIntersecting(element:Element, isIntersecting:boolean)`**  
Set the `isIntersecting` for the IntersectionObserver of a specific element.

**`intersectionMockInstance(element:Element): IntersectionObserver`**  
Call the `intersectionMockInstance` method with an element, to get the (mocked)
`IntersectionObserver` instance. You can use this to spy on the `observe` and
`unobserve` methods.

### Test Example

```js
import React from 'react'
import { render } from 'react-testing-library'
import { useInView } from 'react-intersection-observer'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'

const HookComponent = ({ options }) => {
  const [ref, inView] = useInView(options)
  return <div ref={ref}>{inView.toString()}</div>
}

test('should create a hook inView', () => {
  const { getByText } = render(<HookComponent />)

  // This causes all (existing) IntersectionObservers to be set as intersecting
  mockAllIsIntersecting(true)
  getByText('true')
})
```

## Intersection Observer

[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
is the API is used to determine if an element is inside the viewport or not.
[Browser support is pretty good](http://caniuse.com/#feat=intersectionobserver) -
With
[Safari adding support in 12.1](https://webkit.org/blog/8718/new-webkit-features-in-safari-12-1/),
all major browsers now support Intersection Observers natively.

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
import 'intersection-observer'
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
    await import('intersection-observer')
  }
}
```

[package-url]: https://npmjs.org/package/react-intersection-observer
[npm-version-svg]: https://img.shields.io/npm/v/react-intersection-observer.svg
[npm-minzip-svg]: https://img.shields.io/bundlephobia/minzip/react.svg
[bundlephobia-url]:
  https://bundlephobia.com/result?p=react-intersection-observer
[travis-svg]: https://travis-ci.org/thebuilder/react-intersection-observer.svg
[travis-url]: https://travis-ci.org/thebuilder/react-intersection-observer
[coveralls-svg]:
  https://coveralls.io/repos/github/thebuilder/react-intersection-observer/badge.svg?branch=master
[coveralls-url]:
  https://coveralls.io/github/thebuilder/react-intersection-observer?branch=master
[deps-svg]: https://david-dm.org/thebuilder/react-intersection-observer.svg
[deps-url]: https://david-dm.org/thebuilder/react-intersection-observer
[dev-deps-svg]:
  https://david-dm.org/thebuilder/react-intersection-observer/dev-status.svg
[dev-deps-url]:
  https://david-dm.org/thebuilder/react-intersection-observer#info=devDependencies
[license-image]: http://img.shields.io/npm/l/react-intersection-observer.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/react-intersection-observer.svg
[downloads-url]:
  http://npm-stat.com/charts.html?package=react-intersection-observer
[greenkeeper-svg]:
  https://badges.greenkeeper.io/thebuilder/react-intersection-observer.svg
[greenkeeper-url]: https://greenkeeper.io/
[prettier-svg]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
