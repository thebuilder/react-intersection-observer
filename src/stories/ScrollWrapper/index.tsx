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
        className="flex items-center justify-center text-white text-center bg-indigo-800"
        style={{ height: '101vh' }}
      >
        <p className="font-sans text-4xl">⬇ Scroll Down ⬇</p>
      </section>
      {children}
      <section
        className="flex items-center justify-center text-white text-center bg-indigo-800"
        style={{ height: '101vh' }}
      >
        <p className="font-sans text-4xl">⬆︎ Scroll up ⬆︎</p>
      </section>
    </div>
  );
}

export default ScrollWrapper;
