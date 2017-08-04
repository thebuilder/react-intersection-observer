const INSTANCE_MAP = new Map()
const OBSERVER_MAP = new Map()

/**
 * Monitor element, and trigger callback when element becomes visible
 * @param element {HTMLElement}
 * @param callback {Function} Called with inView
 * @param options {Object} InterSection observer options
 * @param options.threshold {Number} Number between 0 and 1, indicating how much of the element should be visible before triggering
 * @param options.root {HTMLElement} It should have a unique id or data-intersection-id in order for the Observer to reused.
 * @param options.rootMargin {String} The CSS margin to apply to the root element.
 * @param rootId {String} Unique identifier for the root element, to enable reusing the IntersectionObserver
 */
export function observe(
  element,
  callback,
  options = {
    threshold: 0,
  },
  rootId = null,
) {
  const { threshold, root, rootMargin } = options
  if (!element || !callback) return
  let observerId = rootMargin ? `${threshold}_${rootMargin}` : `${threshold}`

  if (root) {
    observerId = rootId ? `${rootId}_${observerId}` : null
  }

  let observerInstance = observerId ? OBSERVER_MAP.get(observerId) : null
  if (!observerInstance) {
    observerInstance = new IntersectionObserver(onChange, options)
    if (observerId) OBSERVER_MAP.set(observerId, observerInstance)
  }

  INSTANCE_MAP.set(element, {
    callback,
    visible: false,
    options,
    observerId,
    observer: !observerId ? observerInstance : undefined,
  })

  observerInstance.observe(element)
}

/**
 * Stop observing an element. If an element is removed from the DOM or otherwise destroyed,
 * make sure to call this method.
 * @param element {HTMLElement}
 */
export function unobserve(element) {
  if (!element) return

  if (INSTANCE_MAP.has(element)) {
    const { observerId, observer } = INSTANCE_MAP.get(element)
    const observerInstance = observerId
      ? OBSERVER_MAP.get(observerId)
      : observer

    if (observerInstance) {
      observerInstance.unobserve(element)
    }

    // Check if we are stilling observing any elements with the same threshold.
    let itemsLeft = false
    if (observerId) {
      INSTANCE_MAP.forEach((item, key) => {
        if (item.observerId === observerId && key !== element) {
          itemsLeft = true
        }
      })
    }

    if (observerInstance && !itemsLeft) {
      // No more elements to observe for threshold, disconnect observer
      observerInstance.disconnect()
      OBSERVER_MAP.delete(observerId)
    }

    // Remove reference to element
    INSTANCE_MAP.delete(element)
  }
}

/**
 * Destroy all IntersectionObservers currently connected
 **/
export function destroy() {
  OBSERVER_MAP.forEach(observer => {
    observer.disconnect()
  })

  OBSERVER_MAP.clear()
  INSTANCE_MAP.clear()
}

function onChange(changes) {
  changes.forEach(intersection => {
    if (INSTANCE_MAP.has(intersection.target)) {
      const { isIntersecting, intersectionRatio, target } = intersection
      const instance = INSTANCE_MAP.get(target)
      const options = instance.options

      let inView

      if (Array.isArray(options.threshold)) {
        // If threshold is an array, check if any of them intersects. This just triggers the onChange event multiple times.
        inView = options.threshold.some(threshold => {
          return instance.visible
            ? intersectionRatio > threshold
            : intersectionRatio >= threshold
        })
      } else {
        // Trigger on 0 ratio only when not visible. This is fallback for browsers without isIntersecting support
        inView = instance.visible
          ? intersectionRatio > options.threshold
          : intersectionRatio >= options.threshold
      }

      if (isIntersecting !== undefined) {
        // If isIntersecting is defined, ensure that the element is actually intersecting.
        // Otherwise it reports a threshold of 0
        inView = inView && isIntersecting
      }

      // Update the visible value on the instance
      instance.visible = inView

      if (instance.callback) {
        instance.callback(inView)
      }
    }
  })
}

export default {
  observe,
  unobserve,
  destroy,
}
