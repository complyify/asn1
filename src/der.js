/* eslint-disable class-methods-use-this */

import Debug from '@complyify/debug';
import { find } from 'lodash';
import BigInteger from 'node-biginteger';

import { Deserializer, Serializer } from '.';

import * as Types from './types';

import {
  FLAG_CONSTRUCTED,
  FLAG_LONG,
  MASK_TAG_CLASS,
  MASK_TAG_ENCODING,
  MASK_TAG_TYPE,
  MASK_LENGTH,
} from './constants';

import { DERDeserializationError, DERSerializationError } from './errors';

const debug = {
  deserialize: Debug('complyify:asn1:der:deserialize'),
  deserializeBinary: Debug('complyify:asn1:der:deserialize:binary'),
  serialize: Debug('complyify:asn1:der:serialze'),
  serializeBinary: Debug('complyify:asn1:der:serialize:binary'),
};

/** Parse TLV triplet for long form content byte boundaries */
function longContentBytes(buffer, tlvFirstByte) {
  const lengthOctetsBytePosition = tlvFirstByte + 1;
  debug.deserializeBinary('deserializing long form content length from byte %d', lengthOctetsBytePosition);
  const lengthOctetsByte = buffer[lengthOctetsBytePosition];
  debug.deserializeBinary('deserializing long form content length octet %b', lengthOctetsByte);
  const lengthOctets = lengthOctetsByte & MASK_LENGTH;
  debug.deserializeBinary('isolated long form content length %b', lengthOctets);
  if (lengthOctets > 6) {
    throw new DERDeserializationError('content length exceeds maximum supported of 2^32 bytes');
  }
  const lengthStartByte = lengthOctetsBytePosition + 1;
  const lengthEndByte = lengthStartByte + (lengthOctets - 1);
  debug.deserializeBinary('processing %d bytes (bytes %d thru %d) to identify content length',
    lengthOctets, lengthStartByte, lengthEndByte);
  const length = buffer.readUIntBE(lengthStartByte, lengthOctets);
  debug.deserialize('deserialized content length of %d bytes', length);
  const startByte = lengthEndByte + 1;
  const endByte = startByte + (length - 1);
  return { startByte, endByte };
}

/** Parse TLV triplet for short form content byte boundaries */
function shortContentBytes(buffer, tlvFirstByte) {
  const lengthBytePosition = tlvFirstByte + 1;
  debug.deserializeBinary('deserializing short form content length from byte %d', lengthBytePosition);
  const lengthByte = buffer[lengthBytePosition];
  debug.deserializeBinary('deserializing short form content length octet %b', lengthByte);
  const length = lengthByte & MASK_LENGTH;
  debug.deserializeBinary('isolated short form content length %b', length);
  debug.deserializeBinary('deserialized content length of %d bytes', length);
  let startByte = null;
  let endByte = null;
  if (length !== 0) {
    startByte = lengthBytePosition + 1;
    endByte = startByte + (length - 1);
  }
  return { startByte, endByte };
}

/** Parse TLV triplet for content byte boundaries */
function contentBytes(buffer, tlvFirstByte) {
  const lengthByte = tlvFirstByte + 1;
  const octet = buffer[lengthByte];
  if (octet == null) {
    throw new DERDeserializationError(`no length byte at pos ${lengthByte}, only ${buffer.length} bytes avaliable`);
  }
  if (octet & FLAG_LONG) {
    return longContentBytes(buffer, tlvFirstByte);
  }
  return shortContentBytes(buffer, tlvFirstByte);
}

