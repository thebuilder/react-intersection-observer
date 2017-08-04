import React, { Component, createElement } from 'react' // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types'
import { observe, unobserve } from './intersection'

const isFunction = func => typeof func === 'function'

/**
 * Monitors scroll, and triggers the children function with updated props
 *
 <Observer>
 {inView => (
   <h1>{`${inView}`}</h1>
 )}
 </Observer>
 */
class Observer extends Component {
  static propTypes = {
    /** Element tag to use for the wrapping */
    tag: PropTypes.node,
    /** Children should be either a function or a node */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    /** Only trigger the inView callback once */
    triggerOnce: PropTypes.bool,
    /** Number between 0 and 1 indicating the the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points. */
    threshold: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.number,
    ]),
    /** The HTMLElement that is used as the viewport for checking visibility of the target. Defaults to the browser viewport if not specified or if null.*/
    root: PropTypes.object,
    /** Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left). */
    rootMargin: PropTypes.string,
    /** Unique identifier for the root element - This is used to identify the IntersectionObserver instance, so it can be reused.
     * If you defined a root element, without adding an id, it will create a new instance for all components. */
    rootId: PropTypes.string,
    /** Call this function whenever the in view state changes */
    onChange: PropTypes.func,
    /** Use render method to only render content when inView */
    render: PropTypes.func,
  }

  static defaultProps = {
    tag: 'div',
    threshold: 0,
    triggerOnce: false,
  }

  state = {
    inView: false,
  }

  componentWillUpdate(nextProps, nextState) {
    if (!!this.props.onChange && nextState.inView !== this.state.inView) {
      this.props.onChange(nextState.inView)
    }
  }

  componentDidUpdate(prevProps, prevState) {
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

  node = null

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

  handleNode = node => {
    if (this.node) unobserve(this.node)
    this.node = node
    this.observeNode()
  }

  handleChange = inView => this.setState({ inView })

  render() {
    const {
      children,
      render,
      tag,
      triggerOnce,
      threshold,
      root,
      rootMargin,
      ...props
    } = this.props

    const { inView } = this.state

    return createElement(
      tag,
      {
        ...props,
        ref: this.handleNode,
      },
      // If render is a function, use it to render content when in view
      inView && isFunction(render) ? render() : null,
      // If children is a function, render it with the current inView status.
      // Otherwise always render children. Assume onChange is being used outside, to control the the state of children.
      isFunction(children) ? children(inView) : children,
    )
  }
}

export default Observer
