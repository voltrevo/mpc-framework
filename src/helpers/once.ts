export default function once<T>(f: () => T): () => T {
  let result: (
    | undefined
    | { error: unknown }
    | { value: T }
  ) = undefined;

  return () => {
    if (!result) {
      try {
        result = { value: f() };
      } catch (error) {
        result = { error };
      }

      (f as unknown) = undefined;
    }

    if ('error' in result) {
      throw result.error;
    }

    return result.value;
  };
}