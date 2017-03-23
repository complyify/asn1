/*
Overview: ftp://ftp.rsa.com/pub/pkcs/ascii/layman.asc
Latest ASN.1: file:///Users/jc/Downloads/T-REC-X.680-201508-I!!PDF-E.pdf
OID Encoding: https://msdn.microsoft.com/en-us/library/bb540809(v=vs.85).aspx
*/

import Debug from '@complyify/debug';
import { find } from 'lodash';
import BigInteger from 'node-biginteger';

import * as Encodings from './encodings';
import * as Errors from './errors';
import * as Types from './types';

import { FLAG_LONG } from './constants';

const debug = {
  deserialize: Debug('complyify:asn1:deserialize'),
  serialize: Debug('complyify:asn1:serialize'),
};

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

// TODO revisit this function, hard to follow
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

function decodeASN1Object(asn1Obj) {
  debug.deserialize('decoding ASN.1 object');
  if (Array.isArray(asn1Obj)) return asn1Obj.map(o => decodeASN1Object(o));
  const decodedAsn1Obj = Object.assign({}, asn1Obj);
  decodedAsn1Obj.tagClass = decodeTagClass(decodedAsn1Obj.tagClass);
  decodedAsn1Obj.encoding = decodeEncoding(decodedAsn1Obj.encoding);
  decodedAsn1Obj.type = decodeType(decodedAsn1Obj);
  if (decodedAsn1Obj.content != null) decodedAsn1Obj.content = decodeContent(decodedAsn1Obj);
  if (decodedAsn1Obj.children) decodedAsn1Obj.children = decodeASN1Object(decodedAsn1Obj.children);
  return decodedAsn1Obj;
}

function deserialize(object, encoding, { decode = true } = {}) {
  const encodingName = encoding.name;
  debug.deserialize('deserializing object using %s encoding', encodingName);
  let asn1Obj = null;
  if (Buffer.isBuffer(object)) {
    const { fromBuffer } = encoding;
    try {
      asn1Obj = fromBuffer(object);
    } catch (err) {
      throw new Errors.ASN1DeserializationError(err, 'failed to deserialize buffer');
    }
  }
  if (asn1Obj == null) throw new Errors.ASN1DeserializationError(`can not deserialize from this ${typeof object}`);
  return decode ? decodeASN1Object(asn1Obj) : asn1Obj;
}

function serialize(object, encoding) {
  const encodingName = encoding.name;
  debug.serialize('serializing object using %s encoding', encodingName);
  let asn1ByteArray = null;
  try {
    const { toByteArray } = encoding;
    asn1ByteArray = toByteArray(object);
  } catch (err) {
    throw new Errors.ASN1SerializationError(err, 'failed to serialize object');
  }
  const buffer = Buffer.from(asn1ByteArray);
  debug.serialize('%h', buffer);
  return buffer;
}

export default {
  deserialize,
  serialize,
  Encodings,
  Errors,
  Types,
};
