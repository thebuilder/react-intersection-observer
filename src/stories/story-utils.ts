import { IntersectionOptions } from '../index';

export function getRoot(options: IntersectionOptions) {
  if (options.rootMargin && !options.root && window.self !== window.top) {
    return (document as unknown) as Element;
  }
  return options.root;
}

export function useValidateOptions(options: IntersectionOptions) {
  const finalOptions = { root: getRoot(options), ...options, as: undefined };

  let error = undefined;
  try {
    new IntersectionObserver(() => {}, finalOptions);
  } catch (e) {
    error = e.message.replace(
      "Failed to construct 'IntersectionObserver': ",
      '',
    );
  }

  return { options: finalOptions, error };
}
