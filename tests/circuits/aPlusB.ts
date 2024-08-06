import { Circuit } from "../../src";
import blockTrim from "../helpers/blockTrim";

const aPlusB: Circuit = {
  bristol: blockTrim(`
    1 3
    2 1 1
    1 1

    2 1 0 1 2 AAdd
  `),
  info: {
    input_name_to_wire_index: {
      a: 0,
      b: 1,
    },
    constants: {},
    output_name_to_wire_index: {
      c: 2,
    },
  },
};

export default aPlusB;
