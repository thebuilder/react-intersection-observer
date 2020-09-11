/** @jsx jsx */
import { jsx } from '@emotion/react';

type Props = { inView: boolean };

const emojiIcon = {
  width: '1em',
  height: '1em',
  lineHeight: 1,
};

function Status({ inView }: Props) {
  return (
    <div
      css={{
        position: 'fixed',
        zIndex: 1,
        top: 0,
        right: 0,
        width: 32,
        height: 32,
        background: 'rgba(255, 255, 255, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '0 0 0 10px',
      }}
    >
      {inView ? (
        <span role="img" aria-label="In view" css={emojiIcon}>
          ✅
        </span>
      ) : (
        <span role="img" aria-label="Outside the viewport" css={emojiIcon}>
          ❌
        </span>
      )}
    </div>
  );
}

export default Status;
