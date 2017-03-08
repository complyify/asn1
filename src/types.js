/* eslint-disable key-spacing, no-multi-spaces, no-bitwise */

function generateEncoding(name, value) {
  return {
    name,
    value,
  };
}

export const Encoding = {
  Primitive:                  generateEncoding('primitive', 0x00),
  Constructed:                generateEncoding('constructed', 0x20),
};

function generateTagClassType(name, valueEncodings, tagNumber) {
  return {
    name,
    encoding: {
      primitive: valueEncodings | Encoding.Primitive,
      constructed: valueEncodings | Encoding.Constructed,
    },
    value: tagNumber,
  };
}

export const Universal = {
  EOC:                        generateTagClassType('endOfContent', Encoding.Primitive, 0), // End-of-Content
  BOOLEAN:                    generateTagClassType('boolean', Encoding.Primitive, 1),
  INTEGER:                    generateTagClassType('integer', Encoding.Primitive, 2),
  BIT_STRING:                 generateTagClassType('bitString', Encoding.Primitive & Encoding.Constructed, 3),
  OCTET_STRING:               generateTagClassType('octetString', Encoding.Primitive & Encoding.Constructed, 4),
  NULL:                       generateTagClassType('null', Encoding.Primitive, 5),
  OBJECT_IDENTIFIER:          generateTagClassType('oid', Encoding.Primitive, 6),
  Object_Descriptor:          generateTagClassType('odesc', Encoding.Primitive & Encoding.Constructed, 7),
  EXTERNAL:                   generateTagClassType('external', Encoding.Constructed, 8),
  REAL:                       generateTagClassType('float', Encoding.Primitive, 9), // float
  ENUMERATED:                 generateTagClassType('enumerated', Encoding.Primitive, 10),
  EMBEDDED_PDV:               generateTagClassType('embeddedPDV', Encoding.Constructed, 11),
  UTF8String:                 generateTagClassType('utf8String', Encoding.Primitive & Encoding.Constructed, 12),
  RELATIVE_OID:               generateTagClassType('roid', Encoding.Primitive, 13),
  RESERVED_01:                generateTagClassType('reserved', null, 14),
  RESERVED_02:                generateTagClassType('reserved', null, 15),
  SEQUENCE:                   generateTagClassType('sequence', Encoding.Constructed, 16),
  SET:                        generateTagClassType('set', Encoding.Constructed, 17),
  NumericString:              generateTagClassType('numericString', Encoding.Primitive & Encoding.Constructed, 18),
  PrintableString:            generateTagClassType('printableString', Encoding.Primitive & Encoding.Constructed, 19),
  T61String:                  generateTagClassType('t61String', Encoding.Primitive & Encoding.Constructed, 20),
  VideoetxString:             generateTagClassType('videotexString', Encoding.Primitive & Encoding.Constructed, 21),
  IA5String:                  generateTagClassType('ia5String', Encoding.Primitive & Encoding.Constructed, 22),
  UTCTime:                    generateTagClassType('utcTime', Encoding.Primitive & Encoding.Constructed, 23),
  GeneralizedTime:            generateTagClassType('generalizedTime', Encoding.Primitive & Encoding.Constructed, 24),
  GraphicString:              generateTagClassType('graphicString', Encoding.Primitive & Encoding.Constructed, 25),
  VisibleString:              generateTagClassType('visibleString', Encoding.Primitive & Encoding.Constructed, 26),
  GeneralString:              generateTagClassType('generalString', Encoding.Primitive & Encoding.Constructed, 27),
  UniversalString:            generateTagClassType('universalString', Encoding.Primitive & Encoding.Constructed, 28),
  CHARACTER_STRING:           generateTagClassType('characterString', Encoding.Primitive & Encoding.Constructed, 29),
  BMPString:                  generateTagClassType('bmpString', Encoding.Primitive & Encoding.Constructed, 30),
};

function generateTagClass(name, value) {
  return {
    name,
    value,
  };
}

export const TagClass = {
  Universal:                  generateTagClass('universal', 0x00),
  Application:                generateTagClass('application', 0x40),
  ContextSpecific:            generateTagClass('context specific', 0x80),
  Private:                    generateTagClass('private', 0xC0),
};
