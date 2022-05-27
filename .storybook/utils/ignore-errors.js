/**
 * Storybook logs out some errors that are just noise for us, since we can't really do anything about it.
 * Instead of them cluttering the console, we filter them out by overwriting the `console.error` object.
 **/
export const ignoreErrorMessages = () => {
  const logError = console.error.bind(console);
  const ignoreErrors = [
    'Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead.',
    'The pseudo class',
  ];
  console.error = (...args) => {
    if (
      ignoreErrors.some((ignore) => {
        return args[0].startsWith(ignore);
      })
    ) {
      return;
    }
    logError(...args);
  };
};
