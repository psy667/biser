import type {
  NumberTypes,
  Schema,
  ArraySchema,
  StructSchema,
  MapSchema,
  Data,
  Types,
} from "./types";
import { append, abs } from "./utils";

export const ranges = {
  uint8: [0, 255],
  uint16: [0, 65535],
  uint32: [0, 4294967295],
  int8: [-128, 127],
  int16: [-32768, 32767],
  int32: [-2147483648, 2147483647],
};

export const numberTypes = new Set([
  "int8",
  "int16",
  "int32",
  "uint8",
  "uint16",
  "uint32",
]);

export function isNumberType(type: Types): type is NumberTypes {
  return numberTypes.has(type);
}

export function checkRange(value: number, type: NumberTypes) {
  const [min, max] = ranges[type];
  if (value < min || value > max) {
    throw new Error(`value ${value} is out of range for type ${type}`);
  }
}

function encodeNumberType(type: NumberTypes, data: number): Buffer {
  const buf = [];
  checkRange(data, type);
  switch (type) {
    case "uint8": {
      buf.push(data & 0xff);
      break;
    }
    case "uint16": {
      const b1 = (data & 0xff00) >> 8;
      const b2 = data & 0x00ff;

      buf.push(b1, b2);
      break;
    }
    case "uint32": {
      const b1 = (data & 0xff000000) >> 24;
      const b2 = (data & 0x00ff0000) >> 16;
      const b3 = (data & 0x0000ff00) >> 8;
      const b4 = data & 0x000000ff;

      buf.push(b1, b2, b3, b4);
      break;
    }
    case "int8": {
      const negativeBit = data < 0 ? 0x80 : 0;
      const unsigned = abs(data) & 0x7f;

      buf.push(negativeBit | unsigned);
      break;
    }
    case "int16": {
      const negativeBit = data < 0 ? 0x80 : 0;
      const unsigned = abs(data) & 0x7fff;
      const b1 = ((unsigned & 0x7f00) >> 8) | negativeBit;
      const b2 = unsigned & 0x00ff;

      buf.push(b1, b2);
      break;
    }
    case "int32": {
      const negativeBit = data < 0 ? 0x80 : 0;
      const unsigned = abs(data) & 0x7fffffff;
      const b1 = ((unsigned & 0x7f000000) >> 24) | negativeBit;
      const b2 = (unsigned & 0x00ff0000) >> 16;
      const b3 = (unsigned & 0x0000ff00) >> 8;
      const b4 = unsigned & 0x000000ff;

      buf.push(b1, b2, b3, b4);
      break;
    }

    default:
      throw new Error(`unknown type: ${type}`);
  }

  return Buffer.from(buf);
}

function encodeString(data: string): Buffer {
  if (!data) {
    return Buffer.from([0]);
  }
  const encoded = Buffer.from(data, "utf8");
  const length = Buffer.from([encoded.length]);

  return Buffer.concat([length, encoded]);
}

function encodeBool(data: boolean): Buffer {
  return Buffer.from([data ? 1 : 0]);
}

function encodeArray<S extends ArraySchema>(
  data: Array<any>,
  schema: S,
): Buffer {
  if (!data) {
    return Buffer.from([0]);
  }
  let buf = Buffer.from([data.length]);

  for (const item of data) {
    buf = append(buf, encode(item, schema.items));
  }

  return buf;
}

function encodeStruct<S extends StructSchema>(data: any, schema: S): Buffer {
  if (!data) {
    return Buffer.from([0]);
  }
  let buf = Buffer.from([Object.keys(schema.properties).length]);

  for (const [key, value] of schema.properties.map(
    ({ key, schema }) => [key, schema] as const,
  )) {
    buf = append(buf, encode(data[key], value));
  }

  return buf;
}

function encodeMap<S extends MapSchema>(
  data: Record<string, any>,
  schema: S,
): Buffer {
  if (!data) {
    return Buffer.from([0]);
  }

  let buf = Buffer.from([Object.keys(data).length]);

  for (const [key, value] of Object.entries(data)) {
    buf = append(buf, encodeString(key));
    buf = append(buf, encode(value, schema.value));
  }

  return buf;
}

export function encode<S extends Schema>(data: Data<S>, schema: S): Buffer {
  let buf = Buffer.from([]);

  switch (true) {
    case schema.type === "bool": {
      buf = append(buf, encodeBool(data));
      break;
    }
    case isNumberType(schema.type): {
      buf = append(buf, encodeNumberType(schema.type, data));
      break;
    }
    case schema.type === "string": {
      buf = append(buf, encodeString(data));
      break;
    }
    case schema.type === "array": {
      buf = append(buf, encodeArray(data, schema));
      break;
    }
    case schema.type === "struct": {
      buf = append(buf, encodeStruct(data, schema));
      break;
    }
    case schema.type === "map": {
      buf = append(buf, encodeMap(data, schema));
      break;
    }
    default: {
      throw new Error(`unknown type: ${schema.type}`);
    }
  }

  return Buffer.from(buf);
}
