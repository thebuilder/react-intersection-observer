# react-intersection-observer
[![Dependency Status](https://david-dm.org/thebuilder/react-intersection-observer.svg)](https://david-dm.org/thebuilder/react-intersection-observer)
[![npm version](https://badge.fury.io/js/react-intersection-observer.svg)](https://www.npmjs.com/package/react-intersection-observer)

React component that allows triggers a function when the component enters or leaves the viewport.

```js
import Observer from 'react-intersection-observer'

<Observer>
  {inView => <h2>{`Header inside viewport ${inView}.`}</h2>}
</Observer>
```

## Demo
See https://thebuilder.github.io/react-intersection-observer/ for a demo.

## Installation

Install using [Yarn](https://yarnpkg.com):
```sh
yarn add react-view-pager
```

or NPM:
```sh
npm install react-view-pager --save
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

## Universal rendering
The IntersectionObserver polyfill requires `window` and `document`, and will crash if you try to import it outside the browser. 
To allow the Observer to be rendered universally, it sets `global.window` and `global.document` to empty objects if they are not defined.

Ideally you would **noop** the IntersectionObserver when rendering outside the browser, but to make integration easier i've included the hack in the module.

It could potentially conflict with other modules that checks for the existence of `window` and `document`. You can always require `lib/Observer.js` directly, to skip the window check. `lib/Observer.js` is also set as the `"browser"` field.
