export function withResolvers<T>(): PromiseWithResolvers<T> {
  if (typeof Promise.withResolvers === 'function') {
    return Promise.withResolvers();
  }

  let resolve!: (value: T | PromiseLike<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    resolve,
    reject,
    promise,
  };
}
