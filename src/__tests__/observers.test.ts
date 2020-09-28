import { optionsToId } from '../observers';

test('should convert options to id', () => {
  expect(
    optionsToId({
      root: document.createElement('div'),
      rootMargin: '10px 10px',
      threshold: [0, 1],
    }),
  ).toMatchInlineSnapshot(`"root_1,rootMargin_10px 10px,threshold_0,1"`);
  expect(
    optionsToId({
      root: null,
      rootMargin: '10px 10px',
      threshold: 1,
    }),
  ).toMatchInlineSnapshot(`"root_0,rootMargin_10px 10px,threshold_1"`);
  expect(
    optionsToId({
      threshold: 0,
      // @ts-ignore
      trackVisibility: true,
      // @ts-ignore
      delay: 500,
    }),
  ).toMatchInlineSnapshot(`"delay_500,threshold_0,trackVisibility_true"`);
  expect(
    optionsToId({
      threshold: 0,
    }),
  ).toMatchInlineSnapshot(`"threshold_0"`);
  expect(
    optionsToId({
      threshold: [0, 0.5, 1],
    }),
  ).toMatchInlineSnapshot(`"threshold_0,0.5,1"`);
});
