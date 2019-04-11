import { CSSProperties, default as React } from 'react'

type Props = { inView: boolean }

const statusElement: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: 32,
  height: 32,
  background: 'rgba(255, 255, 255, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '0 0 0 10px',
}

const emojiIcon: CSSProperties = {
  width: '1em',
  height: '1em',
  lineHeight: 1,
}

function Status({ inView }: Props) {
  return (
    <div style={statusElement}>
      {inView ? (
        <span role="img" aria-label="In view" style={emojiIcon}>
          ✅
        </span>
      ) : (
        <span role="img" aria-label="Outside the viewport" style={emojiIcon}>
          ❌
        </span>
      )}
    </div>
  )
}

export default Status
