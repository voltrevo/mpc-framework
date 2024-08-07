# mpc-framework

MPC framework supporting a variety of circuit generators and backends.

## Status

WIP

## Usage

```sh
npm install mpc-framework summon-ts
```

```ts
import * as mpcf from 'mpc-framework';
import * as summon from 'summon-ts';

async function main() {
  await summon.init();

  const circuit = summon.compile('/src/main.ts', {
    // In a real project you should be able to include these as regular files,
    // but how those files find their way into this format depends on your build
    // tool.

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

  const protocol = new mpcf.Protocol(circuit, mpcSettings, mpz);

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

  console.log(await session.output()); // { main: 8 }
}

main().catch(console.error);
```

## Example Project

TODO
