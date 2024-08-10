import type { Schema } from "../src/";
import Encoder from "../src";
import { expect, describe, it } from 'bun:test';
import { metaschema } from "./mock";

describe("decode number", () => {
    it("should decode uint8", () => {
        const data = Buffer.from([0x34])
        const schema: Schema = { type: 'uint8' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(0x34)
    })

    it("should decode uint16", () => {
        const data = Buffer.from([0x12, 0x34])
        const schema: Schema = { type: 'uint16' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(0x1234)
    })

    it("should decode uint32", () => {
        const data = Buffer.from([0x12, 0x34, 0x56, 0x78])
        const schema: Schema = { type: 'uint32' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(0x12345678)
    })

    it("should decode int8", () => {
        const data = Buffer.from([0b00111111])
        const schema: Schema = { type: 'int8' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(63)
    })

    it("should decode negative int8", () => {
        const data = Buffer.from([0b10111111])
        const schema: Schema = { type: 'int8' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(-63)
    })

    it("should decode int16", () => {
        const data = Buffer.from([0b1000_0011, 0xE8])
        const schema: Schema = { type: 'int16' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(-1000)
    })

    it("should decode int32", () => {
        const data = Buffer.from([0x80, 0xbc, 0x61, 0x4e])
        const schema: Schema = { type: 'int32' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(-12345678)
    })
});

describe("decode string", () => {
    it("should decode string", () => {
        const data = Buffer.from([11, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64])
        const schema: Schema = { type: 'string' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual("hello world")
    })

    it("should decode empty string", () => {
        const data = Buffer.from([0])
        const schema: Schema = { type: 'string' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual("")
    })
});

describe("decode boolean", () => {
    it("should decode true", () => {
        const data = Buffer.from([1])
        const schema: Schema = { type: 'bool' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(true)
    })

    it("should decode false", () => {
        const data = Buffer.from([0])
        const schema: Schema = { type: 'bool' }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(false)
    })
});

describe("decode array", () => {
    it("should decode array of uint8", () => {
        const data = Buffer.from([3, 1, 2, 3])
        const schema: Schema = { type: 'array', items: { type: 'uint8' } }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual([1, 2, 3])
    })

    it("should decode array of uint16", () => {
        const data = Buffer.from([3, 0, 1, 0, 2, 0, 3])
        const schema: Schema = { type: 'array', items: { type: 'uint16' } }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual([1, 2, 3])
    })

    it("should decode array of string", () => {
        const data = Buffer.from([2, 5, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 5, 0x77, 0x6f, 0x72, 0x6c, 0x64])
        const schema: Schema = { type: 'array', items: { type: 'string' } }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual(["hello", "world"])
    })
});

describe("decode struct", () => {
    it("should decode struct", () => {
        const data = Buffer.from([
            0x3,
            1, 2, 3
        ]);
        const schema: Schema = { type: 'struct', properties: [{ key: 'a', schema: { type: 'uint8' } }, { key: 'b', schema: { type: 'uint8' } }, { key: 'c', schema: { type: 'uint8' } },] }
        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual({
            a: 1,
            b: 2,
            c: 3,
        })
    })
});

describe("decode struct", () => {
    it("should decode struct", () => {
        const data = Buffer.from([
            0x6, // length of properties (int8)
            0x0, 0x1, // product_id (int16)
            0x6, 76, 97, 112, 116, 111, 112, // name (string)
            0x0, 0x0, 0x03, 0xE7, // price (int32)
            0x0, 25, // stock_quantity (int16)
            0x2, // length of tags (int8)
            11, 0x45, 0x6C, 0x65, 0x63, 0x74, 0x72, 0x6F, 0x6E, 0x69, 0x63, 0x73, // Electronics (string)
            9, 0x43, 0x6F, 0x6D, 0x70, 0x75, 0x74, 0x65, 0x72, 0x73, // Computers (string)
            0x2, // length of extra_data (int8)
            0x5, 0x62, 0x72, 0x61, 0x6E, 0x64, // brand (string)
            0x5, 0x41, 0x70, 0x70, 0x6C, 0x65,
            0x8, 0x77, 0x61, 0x72, 0x72, 0x61, 0x6E, 0x74, 0x79, // Warranty (string)
            0x7, 0x32, 0x20, 0x79, 0x65, 0x61, 0x72, 0x73
        ])

        const schema: Schema = {
            type: 'struct', properties: [
                { key: 'product_id', schema: { type: 'int16' } },           // int16
                { key: 'name', schema: { type: 'string' } },                // string
                { key: 'price', schema: { type: 'int32' } },
                { key: 'stock_quantity', schema: { type: 'int16' } },        // int8
                {
                    key: 'tags', schema: {
                        type: 'array',
                        items: { type: 'string' }              // array of string
                    }
                },
                {
                    key: 'extra_data', schema: {
                        type: 'map',
                        key: 'string',
                        value: {
                            type: 'string',
                        } // map with string keys and any structured value (you may define specific schemas if needed)
                    }
                }
            ]
        }

        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual({
            product_id: 1,
            name: "Laptop",
            price: 999,
            stock_quantity: 25,
            tags: ["Electronics", "Computers"],
            extra_data: Object.fromEntries([
                ['brand', "Apple"],
                ['warranty', "2 years"]
            ])
        })
    })
});

describe("decode map", () => {
    it("should decode map", () => {
        const data = Buffer.from([
            3, // length of properties (int8)
            1, 0x61, // a (string)
            1,
            1, 0x62, // b (string)
            2,
            1, 0x63, // c (string)
            3,
        ])

        const schema: Schema = {
            type: 'map',
            key: 'string',
            value: {
                type: 'int8',
            }
        }

        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual({
            a: 1,
            b: 2,
            c: 3,
        })
    })
});

describe("decode complex struct with nested structs", () => {
    it("should decode complex struct", () => {
    
        const data = Buffer.from([
            3, 6, 115, 116, 114, 117, 99, 116, 6, 2, 10, 112, 114, 111, 100, 117, 99, 116, 95, 105, 100, 3, 5, 105, 110, 116, 49, 54, 0, 0, 2, 4, 110, 97, 109, 101, 3, 6, 115, 116, 114, 105, 110, 103, 0, 0, 2, 5, 112, 114, 105, 99, 101, 3, 5, 105, 110, 116, 51, 50, 0, 0, 2, 14, 115, 116, 111, 99, 107, 95, 113, 117, 97, 110, 116, 105, 116, 121, 3, 5, 105, 110, 116, 49, 54, 0, 0, 2, 4, 116, 97, 103, 115, 3, 5, 97, 114, 114, 97, 121, 0, 2, 6, 115, 116, 114, 105, 110, 103, 0, 2, 10, 101, 120, 116, 114, 97, 95, 100, 97, 116, 97, 3, 3, 109, 97, 112, 0, 2, 6, 115, 116, 114, 105, 110, 103, 0, 0
        ])
        const encoder = new Encoder(metaschema)
        const encoded = encoder.decode(data)

        expect(encoded).toStrictEqual(
            {
                type: 'struct',
                items: {},
                properties: [
                    {
                        key: 'product_id',
                        schema:  { 
                            type: 'int16', 
                            properties: {},
                            items: {}
                        },           // int16
                    },
                    {
                        key: 'name',
                        schema: {
                            type: 'string',
                            properties: {},
                            items: {},
                        }
                    },
                    {
                        key: 'price',
                        schema: {
                            type: 'int32',
                            properties: {},
                            items: {}
                        }
                    },
                    {
                        key: 'stock_quantity',
                        schema: {
                            type: 'int16',
                            properties: {},
                            items: {}
                        }
                    },
                    {
                        key: 'tags',
                        schema: {
                            type: 'array',
                            properties: {},
                            items: { type: 'string', properties: {}, }              // array of string
                        }
                    },
                    {
                        key: 'extra_data',
                        schema: {
                            type: 'map',
                            properties: {},
                            items: {
                                type: 'string',
                                properties: {},
                            },
                        }
                    }
                ]
            }
        )
    })
});

describe("decode complex struct with nullable fields", () => {
    it("should decode complex struct", () => {
        const data = Buffer.from([
            3,
            1,
            2,
            4,
            116, 97, 103, 49, // tag
            0,
            // 97,
            0,
            0
        ])

        const schema: Schema = {
            type: 'struct',
            properties: [
                {
                    key: 'tags', schema: {
                        type: 'array',
                        items: {
                            type: 'struct', properties: [
                                { key: 'tag', schema: { type: 'string' } },
                                { key: 'value', schema: { type: 'string' } }
                            ]
                        },
                    },
                },
                {
                    key: 'extra', schema: {
                        type: 'map',
                        key: 'string',
                        value: {
                            type: 'string',
                        }
                    }
                },
                { key: 'str', schema: { type: 'string' } },
            ]
        }

        const encoder = new Encoder(schema)
        const decoded = encoder.decode(data)

        expect(decoded).toStrictEqual({
            tags: [{
                tag: "tag1",
                value: ""
            }],
            extra: {},
            str: ""
        })
    })
});