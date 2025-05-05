import PlaintextEngineHostSession from './PlaintextEngineHostSession.js';
import PlaintextEngineClientSession from './PlaintextEngineClientSession.js';
import { Engine, EngineSession, Circuit } from 'mpc-framework-common';

export default class PlaintextEngine implements Engine {
  run(
    circuit: Circuit,
    name: string,
    input: Record<string, unknown>,
    send: (to: string, msg: Uint8Array) => void,
  ): EngineSession {
    const hostName = circuit.mpcSettings[0].name ?? '0';

    if (name === hostName) {
      return new PlaintextEngineHostSession(circuit, name, input, send);
    }

    return new PlaintextEngineClientSession(
      circuit,
      name,
      input,
      send,
      hostName,
    );
  }
}
