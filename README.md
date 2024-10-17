# mpc-framework

MPC framework supporting a variety of circuit generators and backends.

In particular, [`emp-wasm-backend`](https://github.com/voltrevo/emp-wasm-backend) powers secure 2PC based on [*Authenticated Garbling and Efficient Maliciously Secure Two-Party Computation*](https://eprint.iacr.org/2017/030.pdf).

## Usage

```sh
npm install mpc-framework emp-wasm-backend summon-ts
```

```ts
import * as mpcf from 'mpc-framework';
import { EmpWasmBackend } from 'emp-wasm-backend';
import * as summon from 'summon-ts';

async function main() {
  await summon.init();

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

  function send(to: string, msg: Uint8Array) {
    // implement sending a message to the specified party
  }

  const session = protocol.join('alice', { a: 3 }, send);

  // This is just a hypothetical API for getting external messages
  onMessageReceived((from: string, msg: Uint8Array) => {
    // The important part is that you provide the messages to the session like
    // this
    session.handleMessage(from, msg);
  });

  // assume someone else joins as bob and provides { b: 5 }

  console.log(await session.output()); // { main: 5 }
}

main().catch(console.error);
```

(For a complete version, see [`EmpWasmBackend.test.ts`](./tests/EmpWasmBackend.test.ts).)

## Example Projects

- [MPC Hello](https://voltrevo.github.io/mpc-hello/)
- [2PC is for Lovers](https://voltrevo.github.io/2pc-is-for-lovers/)
