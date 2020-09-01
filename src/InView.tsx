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
  };

  state: State = {
    inView: false,
    entry: undefined,
  };

  componentDidUpdate(prevProps: IntersectionObserverProps, prevState: State) {
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

    if (prevState.inView !== this.state.inView) {
      if (this.state.inView && this.props.triggerOnce) {
        this.unobserve();
        this.node = null;
      }
    }
  }

  componentWillUnmount() {
    if (this.node) {
      this.unobserve();
      this.node = null;
    }
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
      this.unobserve();
      if (!node && !this.props.triggerOnce && !this.props.skip) {
        this.setState({ inView: false, entry: undefined });
      }
    }
    this.node = node ? node : null;
    this.observeNode();
  };

  handleChange = (entry: IntersectionObserverEntry) => {
    const inView = entry.isIntersecting || false;
    // Only trigger a state update if inView has changed.
    // This prevents an unnecessary extra state update during mount, when the element stats outside the viewport
    if (inView !== this.state.inView || inView) {
      this.setState({ inView, entry });
    }
    if (this.props.onChange) {
      // If the user is actively listening for onChange, always trigger it
      this.props.onChange(inView, entry);
    }
  };

  render() {
    const { inView, entry } = this.state;
    if (!isPlainChildren(this.props)) {
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
      ...props
    } = this.props;

    return React.createElement(
      as || tag || 'div',
      { ref: this.handleNode, ...props },
      children,
    );
  }
}
