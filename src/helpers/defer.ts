export default function defer<T>() {
  let resolve: ((value: T) => void) | undefined;
  let reject: ((reason?: any) => void) | undefined;

  const promise = new Promise<T>((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });

  return { promise, resolve: resolve!, reject: reject! };
}
