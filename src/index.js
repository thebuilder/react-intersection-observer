// @flow
import * as React from 'react'
import { observe, unobserve } from './intersection'
import invariant from 'invariant'
export { useInView } from './hooks/useInView'

export type IntersectionOptions = {
  /** Number between 0 and 1 indicating the the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points. */
  threshold?: number | Array<number>,
  /** The HTMLElement that is used as the viewport for checking visibility of the target. Defaults to the browser viewport if not specified or if null.*/
  root?: HTMLElement,
  /** Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left). */
  rootMargin?: string,
  /** Unique identifier for the root element - This is used to identify the IntersectionObserver instance, so it can be reused.
   * If you defined a root element, without adding an id, it will create a new instance for all components. */
  rootId?: string,
  /** Only trigger the inView callback once */
  triggerOnce?: boolean,
}

type Props = IntersectionOptions & {
  /** Children expects a function that receives an object contain an `inView` boolean and `ref` that should be assigned to the element root. */
  children?:
    | (({
        inView: boolean,
        ref: (node: ?HTMLElement) => void,
      }) => React.Node)
    | React.Node,
  /** @deprecated replace render with children */
  render?: ({
    inView: boolean,
    ref: (node: ?HTMLElement) => void,
  }) => React.Node,
  /** Element tag to use for the wrapping element when rendering a plain React.Node. Defaults to 'div'  */
  tag?: string,
  /** Call this function whenever the in view state changes */
  onChange?: (inView: boolean) => void,
}

type State = {
  inView: boolean,
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
export class InView extends React.Component<Props, State> {
  static defaultProps = {
    threshold: 0,
    triggerOnce: false,
  }

  state = {
    inView: false,
  }

  componentDidMount() {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.hasOwnProperty('render')) {
        console.warn(
          `react-intersection-observer: "render" is deprecated, and should be replaced with "children"`,
          this.node,
        )
      }
      invariant(
        this.node,
        `react-intersection-observer: No DOM node found. Make sure you forward "ref" to the root DOM element you want to observe.`,
      )
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
  }

  handleChange = (inView: boolean) => {
    this.setState({ inView })
    if (this.props.onChange) {
      this.props.onChange(inView)
    }
  }

  render() {
    const {
      children,
      render,
      tag,
      triggerOnce,
      threshold,
      root,
      rootId,
      rootMargin,
      ...props
    } = this.props

    const { inView } = this.state
    const renderMethod = children || render

    if (typeof renderMethod === 'function') {
      return renderMethod({ inView, ref: this.handleNode })
    }

    return React.createElement(
      tag || 'div',
      { ref: this.handleNode, ...props },
      children,
    )
  }
}

export default InView
