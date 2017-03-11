# @complyify/asn1

Javascript object serializer and deserializer for Abstract Syntax Notation One (ASN.1).

## Installation

`npm install @complyify/asn1`

## Usage

```javascript
import ASN1 from '@complyify/asn1';
const rawASN1Buffer = fs.readFileSync('some_file.der');
const asn1 = ASN1.from(rawASN1Buffer, ASN1.Encodings.DER);
```

## Example Object

The object created for a PKCS#10 (certificate signing request) looks like:

```javascript
[
  {
    "tagClass": "universal",
    "encoding": "constructed",
    "type": "sequence",
    "children": [
      {
        "tagClass": "universal",
        "encoding": "constructed",
        "type": "sequence",
        "children": [
          {
            "tagClass": "universal",
            "encoding": "primitive",
            "type": "integer",
            "content": 0
          },
          {
            "tagClass": "universal",
            "encoding": "constructed",
            "type": "sequence",
            "children": [
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "set",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "constructed",
                    "type": "sequence",
                    "children": [
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "oid",
                        "content": "2.5.4.6"
                      },
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "printableString",
                        "content": "US"
                      }
                    ]
                  }
                ]
              },
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "set",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "constructed",
                    "type": "sequence",
                    "children": [
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "oid",
                        "content": "2.5.4.8"
                      },
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "printableString",
                        "content": "Texas"
                      }
                    ]
                  }
                ]
              },
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "set",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "constructed",
                    "type": "sequence",
                    "children": [
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "oid",
                        "content": "2.5.4.7"
                      },
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "printableString",
                        "content": "Dallas"
                      }
                    ]
                  }
                ]
              },
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "set",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "constructed",
                    "type": "sequence",
                    "children": [
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "oid",
                        "content": "2.5.4.10"
                      },
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "printableString",
                        "content": "Complyify LLC"
                      }
                    ]
                  }
                ]
              },
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "set",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "constructed",
                    "type": "sequence",
                    "children": [
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "oid",
                        "content": "2.5.4.11"
                      },
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "printableString",
                        "content": "Engineering"
                      }
                    ]
                  }
                ]
              },
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "set",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "constructed",
                    "type": "sequence",
                    "children": [
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "oid",
                        "content": "2.5.4.3"
                      },
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "printableString",
                        "content": "Test Cert for Testing Only Plz"
                      }
                    ]
                  }
                ]
              },
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "set",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "constructed",
                    "type": "sequence",
                    "children": [
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "oid",
                        "content": "1.2.840.113549.1.9.1"
                      },
                      {
                        "tagClass": "universal",
                        "encoding": "primitive",
                        "type": "ia5String",
                        "content": "comply@whiterabbit.wtf"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "tagClass": "universal",
            "encoding": "constructed",
            "type": "sequence",
            "children": [
              {
                "tagClass": "universal",
                "encoding": "constructed",
                "type": "sequence",
                "children": [
                  {
                    "tagClass": "universal",
                    "encoding": "primitive",
                    "type": "oid",
                    "content": "1.2.840.113549.1.1.1"
                  },
                  {
                    "tagClass": "universal",
                    "encoding": "primitive",
                    "type": "null",
                    "content": null
                  }
                ]
              },
              {
                "tagClass": "universal",
                "encoding": "primitive",
                "type": "bitString",
                "content": <Buffer 0d c3 ...>
              }
            ]
          },
          {
            "tagClass": "context specific",
            "encoding": "constructed",
            "type": 0,
            "content": null
          }
        ]
      },
      {
        "tagClass": "universal",
        "encoding": "constructed",
        "type": "sequence",
        "children": [
          {
            "tagClass": "universal",
            "encoding": "primitive",
            "type": "oid",
            "content": "1.2.840.113549.1.1.5"
          },
          {
            "tagClass": "universal",
            "encoding": "primitive",
            "type": "null",
            "content": null
          }
        ]
      },
      {
        "tagClass": "universal",
        "encoding": "primitive",
        "type": "bitString",
        "content": <Buffer 0d c3 ...>
      }
    ]
  }
]
```

## Encoding Support

- [ ] BER Serializer
- [ ] BER Deserializer
- [ ] DER Serializer
- [x] DER Deserializer

## Universal Type Support

Unimplemented types return content as a [Buffer] containing the raw value octets from the ASN.1 content.

- [ ] Boolean
- [x] Integer
- [ ] Bit String
- [ ] Octet String
- [x] Null
- [x] Object Identifier (OID)
- [x] Object Descriptor
- [ ] External
- [ ] Real (Float)
- [ ] Enumerated
- [ ] Embedded PDV
- [x] UTF8 String
- [x] Relative Object Identifier (ROID)
- [x] Sequence
- [x] Set
- [x] Numeric String
- [x] Printable String
- [ ] T61 String
- [ ] Videotex String
- [ ] IA5 String
- [ ] UTC Time
- [ ] Generalized Time
- [ ] Graphic String
- [ ] Visible String
- [ ] Universal String
- [ ] Character String
- [ ] BMP String

[Buffer]: https://nodejs.org/api/buffer.html
