# @psy667/biser (Binary Serialization) Library

A lightweight and efficient library for encoding and decoding complex data structures into binary format.

> This library is still in development and may not be stable. Use at your own risk.

## Features

- Encode JavaScript objects into compact binary representations
- Decode binary data back into JavaScript objects
- Support for various data types including integers, strings, booleans, arrays, and nested structures
- Customizable schema definitions for precise control over data serialization

## Installation

```bash
npm install @psy667/biser
```

## Usage

### Basic Example

```ts
import Encoder, { Schema } from '@psy667/biser';

// Define your schema
const schema: Schema = {
  type: 'struct',
  properties: [
    { key: 'id', schema: { type: 'int16' } },
    { key: 'name', schema: { type: 'string' } },
    { key: 'active', schema: { type: 'bool' } }
  ]
};

// Create an encoder instance
const encoder = new Encoder(schema);

// Encode data
const data = { id: 1, name: "John Doe", active: true };
const encoded = encoder.encode(data);

// Decode data
const decoded = encoder.decode(encoded);
console.log(decoded); // { id: 1, name: "John Doe", active: true }
```

### Complex Structures

The library supports complex nested structures, including arrays and maps:

```ts
const complexSchema: Schema = {
  type: 'struct',
  properties: [
    { key: 'product_id', schema: { type: 'int16' } },
    { key: 'name', schema: { type: 'string' } },
    { key: 'price', schema: { type: 'int32' } },
    { key: 'stock_quantity', schema: { type: 'int16' } },
    {
      key: 'tags',
      schema: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    {
      key: 'extra_data',
      schema: {
        type: 'map',
        key: 'string',
        value: { type: 'string' }
      }
    }
  ]
};

const complexData = {
  product_id: 1,
  name: "Laptop",
  price: 999,
  stock_quantity: 25,
  tags: ["Electronics", "Computers"],
  extra_data: {
    brand: "Apple",
    warranty: "2 years"
  }
};

const complexEncoder = new Encoder(complexSchema);
const encodedComplex = complexEncoder.encode(complexData);
const decodedComplex = complexEncoder.decode(encodedComplex);
```

## API Reference

### `Encoder`

The main class for encoding and decoding data.

#### Constructor

```ts
new Encoder(schema: Schema)
```

- `schema`: The schema definition for the data structure.

#### Methods

- `encode(data: any): Buffer`: Encodes the given data according to the schema.
- `decode(buffer: Buffer): any`: Decodes the given buffer according to the schema.

### `Schema`

A type representing the structure of the data. It can be one of the following:

- `ScalarSchema`: For primitive types (int8, int16, int32, uint8, uint16, uint32, string, bool)
- `ArraySchema`: For arrays
- `StructSchema`: For nested structures
- `MapSchema`: For key-value pairs

## Running Tests

To run the test suite:

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

[psy667](https://github.com/psy667)

## Repository

[https://github.com/psy667/biser](https://github.com/psy667/biser)
