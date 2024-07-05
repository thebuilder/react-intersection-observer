# Recipes

The `IntersectionObserver` itself is just a simple but powerful tool. Here's a
few ideas for how you can use it.

## Lazy image load

It's actually easy to create your own lazy image loader, and this allows you to
build it according to your needs.

**Couple of tips**

- Don't set the `src` (or `srcset`) on the image until it's visible. Images will
  always load their `src`, even if you set `display: none;`.
- Make sure to set the
  [root margin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)
  for top and bottom, so the Intersection Observer gets triggered before the
  image enters the viewport. This gives the image a chance to be loaded before
  the user even sees it. Try to start with something like `200px 0px`, but
  experiment with it until you find the right value.
- Set `triggerOnce`, so you don't keep monitoring for changes.
- You should always create a wrapping element, that sets the correct aspect
  ratio for the image. You can set the padding bottom to be
  `${height / width * 100}%` to maintain aspect ratio.
- Either hide the `<img />` with CSS, or skip rendering it until it's inside the
  viewport.

> [!TIP]
> All modern browsers support the native `loading` attribute on `<img />` tags, so unless you need
> fine-grained control, you can skip the `IntersectionObserver` and use `loading="lazy"` instead.
>
> https://web.dev/articles/browser-level-image-lazy-loading

```jsx
import React from "react";
import { useInView } from "react-intersection-observer";

const LazyImage = ({ width, height, src, ...rest }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        paddingBottom: `${(height / width) * 100}%`,
        background: "#2a4b7a",
      }}
    >
      {inView ? (
        <img
          {...rest}
          src={src}
          width={width}
          height={height}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  );
};

export default LazyImage;
```

**See [Codesandbox](https://codesandbox.io/embed/lazy-image-load-mjsgc)**

## Trigger animations

Triggering animations once they enter the viewport is also a perfect use case
for an IntersectionObserver.

- Set `triggerOnce`, to only trigger the animation the first time.
- Set `threshold`, to control how much of the element should be visible before
  firing the event.
- Instead of `threshold`, you can use `rootMargin` to have a fixed amount be
  visible before triggering. Use a negative margin value, like `-100px 0px`, to
  have it go inwards. You can also use a percentage value, instead of pixels.

```jsx
import React from "react";
import { useInView } from "react-intersection-observer";

const LazyAnimation = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "-100px 0px",
  });

  return (
    <div
      ref={ref}
      className={`transition-opacity ${inView ? "opacity-1" : "opacity-0"}`}
    >
      <span aria-label="Wave">👋</span>
    </div>
  );
};

export default LazyAnimation;
```

## Track impressions

You can use `IntersectionObserver` to track when a user views your element, and
fire an event on your tracking service.

- Set `triggerOnce`, to only trigger an event the first time the element enters
  the viewport.
- Set `threshold`, to control how much of the element should visible before
  firing the event.
- Instead of `threshold`, you can use `rootMargin` to have a fixed amount be
  visible before triggering. Use a negative margin value, like `-100px 0px`, to
  have it go inwards. You can also use a percentage value, instead of pixels.
- You can use the `onChange` callback to trigger the tracking.

```jsx
import * as React from "react";
import { useInView } from "react-intersection-observer";

const TrackImpression = () => {
  const { ref } = useInView({
    triggerOnce: true,
    rootMargin: "-100px 0",
    onChange: (inView) => {
      if (inView) {
        // Fire a tracking event to your tracking service of choice.
        dataLayer.push("Section shown"); // Here's a GTM dataLayer push
      }
    },
  });

  return (
    <div ref={ref}>
      Exemplars sunt zeluss de bassus fuga. Credere velox ducunt ad audax amor.
    </div>
  );
};

export default TrackImpression;
```
