import type { Schema, Data } from "./types";
import { encode } from "./encoder";
import { decode } from "./decoder";

export default class Encoder<S extends Schema> {
  constructor(private schema: S) {}

  public encode(data: Data<S>): Buffer {
    return encode(data, this.schema);
  }

  public decode(data: Buffer): Data<S> {
    return decode(data, this.schema)[0];
  }
}

export { type Schema, type Data, encode, decode };
