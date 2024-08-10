export type NumberTypes =
  | "int8"
  | "int16"
  | "int32"
  | "uint8"
  | "uint16"
  | "uint32";
export type StringType = "string";
export type BooleanType = "bool";
export type ScalarTypes = NumberTypes | StringType | BooleanType;
export type ArrayType = "array";
export type StructType = "struct";
export type MapType = "map";

export type Types = ScalarTypes | ArrayType | StructType | MapType;

export type ScalarSchema = {
  type: ScalarTypes;
};

export type ArraySchema = {
  type: ArrayType;
  items: Schema;
};

export type StructSchema = {
  type: StructType;
  properties: {
    key: string;
    schema: Schema;
  }[];
};

export type MapSchema = {
  type: MapType;
  key: string;
  value: Schema;
};

export type Schema = ScalarSchema | ArraySchema | StructSchema | MapSchema;

export type Data<S extends Schema> = any; // TODO
