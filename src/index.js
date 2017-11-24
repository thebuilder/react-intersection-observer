// @flow
import * as React from 'react'
import { observe, unobserve } from './intersection'

type Props = {
  /** Element tag to use for the wrapping */
  tag: string,
  /** Only trigger the inView callback once */
  triggerOnce: boolean,
  /** Children should be either a function or a node */
  children?: ((inView: boolean) => React.Node) | React.Node,
  /** Number between 0 and 1 indicating the the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points. */
  threshold?: number | Array<number>,
  /** The HTMLElement that is used as the viewport for checking visibility of the target. Defaults to the browser viewport if not specified or if null.*/
  root?: HTMLElement,
  /** Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left). */
  rootMargin?: string,
  /** Unique identifier for the root element - This is used to identify the IntersectionObserver instance, so it can be reused.
   * If you defined a root element, without adding an id, it will create a new instance for all components. */
  rootId?: string,
  /** Call this function whenever the in view state changes */
  onChange?: (inView: boolean) => void,
  /** Use render method to only render content when inView */
  render?: () => React.Node,
  /** Get a reference to the the inner DOM node */
  innerRef?: (element: ?HTMLElement) => void,
}

type State = {
  inView: boolean,
}

/**
 * Monitors scroll, and triggers the children function with updated props
 *
 <Observer>
 {inView => (
   <h1>{`${inView}`}</h1>
 )}
 </Observer>
 */
class Observer extends React.Component<Props, State> {
  static defaultProps = {
    tag: 'div',
    threshold: 0,
    triggerOnce: false,
  }

  state = {
    inView: false,
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (!!this.props.onChange && nextState !== this.state) {
      this.props.onChange(nextState.inView)
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // If a IntersectionObserver option changed, reinit the observer
    if (
      prevProps.rootMargin !== this.props.rootMargin ||
      prevProps.root !== this.props.root ||
      prevProps.threshold !== this.props.threshold
    ) {
      unobserve(this.node)
      this.observeNode()
    }

    if (prevState.inView !== this.state.inView) {
      if (this.state.inView && this.props.triggerOnce) {
        unobserve(this.node)
        this.node = null
      }
    }
  }

  componentWillUnmount() {
    if (this.node) {
      unobserve(this.node)
      this.node = null
    }
  }

  node: ?HTMLElement = null

  observeNode() {
    if (!this.node) return
    const { threshold, root, rootMargin, rootId } = this.props
    observe(
      this.node,
      this.handleChange,
      {
        threshold,
        root,
        rootMargin,
      },
      rootId,
    )
  }

  handleNode = (node: ?HTMLElement) => {
    if (this.node) unobserve(this.node)
    this.node = node
    this.observeNode()

    if (this.props.innerRef) {
      this.props.innerRef(node)
    }
  }

  handleChange = (inView: boolean) => this.setState({ inView })

  render() {
    const {
      children,
      render,
      tag,
      innerRef,
      triggerOnce,
      threshold,
      root,
      rootId,
      rootMargin,
      ...props
    } = this.props

    const { inView } = this.state

    return React.createElement(
      tag,
      {
        ...props,
        ref: this.handleNode,
      },
      // If render is a function, use it to render content when in view
      inView && typeof render === 'function' ? render() : null,
      // // If children is a function, render it with the current inView status.
      // // Otherwise always render children. Assume onChange is being used outside, to control the the state of children.
      typeof children === 'function' ? children(inView) : children,
    )
  }
}

export default Observer
