import { Engine, EngineSession, Circuit } from 'mpc-framework-common';

export default class Session {
  engineSession: EngineSession;

  constructor(
    public circuit: Circuit,
    public engine: Engine,
    public name: string,
    public input: Record<string, unknown>,
    public send: (to: string, msg: Uint8Array) => void,
  ) {
    this.engineSession = engine.run(circuit, name, input, send);
  }

  handleMessage(from: string, msg: Uint8Array) {
    this.engineSession.handleMessage(from, msg);
  }

  async output(): Promise<Record<string, unknown>> {
    return await this.engineSession.output();
  }
}
