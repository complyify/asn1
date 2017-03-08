/* eslint-disable no-bitwise */

/*

Overview: ftp://ftp.rsa.com/pub/pkcs/ascii/layman.asc
Latest ASN.1: file:///Users/jc/Downloads/T-REC-X.680-201508-I!!PDF-E.pdf
OID Encoding: https://msdn.microsoft.com/en-us/library/bb540809(v=vs.85).aspx
DER Encoding: https://en.wikipedia.org/wiki/X.690#DER_encoding

*/

import binary from 'binary';
import { createBuffer, readBuffer, readByte } from 'bitwise';

import * as errors from './errors';
import debug from './debug';
import * as Types from './types';

const { Encoding, TagClass, Universal } = Types;

const LONG_FORM = 0b10000000;

export const BinaryInfo = {
  IdentifierOctet: {
    position: 0,
    TagClass: {
      bits: 2,
      msb: 8,
    },
    TagNumber: {
      bits: 5,
      msb: 5,
    },
    ValueEncoding: {
      bits: 1,
      msb: 6,
    },
  },
  LengthOctet: {
    position: 1,
    Form: {
      bits: 1,
      msb: 8,
    },
    Length: {
      bits: 7,
      msb: 7,
    },
  },
  LongFormLengthFirstOctet: {
    position: 2,
  },
};

/* JS insists on casting all bit twiddling ops to 32-bit integers, this hack undoes that bullshit */
function cast8Bit(number) {
  const buffer = new Buffer(4);
  buffer.fill(0);
  buffer.writeUInt32BE(number, 0);
  return buffer[buffer.length - 1];
}

function hexStr(number) {
  return `0x${number.toString(16)}`;
}

function isolate(octet, binaryInfo) {
  const { bits, msb } = binaryInfo;
  const isolatedBits = cast8Bit(cast8Bit(octet << (8 - msb)) >>> (8 - bits)) << ((8 - bits) - (8 - msb));
  debug(`isolated ${bits} bits from msb ${msb} as ${readByte(isolatedBits)} from octet ${hexStr(octet)}`);
  return isolatedBits;
}

function resolveType(octet, info, types) {
  let resolvedType = null;
  const isolatedBits = isolate(octet, info);
  Object.keys(types).some((key) => {
    if (isolatedBits === types[key].value) {
      resolvedType = types[key];
      return true;
    }
    return false;
  });
  return resolvedType;
}

function getTagClass(octet) {
  const tagClass = resolveType(octet, BinaryInfo.IdentifierOctet.TagClass, TagClass);
  if (!tagClass) throw new errors.UnknownTagClass(`unable to identify tag class for octet ${hexStr(octet)}`);
  debug(`resolved tag class "${tagClass.name}" for octet ${hexStr(octet)}`);
  return tagClass;
}

function getTagEncoding(octet) {
  const encoding = resolveType(octet, BinaryInfo.IdentifierOctet.ValueEncoding, Encoding);
  if (!encoding) throw new errors.UnknownEncoding(`unable to identify encoding for octet ${hexStr(octet)}`);
  debug(`resolved encoding "${encoding.name}" for octet ${hexStr(octet)}`);
  return encoding;
}

function getUniversalType(octet) {
  const type = resolveType(octet, BinaryInfo.IdentifierOctet.TagNumber, Universal);
  if (!type) throw new errors.UnknownUniversalType(`unable to identify universal type for octet ${hexStr(octet)}`);
  debug(`resolved universal type "${type.name}" for octet ${hexStr(octet)}`);
  return type;
}

function parseIdentifer(buffer) {
  const octet = buffer[BinaryInfo.IdentifierOctet.position];
  debug(`parsing identifier octet ${hexStr(octet)}`);
  const tagClass = getTagClass(octet);
  const encoding = getTagEncoding(octet);
  const type = getUniversalType(octet);
  return {
    encoding,
    tagClass,
    type,
  };
}

function parseLongFormLength(buffer) {
  debug('parsing long form length');
  const octet = buffer[BinaryInfo.LengthOctet.position];
  const octets = isolate(octet, BinaryInfo.LengthOctet.Length);
  if (octets < 1) throw new errors.IllegalContent('definite long form length encoding cannot have 0 length octets');
  // TODO support content encoded in more octets than can be represented by a JS UInt (6 bytes)
  if (octets > 6) throw new errors.UnsupportedContentLength(`cannot parse ${octets} length octets, max 6`);
  debug(`parsing ${octets} octets for content length`);
  const length = buffer.readUIntBE(BinaryInfo.LongFormLengthFirstOctet.position, octets);
  debug(`resolved content length of ${length} octets`);
  return {
    contentStartBit: BinaryInfo.LengthOctet.position + octets + 1,
    length,
  };
}

function parseShortFormLength(octet) {
  debug('parsing short form length');
  const length = isolate(octet, BinaryInfo.LengthOctet.Length);
  debug(`resolved content length of ${length} octets`);
  return {
    contentStartBit: BinaryInfo.LengthOctet.position + 1,
    length,
  };
}

