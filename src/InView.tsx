import * as React from 'react';
import { IntersectionObserverProps, PlainChildrenProps } from './index';
import { observe } from './observe';

type State = {
  inView: boolean;
  entry?: IntersectionObserverEntry;
};

function isPlainChildren(
  props: IntersectionObserverProps | PlainChildrenProps,
): props is PlainChildrenProps {
  return typeof props.children !== 'function';
}

/**
 ## Render props

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

 ## Plain children

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
 */
export class InView extends React.Component<
  IntersectionObserverProps | PlainChildrenProps,
  State
> {
  static displayName = 'InView';
  static defaultProps = {
    threshold: 0,
    triggerOnce: false,
    initialInView: false,
  };

  constructor(props: IntersectionObserverProps | PlainChildrenProps) {
    super(props);
    this.state = {
      inView: !!props.initialInView,
      entry: undefined,
    };
  }

  componentDidUpdate(prevProps: IntersectionObserverProps) {
    // If a IntersectionObserver option changed, reinit the observer
    if (
      prevProps.rootMargin !== this.props.rootMargin ||
      prevProps.root !== this.props.root ||
      prevProps.threshold !== this.props.threshold ||
      prevProps.skip !== this.props.skip ||
      prevProps.trackVisibility !== this.props.trackVisibility ||
      prevProps.delay !== this.props.delay
    ) {
      this.unobserve();
      this.observeNode();
    }
  }

  componentWillUnmount() {
    this.unobserve();
    this.node = null;
  }

  node: Element | null = null;
  _unobserveCb: (() => void) | null = null;

  observeNode() {
    if (!this.node || this.props.skip) return;
    const {
      threshold,
      root,
      rootMargin,
      trackVisibility,
      delay,
      fallbackInView,
    } = this.props;

    this._unobserveCb = observe(
      this.node,
      this.handleChange,
      {
        threshold,
        root,
        rootMargin,
        // @ts-ignore
        trackVisibility,
        // @ts-ignore
        delay,
      },
      fallbackInView,
    );
  }

  unobserve() {
    if (this._unobserveCb) {
      this._unobserveCb();
      this._unobserveCb = null;
    }
  }

  handleNode = (node?: Element | null) => {
    if (this.node) {
      // Clear the old observer, before we start observing a new element
      this.unobserve();

      if (!node && !this.props.triggerOnce && !this.props.skip) {
        // Reset the state if we get a new node, and we aren't ignoring updates
        this.setState({ inView: !!this.props.initialInView, entry: undefined });
      }
    }

    this.node = node ? node : null;
    this.observeNode();
  };

  handleChange = (inView: boolean, entry: IntersectionObserverEntry) => {
    if (inView && this.props.triggerOnce) {
      // If `triggerOnce` is true, we should stop observing the element.
      this.unobserve();
    }
    if (!isPlainChildren(this.props)) {
      // Store the current State, so we can pass it to the children in the next render update
      // There's no reason to update the state for plain children, since it's not used in the rendering.
      this.setState({ inView, entry });
    }
    if (this.props.onChange) {
      // If the user is actively listening for onChange, always trigger it
      this.props.onChange(inView, entry);
    }
  };

  render() {
    if (!isPlainChildren(this.props)) {
      const { inView, entry } = this.state;
      return this.props.children({ inView, entry, ref: this.handleNode });
    }

    const {
      children,
      as,
      triggerOnce,
      threshold,
      root,
      rootMargin,
      onChange,
      skip,
      trackVisibility,
      delay,
      initialInView,
      fallbackInView,
      ...props
    } = this.props;

    return React.createElement(
      as || 'div',
      { ref: this.handleNode, ...props },
      children,
    );
  }
}
