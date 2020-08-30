import { optionsToId } from '../observers'

test('should convert options to id', () => {
  expect(
    optionsToId({
      root: document.createElement('div'),
      rootMargin: '10px 10px',
      object: { key: 'string', value: 1 },
      threshold: [0, 1],
    }),
  ).toMatchInlineSnapshot(
    `"object_{\\"key\\":\\"string\\",\\"value\\":1}|root_1|rootMargin_10px 10px|threshold_[0,1]"`,
  )
  expect(
    optionsToId({
      root: null,
      rootMargin: '10px 10px',
      threshold: 1,
    }),
  ).toMatchInlineSnapshot(`"root_|rootMargin_10px 10px|threshold_1"`)
})