function parseLength(buffer) {
  const octet = buffer[BinaryInfo.LengthOctet.position];
  debug(`parsing length octet ${hexStr(octet)}`);
  return octet & LONG_FORM ? parseLongFormLength(buffer) : parseShortFormLength(octet);
}

function parseInteger(buffer) {
  const integer = buffer.readUIntBE(0, buffer.length);
  debug(`parsed integer ${integer}`);
  return integer;
}

function parseOID(buffer) {
  debug(`starting OID parse of ${buffer.length} bytes`);
  let b = buffer[0];
  let oid = `${Math.floor(b / 40)}.${b % 40}`; // stupid first byte = first 2 OID node encoding bullshit
  // other bytes are each value in base 128 with 8th bit set except for the last byte for each value
  let value = 0;
  let i = 1;
  while (i < buffer.length) {
    b = buffer[i];
    value <<= 7;
    if (b & LONG_FORM) {        // not the last byte for the value
      value += b & ~LONG_FORM;
    } else {                    // last byte
      oid += `.${value + b}`;
      value = 0;
    }
    i += 1;
  }
  debug(`parsed OID ${oid}`);
  return oid;
}

function parseAsciiString(buffer) {
  debug(`starting ASCII string parse of ${buffer.length} bytes`);
  const asciiString = buffer.toString('ascii');
  debug(`parsed ASCII string "${asciiString}"`);
  return asciiString;
}

function parseUTF8String(buffer) {
  debug(`starting UTF8 string parse of ${buffer.length} bytes`);
  const utf8String = buffer.toString('utf8');
  debug(`parsed UTF8 string "${utf8String}"`);
  return utf8String;
}

function parseBitString(buffer) {
  debug(`starting bit string parse of ${buffer.length} bytes`);
  const unusedBits = buffer[0];
  debug(`bit string concludes with ${unusedBits} unused bits`);
  const bitsBuffer = buffer.slice(1);
  const bits = (bitsBuffer.length * 8) - unusedBits;
  debug(`extracting ${bits} bits for bit string`);
  const bitArray = readBuffer(bitsBuffer, 0, bits);
  debug(`parsed "${bitArray.length}" bit long bit string`);
  return createBuffer(bitArray);
}

function formatAsn1Entry(typeInfo, result) {
  const entry = {};
  entry[typeInfo.name] = result;
  return entry;
}

export function parse(buffer) {
  debug(`starting DER parse of ${buffer.length} bytes`);
  let internalBuffer = buffer.slice(0);
  const asn1 = [];
  let contentEndBit = internalBuffer.length - 1;
  do {
    const { tagClass, encoding, type } = parseIdentifer(internalBuffer);
    const { contentStartBit, length } = parseLength(internalBuffer);
    contentEndBit = contentStartBit + length;
    debug(`parsing ${length} bytes of content from bits ${contentStartBit} through ${contentEndBit}`);
    const contentBuffer = internalBuffer.slice(contentStartBit, contentEndBit);
    switch (type) {
      case Universal.SEQUENCE: {
        asn1.push(formatAsn1Entry(Universal.SEQUENCE, parse(contentBuffer)));
        break;
      }
      case Universal.SET: {
        asn1.push(formatAsn1Entry(Universal.SET, parse(contentBuffer)));
        break;
      }
      case Universal.INTEGER: {
        asn1.push(formatAsn1Entry(Universal.INTEGER, parseInteger(contentBuffer)));
        break;
      }
      case Universal.OBJECT_IDENTIFIER: {
        asn1.push(formatAsn1Entry(Universal.OBJECT_IDENTIFIER, parseOID(contentBuffer)));
        break;
      }
      case Universal.PrintableString: {
        asn1.push(formatAsn1Entry(Universal.PrintableString, parseAsciiString(contentBuffer)));
        break;
      }
      case Universal.IA5String: {
        asn1.push(formatAsn1Entry(Universal.IA5String, parseAsciiString(contentBuffer)));
        break;
      }
      case Universal.NULL: {
        asn1.push(formatAsn1Entry(Universal.NULL, true));
        break;
      }
      case Universal.BIT_STRING: {
        asn1.push(formatAsn1Entry(Universal.BIT_STRING, parseBitString(contentBuffer)));
        break;
      }
      case Universal.EOC: {
        break; // do nothing for end-of-content
      }
      case Universal.RELATIVE_OID: {
        asn1.push(formatAsn1Entry(Universal.RELATIVE_OID, parseOID(contentBuffer)));
        break;
      }
      case Universal.Object_Descriptor: {
        asn1.push(formatAsn1Entry(Universal.Object_Descriptor, parseUTF8String(contentBuffer)));
        break;
      }
      default: {
        throw new errors.UnsupportedUniversalType(`parsing ${type.name} type from DER not supported`);
      }
    }
    internalBuffer = internalBuffer.slice(contentEndBit);
  } while (internalBuffer[0]);
  debug('finished DER parse');
  return asn1;
}
