import Circuit from "./Circuit";
import Session from "./Session";

export type MpcParticipantSettings = {
  name?: string,
  inputs: string[],
  outputs: string[],
};

export type MpcSettings = MpcParticipantSettings[];

export type Backend = {
  run(
    circuit: Circuit,
    mpcSettings: MpcSettings,
    name: string,
    input: Record<string, unknown>,
    send: (to: string, msg: Uint8Array) => void,
  ): BackendSession;
};

export type BackendSession = {
  handleMessage(from: string, msg: Uint8Array): void;
  output(): Promise<Record<string, unknown>>;
};

export default class Protocol {
  constructor(
    public circuit: Circuit,
    public mpcSettings: MpcSettings,
    public backend: Backend,
  ) {}

  join(
    name: string,
    input: Record<string, unknown>,
    send: (to: string, msg: Uint8Array) => void,
  ): Session {
    return new Session(
      this.circuit,
      this.mpcSettings,
      this.backend,
      name,
      input,
      send,
    );
  }
}
