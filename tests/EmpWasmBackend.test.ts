import * as summon from 'summon-ts';
import { EmpWasmBackend } from 'emp-wasm-backend';

import * as mpcf from '../src';
import { LocalComms, makeLocalCommsPair } from './helpers/LocalComms';
import assert from '../src/helpers/assert';
import { expect } from 'chai';

describe('EmpWasmBackend', () => {
  it('3 + 5', async () => {
    const outputs = await demo();
    expect(outputs).to.deep.eq([{ main: 8 }, { main: 8 }]);
  });
});

async function demo() {
  await summon.init();

  const [aliceComms, bobComms] = makeLocalCommsPair();

  const circuit = summon.compileBoolean('/src/main.ts', 4, {
    '/src/main.ts': `
      export default function main(a: number, b: number) {
        return a + b;
      }
    `,
  });

  const mpcSettings = [
    {
      name: 'alice',
      inputs: ['a'],
      outputs: ['main'],
    },
    {
      name: 'bob',
      inputs: ['b'],
      outputs: ['main'],
    },
  ];

  const protocol = new mpcf.Protocol(
    circuit,
    mpcSettings,
    new EmpWasmBackend(),
  );

  const outputs = await Promise.all([
    runParty('alice', protocol, aliceComms),
    runParty('bob', protocol, bobComms),
  ]);

  return outputs;
}

async function runParty(
  party: 'alice' | 'bob',
  protocol: mpcf.Protocol,
  comms: LocalComms,
) {
  const otherParty = party === 'alice' ? 'bob' : 'alice';

  const session = protocol.join(
    party,
    party === 'alice' ? { a: 3 } : { b: 5 },
    (to, msg) => {
      assert(to === otherParty);
      comms.send(msg);
    },
  );

  const buffered = comms.recv();

  if (buffered.length > 0) {
    session.handleMessage(otherParty, buffered);
  }

  comms.recvBuf.on('data', data => session.handleMessage(otherParty, data));

  const output = await session.output();

  return output;
}
