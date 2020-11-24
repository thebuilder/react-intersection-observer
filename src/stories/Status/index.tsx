import React from 'react';

type Props = { inView: boolean };

function Status({ inView }: Props) {
  return (
    <div className="fixed z-10 p-2 top-0 right-0 flex justify-center items-center rounded-bl-lg bg-opacity-60 bg-white">
      {inView ? (
        <span role="img" aria-label="In view" className="w-4 h-4 leading-none">
          ✅
        </span>
      ) : (
        <span
          role="img"
          aria-label="Outside the viewport"
          className="w-4 h-4 leading-none"
        >
          ❌
        </span>
      )}
    </div>
  );
}

export default Status;
