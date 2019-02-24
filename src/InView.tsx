import * as React from 'react'
import invariant from 'invariant'
import { observe, unobserve } from './intersection'
import { IntersectionObserverProps, PlainChildrenProps } from './typings/types'

type State = {
  inView: boolean
  entry?: IntersectionObserverEntry
}

function isPlainChildren(
  props: IntersectionObserverProps | PlainChildrenProps,
): props is PlainChildrenProps {
  return typeof props.children !== 'function'
}

/**
 * Monitors scroll, and triggers the children function with updated props
 *
 <InView>
 {({inView, ref}) => (
   <h1 ref={ref}>{`${inView}`}</h1>
 )}
 </InView>
 */
export class InView extends React.Component<
  IntersectionObserverProps | PlainChildrenProps,
  State
> {
  static displayName = 'InView'
  static defaultProps = {
    threshold: 0,
    triggerOnce: false,
  }

  state: State = {
    inView: false,
    entry: undefined,
  }

  componentDidMount() {
    /* istanbul ignore else  */
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        this.node,
        `react-intersection-observer: No DOM node found. Make sure you forward "ref" to the root DOM element you want to observe.`,
      )
    }
  }

  componentDidUpdate(prevProps: IntersectionObserverProps, prevState: State) {
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

  node: Element | null = null

  observeNode() {
    if (!this.node) return
    const { threshold, root, rootMargin } = this.props
    observe(this.node, this.handleChange, {
      threshold,
      root,
      rootMargin,
    })
  }

  handleNode = (node?: Element | null) => {
    if (this.node) unobserve(this.node)
    this.node = node ? node : null
    this.observeNode()
  }

  handleChange = (inView: boolean, entry: IntersectionObserverEntry) => {
    this.setState({ inView, entry })
    if (this.props.onChange) {
      this.props.onChange(inView, entry)
    }
  }

  render() {
    const { inView, entry } = this.state
    if (!isPlainChildren(this.props)) {
      return this.props.children({ inView, entry, ref: this.handleNode })
    }

    const {
      children,
      as,
      tag,
      triggerOnce,
      threshold,
      root,
      rootMargin,
      ...props
    } = this.props

    return React.createElement(
      as || tag || 'div',
      { ref: this.handleNode, ...props },
      children,
    )
  }
}
