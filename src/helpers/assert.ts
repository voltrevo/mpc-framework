export default function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error('Assertion failed');
  }
}