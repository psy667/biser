import { isNumberType } from "./encoder";
import type {
  NumberTypes,
  Schema,
  ArraySchema,
  StructSchema,
  MapSchema,
  Data,
  Types,
} from "./types";

export function decodeBool(data: Buffer): [boolean, number] {
  return [data[0] === 1, 1];
}

function decodeNumberType(type: NumberTypes, data: Buffer): [number, number] {
  switch (type) {
    case "uint8": {
      return [data[0], 1];
    }
    case "uint16": {
      return [(data[0] << 8) | data[1], 2];
    }
    case "uint32": {
      return [(data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3], 4];
    }
    case "int8": {
      const negativeBit = data[0] & 0x80;
      const unsigned = data[0] & 0x7f;

      return [negativeBit ? -unsigned : unsigned, 1];
    }
    case "int16": {
      const negativeBit = data[0] & 0x80;
      const unsigned = ((data[0] & 0x7f) << 8) | data[1];

      return [negativeBit ? -unsigned : unsigned, 2];
    }
    case "int32": {
      const negativeBit = data[0] & 0x80;
      const unsigned =
        ((data[0] & 0x7f) << 24) | (data[1] << 16) | (data[2] << 8) | data[3];

      return [negativeBit ? -unsigned : unsigned, 4];
    }
    default: {
      throw new Error(`unknown type: ${type}`);
    }
  }
}

export function decodeString(data: Buffer): [string, number] {
  let length = data[0];
  const res = data.slice(1, length + 1).toString("utf8");

  return [res, length + 1];
}

export function decodeArray<S extends ArraySchema>(
  data: Buffer,
  schema: S,
): [any[], number] {
  let length = data[0];
  const res: any[] = [];
  if (data[0] === 0) {
    return [res, 1];
  }
  let offset = 1;

  for (let i = 0; i < length; i++) {
    let [item, newOffset] = decode(data.slice(offset), schema.items);
    offset += newOffset;
    res.push(item);
  }

  return [res, offset];
}

export function decodeStruct<S extends StructSchema>(
  data: Buffer,
  schema: S,
): [Record<string, any>, number] {
  const res: Record<string, any> = {};
  if (data[0] === 0) {
    return [res, 1];
  }
  let offset = 1;

  for (const [key, value] of schema.properties.map(
    ({ key, schema }) => [key, schema] as const,
  )) {
    let [item, newOffset] = decode(data.slice(offset), value);
    offset += newOffset;

    res[key] = item;
  }

  return [res, offset];
}

export function decodeMap<S extends MapSchema>(
  data: Buffer,
  schema: S,
): [Record<string, any>, number] {
  let length = data[0];
  const res: Record<string, any> = {};
  if (data[0] === 0) {
    return [res, 1];
  }
  let offset = 1;

  for (let i = 0; i < length; i++) {
    let [key, newOffset1] = decodeString(data.slice(offset));
    offset += newOffset1;

    let [value, newOffset] = decode(data.slice(offset), schema.value);
    offset += newOffset;

    res[key] = value;
  }

  return [res, offset];
}

export function decode<S extends Schema>(data: Buffer, schema: S): Data<S> {
  let result;

  let offset = 0;

  switch (true) {
    case schema.type === "bool": {
      let [res, newOffset] = decodeBool(data.slice(offset));
      offset += newOffset;
      result = res;
      break;
    }
    case isNumberType(schema.type): {
      let [res, newOffset] = decodeNumberType(schema.type, data.slice(offset));
      offset += newOffset;
      result = res;
      break;
    }
    case schema.type === "string": {
      let [res, newOffset] = decodeString(data.slice(offset));
      offset += newOffset;
      result = res;
      break;
    }
    case schema.type === "array": {
      let [res, newOffset] = decodeArray(data.slice(offset), schema);
      offset += newOffset;
      result = res;
      break;
    }
    case schema.type === "struct": {
      let [res, newOffset] = decodeStruct(data.slice(offset), schema);
      offset += newOffset;
      result = res;
      break;
    }
    case schema.type === "map": {
      let [res, newOffset] = decodeMap(data.slice(offset), schema);
      offset += newOffset;
      result = res;
      break;
    }
    default: {
      throw new Error(`unknown type: ${schema.type}`);
    }
  }

  return [result, offset];
}
