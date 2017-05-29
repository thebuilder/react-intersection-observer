# react-intersection-observer

[![Greenkeeper badge](https://badges.greenkeeper.io/thebuilder/react-intersection-observer.svg)](https://greenkeeper.io/)
[![Travis](https://travis-ci.org/thebuilder/react-intersection-observer.svg?branch=master)](https://travis-ci.org/thebuilder/react-intersection-observer)
[![Dependency Status](https://david-dm.org/thebuilder/react-intersection-observer.svg)](https://david-dm.org/thebuilder/react-intersection-observer)
[![npm](https://img.shields.io/npm/v/react-intersection-observer.svg)](https://www.npmjs.com/package/react-intersection-observer)

React component that triggers a function when the component enters or leaves the viewport. No complex configuration needed, just wrap your views and it handles the events.

```js
import Observer from 'react-intersection-observer'

<Observer>
  {inView => <h2>{`Header inside viewport ${inView}.`}</h2>}
</Observer>
```

## Demo
See https://thebuilder.github.io/react-intersection-observer/ for a demo.

#### Scroll monitor
This module is used in [react-scroll-percentage](https://github.com/thebuilder/react-scroll-percentage) to monitor the scroll position of elements in view. This module is also a great example of using `react-intersection-observer` as the basis for more complex needs.

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
The component requires the [intersection-observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to be available on the global namespace. At the moment you should include a polyfill to ensure support in all browsers.

You can import the [polyfill](https://yarnpkg.com/en/package/intersection-observer) directly or use a service like [polyfill.io](https://polyfill.io/v2/docs/) that can add it when needed.

```sh
yarn add intersection-observer
```

Then import it in your app

```js
import 'intersection-observer'
```

## Props
The **`<Observer />`** accepts the following props:

| Name             | Type      | Default           | Required | Description                                           |
| ---------------- | --------- | ----------------- | -------- | ----------------------------------------------------- |
| tag              | String    |                   | false    | Element tag to use for the wrapping component         |
| children         | func/node |                   | false    | Children should be either a function or a node        |
| triggerOnce      | Bool      | false             | true     | Only trigger this method once                         |
| threshold        | Number    | 0                 | false    | Number between 0 and 1 indicating the the percentage that should be visible before triggering  |
| onChange         | Func      |                   | false    | Call this function whenever the in view state changes |
| render           | Func      |                   | false    | Use render method to only render content when inView  |

## Example code

### Child as function
The basic usage pass a function as the child. It will be called whenever the state changes, with the new value of `inView`.

```js
import Observer from 'react-intersection-observer'

<Observer>
  {inView => <h2>{`Header inside viewport ${inView}.`}</h2>}
</Observer>
```

### Render callback
For simple usecases where you wan't to only render a component when it enters view, you can use the `render` prop.

```js
import Observer from 'react-intersection-observer'

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
```


### OnChange callback
You can monitor the onChange method, and control the state in your own component.
The child node will always be rendered.

```js
import Observer from 'react-intersection-observer'

<Observer onChange={(inView) => console.log('Inview:', inView)}>
  <h2>
    Plain children are always rendered. Use onChange to monitor state.
  </h2>
</Observer>
```