/** Parse TLV triplet for the metadata and content buffer */
function tlv(buffer, firstByte) {
  const byte = firstByte;
  debug.deserializeBinary('deserializing TLV triplet from byte %d', byte);
  const tagOctet = buffer[byte];
  if (!tagOctet) {
    throw new DERDeserializationError(`no type byte at pos ${byte}, only ${buffer.length} bytes avaliable`);
  }
  const tagClass = tagOctet & MASK_TAG_CLASS;
  debug.deserialize('deserialized tag class %d', tagClass);
  const encoding = tagOctet & MASK_TAG_ENCODING;
  debug.deserialize('deserialized tag encoding %d', encoding);
  const type = tagOctet & MASK_TAG_TYPE; // TODO: support long form tag types (non-universal)
  debug.deserialize('deserialized tag type %d', type);
  const { startByte: contentStart, endByte: contentEnd } = contentBytes(buffer, byte);
  let content = null;
  let lastByte = byte + 1; // null content type indicator in DER encoding is always 2 bytes (0x05 0x00)
  if (contentStart != null && contentEnd != null) { // if content is not null, change the aforementioned defaults
    debug.deserializeBinary('isolating content from bytes %d through %d', contentStart, contentEnd);
    if (contentEnd > buffer.length) {
      throw new DERDeserializationError(
        `too few bytes to read ${contentEnd - contentStart} bytes of ASN.1 content from byte ${contentStart}, ` +
        `only ${buffer.length} bytes avaliable`);
    }
    content = buffer.slice(contentStart, contentEnd + 1);
    lastByte = contentEnd;
  }
  return { tagClass, encoding, type, content, lastByte };
}

// TODO revisit this function, hard to follow, from node-forge
function encodeLength(contentLength) {
  if (contentLength < 128) return [contentLength];
  const result = [];
  let bytes = '';
  let len = contentLength;
  do {
    bytes += String.fromCharCode(len & 0xFF);
    len >>>= 8;
  } while (len > 0);
  // set first byte to # bytes used to store the length and turn on bit 8 to indicate long-form length is used
  result.push(bytes.length | FLAG_LONG);
  // concatenate length bytes in reverse since they were generated little endian and we need big endian
  for (let i = bytes.length - 1; i >= 0; --i) { // eslint-disable-line no-plusplus
    result.push(bytes.charCodeAt(i));
  }
  return result;
}

function encode(asn1Obj, tagClass, type, contentEncoder) {
  debug.serialize('encoding %s %s: %s', tagClass.name, type.name, asn1Obj.content);
  const { Primitive, Constructed } = Types.Encoding;
  if (typeof type !== 'number' && (type.encoding.primitive && asn1Obj.encoding !== Primitive.name)
    && (type.encoding.constructed && asn1Obj.encoding !== Constructed.name)) {
    throw new DERSerializationError(`illegal encoding: "${asn1Obj.encoding}"`);
  }
  const encoding = asn1Obj.encoding === Primitive.name ? Primitive : Constructed;
  const bytes = [];
  const tagClassValue = tagClass.value;
  const encodingValue = encoding.value;
  const typeValue = typeof type === 'number' ? type : type.value;
  debug.serialize('tag class: %d, encoding: %d, type: %d', tagClassValue, encodingValue, typeValue);
  bytes.push(tagClassValue + encodingValue + typeValue);
  const content = contentEncoder(asn1Obj);
  const lengthBytes = encodeLength(content.length);
  bytes.push(...lengthBytes, ...content);
  return bytes;
}

function encodeBigInteger(asn1Obj) {
  const { content } = asn1Obj;
  debug.serialize('encoding big integer: %s', content.toString());
  const contentBuffer = content.toBuffer();
  debug.serializeBinary('big integer encoded: %h', contentBuffer);
  const contentByteArray = Array.prototype.slice.call(contentBuffer, 0);
  return contentByteArray;
}

function encodeShortInteger(asn1Obj) {
  const { content } = asn1Obj;
  debug.serialize('encoding short integer: %d', content);
  let bytes = 1; // default to at least 1 byte to encode 0 value integer
  if (content > 0) { // because log2(n) / 8 + 1 is going to occassionally have rounding errors thx to float log2 oper
    bytes = 0;
    let num = content;
    while (num > 0) {
      num >>= 8;
      bytes += 1;
    }
  }
  debug.serializeBinary('will use %d bytes to encode integer %d', bytes, content);
  const buffer = new Buffer(bytes);
  buffer.writeUIntBE(content, 0, bytes);
  const contentByteArray = Array.prototype.slice.call(buffer, 0);
  return contentByteArray;
}

