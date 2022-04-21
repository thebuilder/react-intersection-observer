import type { IntersectionOptions } from '../index';

export function getRoot(options: IntersectionOptions) {
  if (options.rootMargin && !options.root && window.self !== window.top) {
    return document as unknown as Element;
  }
  return options.root;
}

export function useValidateOptions(options: IntersectionOptions) {
  const finalOptions = { root: getRoot(options), ...options };
  // @ts-ignore
  delete finalOptions.as;
  if (!finalOptions.root) delete finalOptions.root;

  let error = undefined;
  try {
    new IntersectionObserver(() => {}, finalOptions);
  } catch (e) {
    if (e instanceof Error) {
      error = e.message.replace(
        "Failed to construct 'IntersectionObserver': ",
        '',
      );
    }
  }

  return { options: finalOptions, error };
}
