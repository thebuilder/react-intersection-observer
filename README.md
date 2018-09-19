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

React component that triggers a function when the component enters or leaves the
viewport. No complex configuration needed, just wrap your views and it handles
the events.

> **Storybook demo:** https://thebuilder.github.io/react-intersection-observer/

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add react-intersection-observer
```

or NPM:

```sh
npm install react-intersection-observer --save
```

> ⚠️ You also want to add the [intersection-observer](https://www.npmjs.com/package/react-intersection-observer) polyfill for full browser support. Check out adding the [polyfill](#polyfill) for details about how you can include it.

## Usage

### Child as function

To use the `Observer`, you pass it a function. It will be called whenever the state changes, with the new value of `inView`.
In addition to the `inView` prop, children also receives a `ref` that should be set on the containing DOM element.
This is the element that the IntersectionObserver will monitor.

```jsx
import Observer from 'react-intersection-observer'

const Component = () => (
  <Observer>
    {({ inView, ref }) => (
      <div ref={ref}>
        <h2>{`Header inside viewport ${inView}.`}</h2>
      </div>
    )}
  </Observer>
)

export default Component
```

### Plain children

You can pass any element to the `<Observer />`, and it will handle creating the wrapping DOM element.
Add a handler to the `onChange` method, and control the state in your own component.
It will pass any extra props to the HTML element, allowing you set the `className`, `style`, etc.

```jsx
import Observer from 'react-intersection-observer'

const Component = () => (
  <Observer tag="div" onChange={inView => console.log('Inview:', inView)}>
    <h2>Plain children are always rendered. Use onChange to monitor state.</h2>
  </Observer>
)

export default Component
```

> ⚠️ When rendering a plain child, make sure you keep your HTML output semantic.
> Change the `tag` to match the context, and add a `className` to style the `<Observer />`.

## Props

The **`<Observer />`** accepts the following props:

| Name            | Type                                       | Default | Required | Description                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------ | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **children**    | ({inView, ref}) => React.Node / React.Node |         | true     | Children expects a function that receives an object contain an `inView` boolean and `ref` that should be assigned to the element root. Alternately pass a plain child, to have the `<Observer />` deal with the wrapping element. |
| **onChange**    | (inView) => void                           |         | false    | Call this function whenever the in view state changes                                                                                                                                                                             |
| **root**        | HTMLElement                                |         | false    | The HTMLElement that is used as the viewport for checking visibility of the target. Defaults to the browser viewport if not specified or if null.                                                                                 |
| **rootId**      | String                                     |         | false    | Unique identifier for the root element - This is used to identify the IntersectionObserver instance, so it can be reused. If you defined a root element, without adding an id, it will create a new instance for all components.  |
| **rootMargin**  | String                                     | '0px'   | false    | Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).                                                                                                |
| **threshold**   | Number                                     | 0       | false    | Number between 0 and 1 indicating the the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points.                                                                |
| **triggerOnce** | Bool                                       | false   | false    | Only trigger this method once                                                                                                                                                                                                     |

## Usage in other projects

### react-scroll-percentage

This module is used in
[react-scroll-percentage](https://github.com/thebuilder/react-scroll-percentage)
to monitor the scroll position of elements in view, useful for animating items as
they become visible. This module is also a great example of using `react-intersection-observer`
as the basis for more complex needs.

## Intersection Observer

[Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
is the API is used to determine if an element is inside the viewport or not. Browser support is pretty good, but Safari is still missing support.

> [Can i use intersectionobserver?](https://caniuse.com/#feat=intersectionobserver)

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

If you are using Webpack (or similar) you could use [dynamic
imports](https://webpack.js.org/api/module-methods/#import-), to load the
Polyfill only if needed. A basic implementation could look something like this:

```js
loadPolyfills()
  .then(() => /* Render React application now that your Polyfills are ready */)

/**
* Do feature detection, to figure out which polyfills needs to be imported.
**/
function loadPolyfills() {
  const polyfills = []

  if (!supportsIntersectionObserver()) {
    polyfills.push(import('intersection-observer'))
  }

  return Promise.all(polyfills)
}

function supportsIntersectionObserver() {
  return (
    'IntersectionObserver' in global &&
    'IntersectionObserverEntry' in global &&
    'intersectionRatio' in IntersectionObserverEntry.prototype
  )
}
```

[package-url]: https://npmjs.org/package/react-intersection-observer
[npm-version-svg]: https://img.shields.io/npm/v/react-intersection-observer.svg
[npm-minzip-svg]: https://img.shields.io/bundlephobia/minzip/react.svg
[bundlephobia-url]: https://bundlephobia.com/result?p=react-intersection-observer
[travis-svg]: https://travis-ci.org/thebuilder/react-intersection-observer.svg
[travis-url]: https://travis-ci.org/thebuilder/react-intersection-observer
[coveralls-svg]: https://coveralls.io/repos/github/thebuilder/react-intersection-observer/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/thebuilder/react-intersection-observer?branch=master
[deps-svg]: https://david-dm.org/thebuilder/react-intersection-observer.svg
[deps-url]: https://david-dm.org/thebuilder/react-intersection-observer
[dev-deps-svg]: https://david-dm.org/thebuilder/react-intersection-observer/dev-status.svg
[dev-deps-url]: https://david-dm.org/thebuilder/react-intersection-observer#info=devDependencies
[license-image]: http://img.shields.io/npm/l/react-intersection-observer.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/react-intersection-observer.svg
[downloads-url]: http://npm-stat.com/charts.html?package=react-intersection-observer
[greenkeeper-svg]: https://badges.greenkeeper.io/thebuilder/react-intersection-observer.svg
[greenkeeper-url]: https://greenkeeper.io/
[prettier-svg]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
