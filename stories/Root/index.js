import React, { PureComponent } from 'react'

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

class RootComponent extends PureComponent {
  state = {
    node: null,
  }

  handleNode = node => {
    this.rootNode = node
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
