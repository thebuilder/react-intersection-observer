/** @jsx jsx */
import { jsx } from '@emotion/react'
import * as React from 'react'

type Props = {
  children: (node: HTMLElement) => React.ReactNode
  className?: string
}

type State = {
  node: HTMLElement | null
}

class RootComponent extends React.PureComponent<Props, State> {
  state = {
    node: null,
  }

  handleNode = (node: HTMLElement | null) => {
    this.setState({
      node,
    })
  }

  render() {
    return (
      <div
        ref={this.handleNode}
        className={this.props.className}
        css={{
          margin: '64px',
          backgroundColor: 'slategrey',
          overflowY: 'scroll',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
        }}
      >
        {/*
        // @ts-ignore */}
        {this.state.node ? this.props.children(this.state.node) : null}
      </div>
    )
  }
}

export default RootComponent
