import { expect } from "chai";
import Protocol from "../src/Protocol";
import aPlusB from "./circuits/aPlusB";
import { PlaintextBackend } from "../src/PlaintextBackend/PlaintextBackend";
import { EventEmitter } from "ee-typed";
import assert from "../src/helpers/assert";

describe('plaintext', () => {
  it('3 + 5', async () => {
    const protocol = new Protocol(
      aPlusB,
      [
        {
          name: 'alice',
          inputs: ['a'],
          outputs: ['c'],
        },
        {
          name: 'bob',
          inputs: ['b'],
          outputs: ['c'],
        },
      ],
      new PlaintextBackend(),
    );

    const messageEvents = new EventEmitter<{
      aliceToBob(msg: Uint8Array): void;
      bobToAlice(msg: Uint8Array): void;
    }>();

    const aliceOutputPromise = (async () => {
      const session = protocol.join(
        'alice',
        { a: 3 },
        (to, msg) => {
          assert(to === 'bob');
          messageEvents.emit('aliceToBob', msg);
        },
      );

      messageEvents.on(
        'bobToAlice',
        msg => session.handleMessage('bob', msg),
      );

      return await session.output();
    })();

    const bobOutputPromise = (async () => {
      const session = protocol.join(
        'bob',
        { b: 5 },
        (to, msg) => {
          assert(to === 'alice');
          messageEvents.emit('bobToAlice', msg);
        },
      );

      messageEvents.on(
        'aliceToBob',
        msg => session.handleMessage('alice', msg),
      );

      return await session.output();
    })();

    const [aliceOutput, bobOutput] = await Promise.all([
      aliceOutputPromise,
      bobOutputPromise,
    ]);

    expect(aliceOutput).to.deep.eq({ c: 8n });
    expect(bobOutput).to.deep.eq({ c: 8n });
  });
});
