# mpc-framework

MPC framework supporting a variety of circuit generators and backends.

## Status

WIP

## Usage

```sh
npm install mpc-framework circom-2-arithc mpz-ts
```

```ts
import * as mpcf from 'mpc-framework';
import * as c2a from 'circom-2-arithc';
import mpz from 'mpz-ts';

const circuitSrc = {
  // In a real project you should be able to include these as regular files, but
  // how those files find their way into this format depends on your build tool.

  'main.circom': `
    pragma circom 2.0.0;

    template Adder() {
        signal input a, b;
        signal output c;

        c <== a + b;
    }

    component main = Adder();
  `,
};

const circuit = c2a.Circuit.compile(circuitSrc);

console.log(
  circuit.eval({
    a: 3,
    b: 5,
  }),
); // { c: 8 }

const mpcSettings = [
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

console.log(await session.output()); // { c: 8 }
```

## Example Project

TODO
