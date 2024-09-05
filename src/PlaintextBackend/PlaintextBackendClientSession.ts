import { pack, unpack } from "msgpackr";
import defer from "../helpers/defer";
import { z } from "zod";
import { BackendSession, Circuit, MpcSettings } from "mpc-framework-common";

export default class PlaintextBackendClientSession implements BackendSession {
  outputReceived = defer<Record<string, unknown>>();
  inputsSent = false;

  constructor(
    public circuit: Circuit,
    public mpcSettings: MpcSettings,
    public name: string,
    public input: Record<string, unknown>,
    public send: (to: string, msg: Uint8Array) => void,
    public hostName: string,
  ) {}

  handleMessage(from: string, msg: Uint8Array): void {
    if (from !== this.hostName) {
      return;
    }

    const message = unpack(msg);

    if (message === 'ping') {
      if (!this.inputsSent) {
        this.send(this.hostName, pack(this.input));
        this.inputsSent = true;
      }

      return;
    }

    const parseResult = z.record(z.unknown()).safeParse(message);

    if (parseResult.success === false) {
      this.outputReceived.reject(parseResult.error);
      return;
    }

    this.outputReceived.resolve(parseResult.data);
  }

  output(): Promise<Record<string, unknown>> {
    return this.outputReceived.promise;
  }
}
