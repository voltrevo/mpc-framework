import { Backend, BackendSession, Circuit, MpcSettings } from "mpc-framework-common";

export default class Session {
  backendSession: BackendSession;

  constructor(
    public circuit: Circuit,
    public mpcSettings: MpcSettings,
    public backend: Backend,
    public name: string,
    public input: Record<string, unknown>,
    public send: (to: string, msg: Uint8Array) => void,
  ) {
    this.backendSession = backend.run(circuit, mpcSettings, name, input, send);
  }

  handleMessage(from: string, msg: Uint8Array) {
    this.backendSession.handleMessage(from, msg);
  }

  async output(): Promise<Record<string, unknown>> {
    return await this.backendSession.output();
  }
}
