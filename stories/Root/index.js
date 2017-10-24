// @flow
import * as React from 'react'

const style = {
  margin: '64px',
  backgroundColor: 'slategrey',
  overflowY: 'scroll',
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
}

type Props = {
  children: (node: HTMLElement) => React.Node,
  style?: {
    [key: string]: string | number,
  },
}

type State = {
  node: ?HTMLElement,
}

class RootComponent extends React.PureComponent<Props, State> {
  state = {
    node: null,
  }

  handleNode = (node: ?HTMLElement) => {
    this.setState({
      node,
    })
  }

  render() {
    return (
      <div ref={this.handleNode} style={{ ...style, ...this.props.style }}>
        {this.state.node ? this.props.children(this.state.node) : null}
      </div>
    )
  }
}

export default RootComponent
