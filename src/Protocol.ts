import { Backend, Circuit, MpcSettings } from "mpc-framework-common";
import Session from "./Session";

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
