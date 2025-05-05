import { Engine, Circuit } from 'mpc-framework-common';
import Session from './Session.js';

export default class Protocol {
  constructor(
    public circuit: Circuit,
    public engine: Engine,
  ) {}

  join(
    name: string,
    input: Record<string, unknown>,
    send: (to: string, msg: Uint8Array) => void,
  ): Session {
    return new Session(this.circuit, this.engine, name, input, send);
  }
}
