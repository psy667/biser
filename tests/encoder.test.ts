import { describe, expect, it } from "bun:test";

import Encoder, { type Schema } from "../src";
import { metaschema } from "./mock";

describe("encode number", () => {
    it("should encode uint8", () => {
        const data = 0x34
        const schema: Schema = { type: 'uint8' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0x34]))
    })

    it("should encode uint16", () => {
        const data = 0x1234
        const schema: Schema = { type: 'uint16' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0x12, 0x34]))
    })

    it("should encode uint32", () => {
        const data = 0x12345678
        const schema: Schema = { type: 'uint32' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0x12, 0x34, 0x56, 0x78]))
    })

    it("should encode int8", () => {
        const data = 63
        const schema: Schema = { type: 'int8' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0b00111111]))
    })

    it("should encode negative int8", () => {
        const data = -63
        const schema: Schema = { type: 'int8' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0b10111111]))
    })

    it("should encode int16", () => {
        const data = -1000
        const schema: Schema = { type: 'int16' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0b1000_0011, 0xE8]))
    })

    it("should encode int32", () => {
        const data = -12345678
        const schema: Schema = { type: 'int32' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0x80, 0xbc, 0x61, 0x4e]))
    })

    it("should throw error on out of range", () => {
        const data = 4294967295 + 1
        const schema: Schema = { type: 'int16' }
        const encoder = new Encoder(schema)

        expect(() => encoder.encode(data)).toThrowError()
    })
});


describe("encode string", () => {
    it("should encode string", () => {
        const data = "hello world"
        const schema: Schema = { type: 'string' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([11, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]))
    })

    it("should encode empty string", () => {
        const data = ""
        const schema: Schema = { type: 'string' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0]))
    })
});

describe("encode boolean", () => {
    it("should encode true", () => {
        const data = true
        const schema: Schema = { type: 'bool' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([1]))
    })

    it("should encode false", () => {
        const data = false
        const schema: Schema = { type: 'bool' }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([0]))
    })
});

describe("encode array", () => {
    it("should encode array of uint8", () => {
        const data = [1, 2, 3]
        const schema: Schema = { type: 'array', items: { type: 'uint8' } }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([3, 1, 2, 3]))
    })

    it("should encode array of uint16", () => {
        const data = [1, 2, 3]
        const schema: Schema = { type: 'array', items: { type: 'uint16' } }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([3, 0, 1, 0, 2, 0, 3]))
    })

    it("should encode array of string", () => {
        const data = ["hello", "world"]
        const schema: Schema = { type: 'array', items: { type: 'string' } }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([2, 5, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 5, 0x77, 0x6f, 0x72, 0x6c, 0x64]))
    })

    it("should encode array of array of uint8", () => {
        const data = [[1, 2], [3, 4], [5, 6]]
        const schema: Schema = { type: 'array', items: { type: 'array', items: { type: 'uint8' } } }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([3, 2, 1, 2, 2, 3, 4, 2, 5, 6]))
    })
});


describe("encode struct", () => {
    it("should encode struct", () => {
        const data = { a: 1, b: 2, c: 3 }
        const schema: Schema = { type: 'struct', properties: [{ key: 'a', schema: { type: 'uint8' } }, { key: 'b', schema: { type: 'uint8' } }, { key: 'c', schema: { type: 'uint8' } },] }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([3, 1, 2, 3]))
    })
});

describe("encode map", () => {
    it("should encode map", () => {
        const data = Object.fromEntries([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ])
        const schema: Schema = { type: 'map', key: 'string', value: { type: 'uint8' } }
        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([3, 1, 0x61, 1, 1, 0x62, 2, 1, 0x63, 3]))
    })
});

