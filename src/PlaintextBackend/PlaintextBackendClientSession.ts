import Circuit from "../Circuit";
import { BackendSession, MpcSettings } from "../Protocol";

export default class PlaintextBackendClientSession implements BackendSession {
  outputPromise: Promise<Record<string, unknown>>;
  inputsReceived = false;

  constructor(
    public circuit: Circuit,
    public mpcSettings: MpcSettings,
    public name: string,
    public input: Record<string, unknown>,
    public send: (to: string, msg: Uint8Array) => void,
    public hostName: string,
  ) {
    this.outputPromise = this.run();
  }

  async run() {
    throw new Error('TODO');
    return {};
  }

  handleMessage(from: string, msg: Uint8Array): void {
    if (from !== this.hostName) {
      return;
    }

    throw new Error('TODO');
  }

  output(): Promise<Record<string, unknown>> {
    throw new Error('TODO');
  }
}