function encodeInteger(asn1Obj) {
  const { content } = asn1Obj;
  if (content == null) throw new DERSerializationError('integer content must not be null');
  if (typeof content === 'number') return encodeShortInteger(asn1Obj);
  if (content instanceof BigInteger) return encodeBigInteger(asn1Obj);
  throw new DERSerializationError(`cannot encode integer from ${typeof content}`);
}

function encodeString(asn1Obj) {
  const { content } = asn1Obj;
  if (typeof content === 'string') return Array.prototype.slice.call(Buffer.from(content), 0);
  throw new DERSerializationError(`cannot encode ASCII string from ${typeof content}`);
}

// TODO revisit this function, hard to follow, from node-forge
function encodeOID(asn1Obj) {
  debug.serialize('encoding OID');
  const bytes = [];
  const nodes = asn1Obj.content.split('.');
  // first byte is 40 * value1 + value2
  bytes.push((40 * parseInt(nodes[0], 10)) + parseInt(nodes[1], 10)); // first byte = first 2 OID node bullshit
  // other bytes are each value in base 128 with 8th bit set except for the last byte for each value
  for (let i = 2; i < nodes.length; ++i) { // eslint-disable-line no-plusplus
    // produce value bytes in reverse because we don't know how many bytes it will take to store the value
    let last = true;
    const valueBytes = [];
    let value = parseInt(nodes[i], 10);
    do {
      let b = value & MASK_LENGTH;
      value >>>= 7;
      if (!last) { // if value is not last, then turn on 8th bit
        b |= FLAG_LONG;
      }
      valueBytes.push(b);
      last = false;
    } while (value > 0);
    // add value bytes in reverse (needs to be in big endian)
    for (let n = valueBytes.length - 1; n >= 0; --n) { // eslint-disable-line no-plusplus
      bytes.push(valueBytes[n]);
    }
  }
  return bytes;
}

function encodeBuffer(asn1Obj) {
  const { content } = asn1Obj;
  if (content == null) return [];
  if (Buffer.isBuffer(content)) return Array.prototype.slice.call(content, 0);
  return Array.prototype.slice.call(Buffer.from(content), 0);
}

function encodeUnsupported(asn1Obj) {
  const { tagClass: tagClassName, type: typeName } = asn1Obj;
  debug.serialize('encoding unsupported type %s %s', tagClassName, typeName);
  const tagClass = Types.findTagClassByName(tagClassName);
  const type = typeof typeName === 'number' ? typeName : Types.findTypeByName(tagClass, typeName);
  return encode(asn1Obj, tagClass, type, encodeBuffer);
}

function encodeChildren(asn1Obj) {
  debug.serialize('encoding children');
  const bytes = [];
  asn1Obj.children.forEach((child) => {
    debug.serialize('encoding child:', child);
    const encodedChild = toByteArray(child); // eslint-disable-line no-use-before-define
    debug.serializeBinary('encoded child: %h', Buffer.from(encodedChild));
    bytes.push(...encodedChild);
  });
  debug.serializeBinary('encoded children: %h', Buffer.from(bytes));
  return bytes;
}

function encodeApplication(asn1Obj) {
  return encodeUnsupported(asn1Obj, Types.TagClass.Application);
}

function encodeContextSpecific(asn1Obj) {
  return encodeUnsupported(asn1Obj, Types.TagClass.ContextSpecific);
}

function encodePrivate(asn1Obj) {
  return encodeUnsupported(asn1Obj, Types.TagClass.Private);
}

