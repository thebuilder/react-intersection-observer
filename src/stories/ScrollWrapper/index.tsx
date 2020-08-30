/** @jsx jsx */
import { jsx } from '@emotion/react';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

/**
 * ScrollWrapper directs the user to scroll the page to reveal it's children.
 * Use this on Modules that have scroll and/or observer triggers.
 */
function ScrollWrapper({ children, ...props }: Props) {
  return (
    <div {...props}>
      <section
        css={{
          height: '101vh',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2d1176',
          color: '#fff',
        }}
      >
        <h1>⬇ Scroll Down ⬇</h1>
      </section>
      {children}
      <section
        css={{
          height: '101vh',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2d1176',
          color: '#fff',
        }}
      >
        <h1>⬆︎ Scroll up ⬆︎</h1>
      </section>
    </div>
  );
}

export default ScrollWrapper;
