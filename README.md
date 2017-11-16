# react-intersection-observer

[![Greenkeeper badge](https://badges.greenkeeper.io/thebuilder/react-intersection-observer.svg)](https://greenkeeper.io/)
[![Travis](https://travis-ci.org/thebuilder/react-intersection-observer.svg?branch=master)](https://travis-ci.org/thebuilder/react-intersection-observer)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/react-intersection-observer.svg)](https://www.npmjs.com/package/react-intersection-observer)

React component that triggers a function when the component enters or leaves the
viewport. No complex configuration needed, just wrap your views and it handles
the events.

```js
import Observer from 'react-intersection-observer'

const Component = () => (
  <Observer>
    {inView => <h2>{`Header inside viewport ${inView}.`}</h2>}
  </Observer>
)

export default Component
```

## Demo

See https://thebuilder.github.io/react-intersection-observer/ for a demo.

#### Scroll monitor

This module is used in
[react-scroll-percentage](https://github.com/thebuilder/react-scroll-percentage)
to monitor the scroll position of elements in view. This module is also a great
example of using `react-intersection-observer` as the basis for more complex
needs.

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add react-intersection-observer
```

or NPM:

```sh
npm install react-intersection-observer --save
```

### Polyfill for intersection-observer

The component requires the [intersection-observer
API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
to be available on the global namespace. At the moment you should include a
polyfill to ensure support in all browsers.

You can import the
[polyfill](https://yarnpkg.com/en/package/intersection-observer) directly or use
a service like [polyfill.io](https://polyfill.io/v2/docs/) that can add it when
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

## Props

The **`<Observer />`** accepts the following props:

| Name        | Type        | Default | Required | Description                                                                                                                                                                                                                      |
| ----------- | ----------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | func/node   |         | true     | Children should be either a function or a node                                                                                                                                                                                   |
| root        | HTMLElement |         | false    | The HTMLElement that is used as the viewport for checking visibility of the target. Defaults to the browser viewport if not specified or if null.                                                                                |
| rootId      | String      |         | false    | Unique identifier for the root element - This is used to identify the IntersectionObserver instance, so it can be reused. If you defined a root element, without adding an id, it will create a new instance for all components. |
| rootMargin  | String      | '0px'   | false    | Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).                                                                                               |
| tag         | String      | 'div'   | false    | Element tag to use for the wrapping component                                                                                                                                                                                    |
| threshold   | Number      | 0       | false    | Number between 0 and 1 indicating the the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points.                                                               |
| triggerOnce | Bool        | false   | false    | Only trigger this method once                                                                                                                                                                                                    |
| onChange    | Func        |         | false    | Call this function whenever the in view state changes                                                                                                                                                                            |
| render      | Func        |         | false    | Use render method to only render content when inView                                                                                                                                                                             |

## Example code

### Child as function

The default way to use the `Observer`, is to pass a function as the child. It
will be called whenever the state changes, with the new value of `inView`.

```js
import Observer from 'react-intersection-observer'

const Component = () => (
  <Observer>
    {inView => <h2>{`Header inside viewport ${inView}.`}</h2>}
  </Observer>
)

export default Component
```

### Render callback

For simple use cases where you want to only render a component when it enters
view, you can use the `render` prop.

```js
import Observer from 'react-intersection-observer'

const Component = () => (
  <Observer
    style={{ height: 200, position: 'relative' }}
    render={() => (
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
        }}
      >
        <p>
          {'Make sure that the Observer controls the height, so it does not change change when element is added.'}
        </p>
      </div>
    )}
  />
)

export default Component
```

### OnChange callback

You can monitor the onChange method, and control the state in your own
component. The child node will always be rendered.

```js
import Observer from 'react-intersection-observer'

const Component = () => (
  <Observer onChange={(inView) => console.log('Inview:', inView)}>
    <h2>
      Plain children are always rendered. Use onChange to monitor state.
    </h2>
  </Observer>
)

export default Component
```