function encodeUniversal(asn1Obj) {
  const { Universal } = Types.TagClass;
  switch (asn1Obj.type) {
    case Universal.types.SEQUENCE.name:
      return encode(asn1Obj, Universal, Universal.types.SEQUENCE, encodeChildren);
    case Universal.types.SET.name:
      return encode(asn1Obj, Universal, Universal.types.SET, encodeChildren);
    case Universal.types.INTEGER.name:
      return encode(asn1Obj, Universal, Universal.types.INTEGER, encodeInteger);
    case Universal.types.NULL.name:
      return encode(asn1Obj, Universal, Universal.types.NULL, () => []);
    case Universal.types.OBJECT_IDENTIFIER.name:
      return encode(asn1Obj, Universal, Universal.types.OBJECT_IDENTIFIER, encodeOID);
    case Universal.types.RELATIVE_OID.name:
      return encode(asn1Obj, Universal, Universal.types.RELATIVE_OID, encodeOID);
    case Universal.types.NumericString.name:
      return encode(asn1Obj, Universal, Universal.types.NumericString, encodeString);
    case Universal.types.PrintableString.name:
      return encode(asn1Obj, Universal, Universal.types.PrintableString, encodeString);
    case Universal.types.IA5String.name:
      return encode(asn1Obj, Universal, Universal.types.IA5String, encodeString);
    case Universal.types.Object_Descriptor.name:
      return encode(asn1Obj, Universal, Universal.types.Object_Descriptor, encodeString);
    case Universal.types.UTF8String.name:
      return encode(asn1Obj, Universal, Universal.types.UTF8String, encodeString);
    default: return encodeUnsupported(asn1Obj);
  }
}

function fromBuffer(buffer) {
  debug.deserialize('deserializing %d bytes as DER', buffer.length);
  let byte = 0;
  const values = [];
  do {
    const { tagClass, encoding, type, content, lastByte } = tlv(buffer, byte);
    const value = { tagClass, encoding, type, content };
    if (encoding & FLAG_CONSTRUCTED && type !== Types.TagClass.Universal.types.EOC.value) {
      delete value.content;
      value.children = fromBuffer(content);
    }
    values.push(value);
    byte = lastByte + 1;
  } while (byte < buffer.length);
  debug.deserialize('done deserializing DER, found %d entries', values.length);
  return values;
}

function toByteArray(ast) {
  debug.serialize('serializing object to DER');
  const bytes = [];
  if (Array.isArray(ast)) ast.forEach(asn1SubObj => bytes.push(...toByteArray(asn1SubObj)));
  else {
    switch (ast.tagClass) {
      case Types.TagClass.Universal.name: {
        bytes.push(...encodeUniversal(ast));
        break;
      }
      case Types.TagClass.Application.name: {
        bytes.push(...encodeApplication(ast));
        break;
      }
      case Types.TagClass.ContextSpecific.name: {
        bytes.push(...encodeContextSpecific(ast));
        break;
      }
      case Types.TagClass.Private.name: {
        bytes.push(...encodePrivate(ast));
        break;
      }
      default: {
        throw new DERSerializationError(`unknown tag class "${ast.tagClass}"`);
      }
    }
  }
  debug.serialize('done serializing DER, generated %d bytes', bytes.length);
  return bytes;
}

function toBuffer(ast) {
  const buffer = Buffer.from(toByteArray(ast));
  debug.serializeBinary('DER serialized as %h', buffer);
  return buffer;
}

function decodeTagClass(tagClassByte) {
  return find(Types.TagClass, tagClass => tagClass.value === tagClassByte).name;
}

function decodeEncoding(encodingByte) {
  return find(Types.Encoding, encoding => encoding.value === encodingByte).name;
}

function decodeType(asn1Obj) {
  if (asn1Obj.tagClass !== Types.TagClass.Universal.value && asn1Obj.tagClass !== Types.TagClass.Universal.name) {
    return asn1Obj.type;
  }
  return find(Types.TagClass.Universal.types, universal => universal.value === asn1Obj.type).name;
}

