import PlaintextBackendHostSession from "./PlaintextBackendHostSession";
import PlaintextBackendClientSession from "./PlaintextBackendClientSession";
import { Backend, BackendSession, Circuit, MpcSettings } from "mpc-framework-common";

export default class PlaintextBackend implements Backend {
  run(
    circuit: Circuit,
    mpcSettings: MpcSettings,
    name: string,
    input: Record<string, unknown>,
    send: (to: string, msg: Uint8Array) => void,
  ): BackendSession {
    const hostName = mpcSettings[0].name ?? "0";

    if (name === hostName) {
      return new PlaintextBackendHostSession(
        circuit,
        mpcSettings,
        name,
        input,
        send,
      );
    }

    return new PlaintextBackendClientSession(
      circuit,
      mpcSettings,
      name,
      input,
      send,
      hostName,
    );
  }
}
