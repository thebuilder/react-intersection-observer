import * as React from 'react';
import { IntersectionObserverProps, PlainChildrenProps } from './index';
import { observe } from './observers';

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
 * Monitors scroll, and triggers the children function with updated props
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
    const { threshold, root, rootMargin, trackVisibility, delay } = this.props;

    this._unobserveCb = observe(this.node, this.handleChange, {
      threshold,
      root,
      rootMargin,
      // @ts-ignore
      trackVisibility,
      // @ts-ignore
      delay,
    });
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
      tag,
      triggerOnce,
      threshold,
      root,
      rootMargin,
      onChange,
      skip,
      trackVisibility,
      delay,
      initialInView,
      ...props
    } = this.props;

    return React.createElement(
      as || tag || 'div',
      { ref: this.handleNode, ...props },
      children,
    );
  }
}
