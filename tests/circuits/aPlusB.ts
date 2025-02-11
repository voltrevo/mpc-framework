import * as summon from 'summon-ts';

import once from '../../src/helpers/once';

const aPlusB = once(async () => {
  await summon.init();

  return summon.compile('/src/main.ts', {
    '/src/main.ts': `
      export default function c(a: number, b: number) {
        return a + b;
      }
    `,
  });
});

export default aPlusB;