describe("encode complex struct", () => {
    it("should encode complex struct", () => {
        const schema: Schema = {
            type: 'struct',
            properties: [
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


        const data = {
            product_id: 1,
            name: "Laptop",
            price: 999,
            stock_quantity: 25,
            tags: ["Electronics", "Computers"],
            extra_data: Object.fromEntries([
                ['brand', "Apple"],
                ['warranty', "2 years"]
            ])
        }

        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([
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
        ]))
    })
});


describe("encode complex struct with nested structs", () => {
    it("should encode complex struct", () => {
        // const data = {
        //     type: 'struct',
        //     properties: {
        //         product_id: { type: 'int16' },           // int16
        //         name: { type: 'string' },                // string
        //         price: { type: 'int32' },
        //         stock_quantity: { type: 'int16' },        // int8
        //         tags: {
        //             type: 'array',
        //             items: { type: 'string' }              // array of string
        //         },
        //         extra_data: {
        //             type: 'map',
        //             key: 'string',
        //             value: { 
        //                 type: 'string',
        //             } // map with string keys and any structured value (you may define specific schemas if needed)
        //         }
        //     }
        // }

        const data = {
            type: 'struct',
            properties: [
                {
                    key: 'product_id',
                    schema: { type: 'int16' },           // int16
                },
                {
                    key: 'name',
                    schema: { type: 'string' },                // string
                },
                {
                    key: 'price',
                    schema: { type: 'int32' },
                },
                {
                    key: 'stock_quantity',
                    schema: { type: 'int16' },        // int8
                },
                {
                    key: 'tags',
                    schema: {
                        type: 'array',
                        items: { type: 'string' }              // array of string
                    }
                },
                {
                    key: 'extra_data',
                    schema: {
                        type: 'map',
                        items: {
                            type: 'string',
                        },
                    }
                }
            ]
        }

        const encoder = new Encoder(metaschema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([
            3, // struct
            6, // string
                 115, 116, 114, 117, 99, 116,
            6, // array
                2, // struct
                    10, // string
                         112, 114, 111, 100, 117, 99, 116, 95, 105, 100, // product_id
                    3, // struct
                        5, // string
                             105, 110, 116, 49, 54, // int16
                        0, // null struct (properties),
                        0,
                2, // struct
                    4, // string
                        110, 97, 109, 101, // name
                    3, // struct
                        6, // string
                            115, 116, 114, 105, 110, 103, // string
                        0,
                        0,
                2, // struct
                    5, // string
                        112, 114, 105, 99, 101, // price
                    3,
                        5,
                            105, 110, 116, 51, 50, // int32
                        0,
                        0,
                2,
                    14, // string
                        115, 116, 111, 99, 107, 95, 113, 117, 97, 110, 116, 105, 116, 121, // stock_quantity
                    3, // struct
                        5, // string
                            105, 110, 116, 49, 54, // int16
                        0, // null struct 
                        0,
                2,
                    4, // string
                        116, 97, 103, 115,  // tags
                    3, // struct
                        5, // string
                            97, 114, 114, 97, 121,  // array 
                        0, // null struct
                        2,
                            6,
                                115, 116, 114, 105, 110, 103,// string
                            0,
                2,
                    10, // string
                        101, 120, 116, 114, 97, 95, 100, 97, 116, 97, // extra_data 
                    3, // struct
                        3, // string
                            109, 97, 112, // map
                        0,
                        2,
                            6,
                                115, 116, 114, 105, 110, 103,// string
                            0,
                0
        ]))
    })
});


describe("encode complex struct with nullable fields", () => {
    it("should encode complex struct", () => {
        

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
                    }
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
        } as const

        const data = {
            tags: [
                { tag: "tag1" },
            ],
            extra: {
                brand: "Apple",
                warranty: "",
            },
            str: ""
        }

        const encoder = new Encoder(schema)
        const encoded = encoder.encode(data)

        expect(encoded).toStrictEqual(Buffer.from([
            3,
            1,
            2,
            4,
            116, 97, 103, 49, // tag
            0,
            2, 5, 98, 114, 97, 110, 100, 5, 65, 112, 112, 108, 101, 8, 119, 97, 114, 114, 97, 110, 116, 121,
            // 97,
            0,
            0
        ]))
    })
});