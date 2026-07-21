/**
 * Runs an example with deterministic terminal dimensions.
 * @param {() => Value} render - The render.
 * @returns {Value} - Computed result.
 */
export const withExampleTerminal = <Value>(render: () => Value): Value => {
  const descriptor = Object.getOwnPropertyDescriptor(process.stdout, 'columns');
  Object.defineProperty(process.stdout, 'columns', { configurable: true, value: 80 });
  try {
    return render();
  } finally {
    if (descriptor) Object.defineProperty(process.stdout, 'columns', descriptor);
    else delete (process.stdout as { columns?: number }).columns;
  }
};
