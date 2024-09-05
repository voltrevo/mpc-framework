import { pack, unpack } from "msgpackr";
import z from 'zod';

import delay from "../helpers/delay";
import defer from "../helpers/defer";
import evaluate, { u32Arithmetic } from "../helpers/evaluate";
import errorToString from "../helpers/errorToString";
import { BackendSession, Circuit, MpcSettings } from "mpc-framework-common";

export default class PlaintextBackendHostSession implements BackendSession {
  outputPromise: Promise<Record<string, unknown>>;
  combinedInputs = defer<Record<string, unknown>>();
  partialCombinedInputs: Record<string, unknown>;
  peerInputsReceived = new Set<string>();

  constructor(
    public circuit: Circuit,
    public mpcSettings: MpcSettings,
    public name: string,
    public input: Record<string, unknown>,
    public send: (to: string, msg: Uint8Array) => void,
  ) {
    this.partialCombinedInputs = structuredClone(input);
    this.outputPromise = this.run();
  }

  async run() {
    let shouldPing = true;

    (async () => {
      while (shouldPing) {
        for (let i = 1; i < this.mpcSettings.length; i++) {
          const to = this.mpcSettings[i].name ?? i.toString();
          this.send(to, pack('ping'));
        }

        await delay(250);
      }
    })();

    let combinedInputs;

    try {
      combinedInputs = await this.combinedInputs.promise;
    } finally {
      shouldPing = false;
    }

    const fullResult = evaluate(this.circuit, combinedInputs, u32Arithmetic);
    let selfResult: Record<string, unknown> = {};

    for (let i = 0; i < this.mpcSettings.length; i++) {
      const {name = i.toString(), outputs} = this.mpcSettings[i];
      const result: Record<string, unknown> = {};

      for (const outputName of outputs) {
        result[outputName] = fullResult[outputName];
      }

      if (i === 0) {
        selfResult = result;
      } else {
        this.send(name, pack(result));
      }
    }

    return selfResult;
  }

  handleMessage(from: string, msg: Uint8Array): void {
    try {
      if (this.peerInputsReceived.has(from)) {
        throw new Error('Already received');
      }

      const peerInfo = this.mpcSettings.find(
        (s, i) => from === (s.name ?? i.toString()),
      );

      if (peerInfo === undefined) {
        throw new Error(`unrecognized peer: "${from}"`);
      }

      const peerInputs = z.record(z.unknown()).parse(unpack(msg));

      for (const inputName of peerInfo.inputs) {
        if (!(inputName in peerInputs)) {
          throw new Error(`Missing input "${inputName}"`);
        }

        this.partialCombinedInputs[inputName] = peerInputs[inputName];
      }

      this.peerInputsReceived.add(from);

      if (this.peerInputsReceived.size === this.mpcSettings.length - 1) {
        this.combinedInputs.resolve(this.partialCombinedInputs);
      }
    } catch (e) {
      this.combinedInputs.reject(e);

      this.send(
        from,
        pack({ error: `Couldn't handle message: ${errorToString(e)}` }),
      );
    }
  }

  output(): Promise<Record<string, unknown>> {
    return this.outputPromise;
  }
}
