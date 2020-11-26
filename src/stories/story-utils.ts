import { IntersectionOptions } from '../index';

export function getRoot(options: IntersectionOptions) {
  if (options.rootMargin && !options.root && window.self !== window.top) {
    return (document as unknown) as Element;
  }
  return options.root;
}
