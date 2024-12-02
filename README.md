# mpc-framework

A framework that makes MPC easy in TypeScript.

Choose from multiple existing circuit generators and MPC backends, or create
your own.

## What is MPC?

MPC stands for *Multi-Party Computation*. In regular computation, all inputs,
outputs, and intermediate calculations are necessarily visible on the device
performing the computation. MPC, by contrast, allows multiple devices to
collaborate on a computation while keeping intermediate calculations and others'
inputs private.

Here's some ways that can be useful:
- Provide analysis on patient data to researchers without revealing the patient data
- Play [Rock Paper Scissors Lizard Spock](https://voltrevo.github.io/mpc-lizard-spock/) while keeping your move secret
- Hold an auction while keeping the bids secret (only the winning bidder and price is revealed)
- [Match employers and job-seekers that each have hidden criteria](https://github.com/cursive-team/pz-hiring)
- Arrange optimal asset swaps (eg sports players / trading cards / corporate assets / NFTs) using hidden valuations
- Find out if you qualify for an insurance policy without sharing your health data and without requiring the insurer to reveal the policy requirements
- Quantify how much you have in common with someone and then figure out the commonalities together (or choose not to)
- Create an embarassing songs playlist for a party where each song is liked by >=N people

For a bit more of an introduction to MPC, I recommend Barry Whitehat's talk
[2PC is for Lovers](https://www.youtube.com/watch?v=PzcDqegGoKI). The
lovers' app described in the talk has been implemented using mpc-framework
[here](https://voltrevo.github.io/2pc-is-for-lovers/).

For a more technical introduction, see [Computerphile's video on Garbled Circuits](https://www.youtube.com/watch?v=FMZ-HARN0gI). For a deeper dive: [Pragmatic MPC](https://securecomputation.org/).

## Usage Guide

In addition to `mpc-framework`, you will need:
- a circuit generator to turn your MPC program into a circuit (or byo precompiled or handwritten circuit)
- an mpc-framework backend to do the underlying cryptography

```sh
npm install mpc-framework
npm install summon-ts         # circuit generator
npm install emp-wasm-backend  # backend
```

### Step 1: Create a Circuit

The computation to be done inside MPC must be specified in the form of a
circuit. This is a special simplified program in the form of a fixed tree
specifying how to combine values together. Regular programs allow the CPU to
branch into different code paths, and circuits can't do that. It's possible to
write these circuits by hand (or using third party tools), but you might find it
easier to use [summon](https://github.com/voltrevo/summon/):

```ts
// This isn't exactly TypeScript, but it uses the same syntax and has enough in
// common that you can use the .ts extension and get useful intellisense

export default function main(a: number, b: number) {
  let result;

  // This seems like a branch that I just said is not allowed, but this is just
  // an abstraction, and summon will compile it down to a fixed circuit. Loops
  // are possible too. See the summon docs for more detail.
  if (isLarger(a, b)) {
    result = a;
  } else {
    result = b;
  }

  return result;
}

// We could inline this, but we're just demonstrating that summon supports
// modularity (multi-file works too and many other TS features).
function isLarger(a: number, b: number) {
  return a > b;
}
```

### Step 2: Compile your Circuit

```ts
import * as summon from 'summon-ts';

// ...

await summon.init();

const circuit = summon.compileBoolean(
  // Specify the entry point, similar to the `main` field of package.json
  'circuit/main.ts',

  // This is the bit width of numbers in your summon program. You can use any
  // width you like, but all numbers in the program will be the same. You can
  // achieve smaller bit widths within the program using masking (the unused
  // gates will be optimized away). It's also possible to define classes for
  // matrices/floats/etc.
  16,

  // File tree to compile
  {
    'circuit/main.ts': `
      // Include code from step 1
      // This can be inlined or you can use build tools to just include a
      // directory from your source tree
      // (eg https://github.com/voltrevo/mpc-hello/)
    `,
    // Other files can be specified here
  },
);
```

### Step 3: Set up your Protocol

```ts
import { Protocol } from 'mpc-framework';
import { EmpWasmBackend } from 'emp-wasm-backend';

// ...

// Specify who provides each input, and who receives each output
// (Our chosen backend currently requires that everyone gets all outputs)
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

const protocol = new Protocol(circuit, mpcSettings, new EmpWasmBackend());
```

### Step 4: Run the Protocol

```ts
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

// have another device (or tab) join as bob and provide { b: 5 }

console.log(await session.output()); // { main: 5 }
```

### Bringing it all Together

For clarity, a complete version of the example above is provided as
[mpc-hello](https://voltrevo.github.io/mpc-hello/).

## **Circuit Generators**

| Name     | Similar to | Related Repos |
| -------- | ---------- | ------------- |
| [`summon-ts`](https://github.com/voltrevo/summon-ts/)  | TypeScript | [`summon`](https://github.com/voltrevo/summon/), [`boolify`](https://github.com/voltrevo/boolify/), [`ValueScript`](https://github.com/voltrevo/ValueScript/) |
| [`circom-2-arithc-ts`](https://github.com/voltrevo/circom-2-arithc-ts/) | Circom | [`circom-2-arithc`](https://github.com/namnc/circom-2-arithc/), [`circom`](https://github.com/iden3/circom/) |

## **Backends**

| Name | Description | Related Repos |
| ---- | ----------- | ------------- |
| [`emp-wasm-backend`](https://github.com/voltrevo/emp-wasm-backend/) | Secure 2PC using authenticated garbling | [`emp-wasm`](https://github.com/voltrevo/emp-wasm), [`emp-ag2pc`](https://github.com/emp-toolkit/emp-ag2pc/) |
| [`mpz-ts`](https://github.com/voltrevo/mpz-ts) | Semi-honest 2PC | [`mpz`](https://github.com/privacy-scaling-explorations/mpz) |

## Example Projects

- [MPC Hello](https://voltrevo.github.io/mpc-hello/)
- [2PC is for Lovers](https://voltrevo.github.io/2pc-is-for-lovers/)
- [MPC Lizard Spock](https://voltrevo.github.io/mpc-lizard-spock/)
