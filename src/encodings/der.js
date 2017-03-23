/*
DER Encoding: https://en.wikipedia.org/wiki/X.690#DER_encoding
*/

import Debug from '@complyify/debug';
import BigInteger from 'node-biginteger';

import {
  FLAG_CONSTRUCTED,
  FLAG_LONG,
  MASK_TAG_CLASS,
  MASK_TAG_ENCODING,
  MASK_TAG_TYPE,
  MASK_LENGTH,
} from '../constants';
import * as Errors from '../errors';
import * as Types from '../types';

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
    throw new Errors.UnsupportedASN1DataError(
      'content length exceeds maximum supported of 2^32 bytes');
  }
  const lengthStartByte = lengthOctetsBytePosition + 1;
  const lengthEndByte = lengthStartByte + (lengthOctets - 1);
  debug.deserializeBinary(
    'processing %d bytes (bytes %d thru %d) to identify content length',
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
    throw new Errors.InvalidASN1DataError(
      `too few bytes to read ASN.1 length octet at byte ${lengthByte}, only ${buffer.length} bytes avaliable`);
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
    throw new Errors.InvalidASN1DataError(
      `too few bytes to read ASN.1 tag octet at byte ${byte}, only ${buffer.length} bytes avaliable`);
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
      throw new Errors.InvalidASN1DataError(
        `too few bytes to read ${contentEnd - contentStart} bytes of ASN.1 content from byte ${contentStart}, ` +
        `only ${buffer.length} bytes avaliable`);
    }
    content = buffer.slice(contentStart, contentEnd + 1);
    lastByte = contentEnd;
  }
  return { tagClass, encoding, type, content, lastByte };
}

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
  debug.serialize('encoding %s %s', tagClass.name, type.name);
  const { Primitive, Constructed } = Types.Encoding;
  if ((type.encoding.primitive && asn1Obj.encoding !== Primitive.name)
  && (type.encoding.constructed && asn1Obj.encoding !== Constructed.name)) {
    throw new Errors.DERError(`illegal encoding: "${asn1Obj.encoding}"`);
  }
  const encoding = asn1Obj.encoding === Primitive.name ? Primitive : Constructed;
  const bytes = [tagClass.value | encoding.value | type.value];
  const content = contentEncoder(asn1Obj);
  const lengthBytes = encodeLength(content.length);
  bytes.push(...lengthBytes, ...content);
  return bytes;
}

function encodeInteger(asn1Obj) {
  const { content } = asn1Obj;
  if (content == null) throw new Errors.DERError('integer content must not be null');
  if (typeof content === 'number') return [content];
  if (content instanceof BigInteger) return Array.prototype.slice.call(content.toBuffer(), 0);
  throw new Errors.DERError(`cannot encode integer from ${typeof content}`);
}

function encodeString(asn1Obj) {
  const { content } = asn1Obj;
  if (typeof content === 'string') return Array.prototype.slice.call(Buffer.from(content), 0);
  throw new Errors.DERError(`cannot encode ASCII string from ${typeof content}`);
}

// TODO revisit this function, hard to follow
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

function encodeUnsupported(asn1Obj) {
  debug.serialize('encoding unsupported type %s %s', asn1Obj.tagClass, asn1Obj.type);
  return [];
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

export const DER = {

  name: 'DER',

  fromBuffer(buffer) {
    debug.deserialize('deserializing %d bytes as DER', buffer.length);
    let byte = 0;
    const values = [];
    do {
      const { tagClass, encoding, type, content, lastByte } = tlv(buffer, byte);
      const value = { tagClass, encoding, type, content };
      if (encoding & FLAG_CONSTRUCTED && type !== Types.TagClass.Universal.types.EOC.value) {
        delete value.content;
        value.children = DER.fromBuffer(content);
      }
      values.push(value);
      byte = lastByte + 1;
    } while (byte < buffer.length);
    debug.deserialize('done deserializing DER, found %d entries', values.length);
    return values;
  },

  toByteArray(asn1Obj) {
    debug.serialize('serializing object to DER');
    const bytes = [];
    if (Array.isArray(asn1Obj)) asn1Obj.forEach(asn1SubObj => bytes.push(...DER.toByteArray(asn1SubObj)));
    else {
      switch (asn1Obj.tagClass) {
        case Types.TagClass.Universal.name: {
          bytes.push(...encodeUniversal(asn1Obj));
          break;
        }
        case Types.TagClass.Application.name: {
          bytes.push(...encodeApplication(asn1Obj));
          break;
        }
        case Types.TagClass.ContextSpecific.name: {
          bytes.push(...encodeContextSpecific(asn1Obj));
          break;
        }
        case Types.TagClass.Private.name: {
          bytes.push(...encodePrivate(asn1Obj));
          break;
        }
        default: {
          throw new Errors.DERError(`unknown tag class "${asn1Obj.tagClass}"`);
        }
      }
    }
    debug.serialize('done serializing DER, generated %d bytes', bytes.length);
    debug.serializeBinary('DER serialized as %h', Buffer.from(bytes));
    return bytes;
  },

};

function encodeChildren(asn1Obj) {
  debug.serialize('encoding children');
  const bytes = [];
  asn1Obj.children.forEach(child => bytes.push(...DER.toByteArray(child)));
  return bytes;
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
