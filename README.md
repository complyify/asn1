# @complyify/asn1

Javascript library for Abstract Syntax Notation One (ASN.1).

Provides a programmatic interface for building an ASN.1 object model along with JSON serialization / deserialization.

## Installation

`npm install @complyify/asn1`

## Usage

```javascript
import { JSONDeserializer, JSONSerializer, Universal } from '@complyify/asn1';

// Create an ASN.1 object model programmatically
const { Bool, Integer, Null, PrintableString, Sequence } = Universal;
const sequence = new Sequence([
  new Integer(-Number.MAX_SAFE_INTEGER),
  new Integer(Number.MAX_SAFE_INTEGER),
  new Integer('424242424242424242424242424242424242'), // big integer
  new Null(),
  new Bool(true),
  new PrintableString('nice marmot'),
]);

// Serialize the object model to JSON
const serialize = new JSONSerializer();
const json = serialize(sequence);

// Deserialize back to an ASN.1 object model
const deserialize = new JSONDeserializer();
const asn1ObjectModel = deserialize(json);
```

## Debugging

This library uses the [@complyify/debug] library for debugging. To enable debug messages, simply set the `DEBUG`
environment variable.

```shell
# enable all debugging messages in this library
DEBUG=complyify:asn1:* <your-exec-here>
# enable all debug messages except the bit twiddling messages
DEBUG=complyify:asn1:*,-complyify:asn1:*:binary <your-exec-here>
```

[@complyify/debug]: https://github.com/complyify/debug
