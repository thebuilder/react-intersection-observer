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
    /** Only trigger this method once */
    triggerOnce: PropTypes.bool,
    /** Number between 0 and 1 indicating the the percentage that should be visible before triggering */
    threshold: PropTypes.number,
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
      if (nextState.inView && nextProps.unobserve) {
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
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

  handleNode = node => {
    if (this.node) unobserve(this.node)
    if (node) {
      observe(
        node,
        this.handleChange,
        this.props.triggerOnce,
        this.props.threshold,
      )
    }
    this.node = node
  }

  handleChange = inView => this.setState({ inView })

  render() {
    const {
      children,
      render,
      tag,
      triggerOnce,
      threshold,
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
