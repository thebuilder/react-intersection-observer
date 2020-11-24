import * as React from 'react';

type Props = {
  children: (node: HTMLElement) => React.ReactNode;
};

type State = {
  node: HTMLElement | null;
};

class RootComponent extends React.PureComponent<Props, State> {
  state = {
    node: null,
  };

  handleNode = (node: HTMLElement | null) => {
    this.setState({
      node,
    });
  };

  render() {
    return (
      <div
        ref={this.handleNode}
        className="absolute inset-16 overflow-y-scroll bg-gray-600"
      >
        {/*
        // @ts-ignore */}
        {this.state.node ? this.props.children(this.state.node) : null}
      </div>
    );
  }
}

export default RootComponent;
