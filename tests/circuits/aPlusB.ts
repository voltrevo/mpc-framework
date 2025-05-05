import * as summon from 'summon-ts';

import once from '../../src/helpers/once';

const aPlusB = once(async () => {
  await summon.init();

  const { circuit } = summon.compile({
    path: '/src/main.ts',
    files: {
      '/src/main.ts': `
        export default (io: Summon.IO) => {
          const a = io.input('alice', 'a', summon.number());
          const b = io.input('bob', 'b', summon.number());

          io.outputPublic('c', a + b);
        }
      `,
    },
  });

  return circuit;
});

export default aPlusB;