// TODO revisit this function, hard to follow, from node-forge
function decodeOID(buffer) {
  debug.deserialize('decoding oid');
  let b = buffer[0];
  let oid = `${Math.floor(b / 40)}.${b % 40}`; // stupid first byte = first 2 OID node encoding bullshit
  // other bytes are each value in base 128 with 8th bit set except for the last byte for each value
  let value = 0;
  let i = 1;
  while (i < buffer.length) {
    b = buffer[i];
    value <<= 7;
    if (b & FLAG_LONG) {        // not the last byte for the value
      value += b & ~FLAG_LONG;
    } else {                    // last byte
      oid += `.${value + b}`;
      value = 0;
    }
    i += 1;
  }
  debug.deserialize(`decoded OID ${oid}`);
  return oid;
}

function decodeInteger(buffer) {
  debug.deserialize('decoding integer');
  let integer = null;
  if (buffer.length <= 6) {
    integer = buffer.readUIntBE(0, buffer.length);
    debug.deserialize('decoded integer %d', integer);
  } else {
    integer = BigInteger.fromBuffer(1, buffer);
    debug.deserialize('decoded integer %s', integer);
  }
  return integer;
}

function decodeAsciiString(buffer) {
  debug.deserialize('decoding ascii string');
  const str = buffer.toString('ascii');
  debug.deserialize('decoded string "%s"', str);
  return str;
}

function decodeUTF8String(buffer) {
  debug.deserialize('decoding utf8 string');
  return buffer.toString('utf8');
}

function decodeContent(asn1Obj) {
  switch (asn1Obj.type) {
    case Types.TagClass.Universal.types.EOC.name:
    case Types.TagClass.Universal.types.NULL.name:
    case Types.TagClass.Universal.types.SEQUENCE.name:
    case Types.TagClass.Universal.types.SET.name:
      debug.deserialize('no content to decode');
      return asn1Obj.content;
    case Types.TagClass.Universal.types.NumericString.name:
    case Types.TagClass.Universal.types.PrintableString.name:
    case Types.TagClass.Universal.types.IA5String.name:
    case Types.TagClass.Universal.types.Object_Descriptor.name:
      return decodeAsciiString(asn1Obj.content);
    case Types.TagClass.Universal.types.OBJECT_IDENTIFIER.name:
    case Types.TagClass.Universal.types.RELATIVE_OID.name:
      return decodeOID(asn1Obj.content);
    case Types.TagClass.Universal.types.INTEGER.name:
      return decodeInteger(asn1Obj.content);
    case Types.TagClass.Universal.types.UTF8String.name:
      return decodeUTF8String(asn1Obj.content);
    default:
      debug.deserialize(`${asn1Obj.type} decoding unimplemented, returning raw content`);
      return asn1Obj.content;
  }
}

function decodeAST(ast) {
  debug.deserialize('decoding ASN.1 object');
  if (Array.isArray(ast)) return ast.map(o => decodeAST(o));
  const decodedAST = Object.assign({}, ast);
  decodedAST.tagClass = decodeTagClass(decodedAST.tagClass);
  decodedAST.encoding = decodeEncoding(decodedAST.encoding);
  decodedAST.type = decodeType(decodedAST);
  if (decodedAST.content != null) decodedAST.content = decodeContent(decodedAST);
  if (decodedAST.children) decodedAST.children = decodeAST(decodedAST.children);
  return decodedAST;
}

const DER = BaseClass => class extends BaseClass {

  constructor() {
    super('DER');
  }

};

export class DERDeserializer extends DER(Deserializer) {

  deserialize(buffer) {
    if (!Buffer.isBuffer(buffer)) throw new DERDeserializationError('can only deserialize from a buffer');
    return decodeAST(fromBuffer(buffer));
  }

}

export class DERSerializer extends DER(Serializer) {

  serialize(ast) {
    if (typeof ast !== 'object') throw new DERSerializationError('can only serialize from an ASN.1 AST object');
    return toBuffer(ast);
  }

}
