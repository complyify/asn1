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

## Encoders

There are a multitude of encoding rules available for ASN.1. Known encoders are shown below.

| Format | Implementation | Serialization | Deserialization | Comments |
| --- | --- | --- | --- | --- |
| JSON | Included w/ this library | Yes | Yes | A library specific JSON format as no JSON encoding rules exist as part of the ASN.1 standards |
| DER | [@complyify/asn1-der] | Yes | Planned | Distinguished Encoding Rules (DER) are the standard ASN.1 encoding rules for public key cryptography (certificates, RSA keys, et al.) |
| PEM | [@complyify/asn1-der] | Yes | Planned | Privacy Enhanced Mail (PEM) is a base64-encoded and specially formatted version of DER commonly used to distribute X.509 certificates |

## Debugging

This library uses the [@complyify/debug] library for debugging. To enable debug messages, simply set the `DEBUG`
environment variable.

```shell
# enable all debugging messages in this library
DEBUG=complyify:asn1:* <your-exec-here>
# enable all debug messages except the bit twiddling messages
DEBUG=complyify:asn1:*,-complyify:asn1:*:binary <your-exec-here>
```

[@complyify/asn1-der]: https://github.com/complyify/asn1-der
[@complyify/debug]: https://github.com/complyify/debug
