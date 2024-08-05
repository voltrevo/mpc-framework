import { pack } from "msgpackr";

import Circuit from "../Circuit";
import delay from "../helpers/delay";
import { BackendSession, MpcSettings } from "../Protocol";
import defer from "../helpers/defer";
import evaluate, { u32Arithmetic } from "../helpers/evaluate";

export default class PlaintextBackendHostSession implements BackendSession {
  outputPromise: Promise<Record<string, unknown>>;
  combinedInputs = defer<Record<string, unknown>>();
  partialCombinedInputs: Record<string, unknown>;

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

    return evaluate(this.circuit, combinedInputs, u32Arithmetic);
  }

  handleMessage(from: string, msg: Uint8Array): void {
    throw new Error('TODO');
  }

  output(): Promise<Record<string, unknown>> {
    throw new Error('TODO');
  }
}
