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

const FLAG_LONG = 0b10000000;

const debug = {
  parse: Debug('complyify:asn1:parse'),
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
  return find(Types.Universal, universal => universal.value === asn1Obj.type).name;
}

function decodeOID(buffer) {
  debug.parse('decoding oid');
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
  debug.parse(`decoded OID ${oid}`);
  return oid;
}

function decodeInteger(buffer) {
  debug.parse('decoding integer');
  let integer = null;
  if (buffer.length <= 6) {
    integer = buffer.readUIntBE(0, buffer.length);
    debug.parse('decoded integer %d', integer);
  } else {
    integer = BigInteger.fromBuffer(1, buffer);
    debug.parse('decoded integer %s', integer);
  }
  return integer;
}

function decodeAsciiString(buffer) {
  debug.parse('decoding ascii string');
  const str = buffer.toString('ascii');
  debug.parse('decoded string "%s"', str);
  return str;
}

function decodeUTF8String(buffer) {
  debug.parse('decoding utf8 string');
  return buffer.toString('utf8');
}

function decodeContent(asn1Obj) {
  switch (asn1Obj.type) {
    case Types.Universal.EOC.name:
    case Types.Universal.NULL.name:
    case Types.Universal.SEQUENCE.name:
    case Types.Universal.SET.name:
      debug.parse('no content to decode');
      return asn1Obj.content;
    case Types.Universal.NumericString.name:
    case Types.Universal.PrintableString.name:
    case Types.Universal.IA5String.name:
    case Types.Universal.Object_Descriptor.name:
      return decodeAsciiString(asn1Obj.content);
    case Types.Universal.OBJECT_IDENTIFIER.name:
    case Types.Universal.RELATIVE_OID.name:
      return decodeOID(asn1Obj.content);
    case Types.Universal.INTEGER.name:
      return decodeInteger(asn1Obj.content);
    case Types.Universal.UTF8String.name:
      return decodeUTF8String(asn1Obj.content);
    default:
      debug.parse(`${asn1Obj.type} decoding unimplemented, returning raw content`);
      return asn1Obj.content;
  }
}

function decodeASN1Object(asn1Obj) {
  debug.parse('decoding ASN.1 object');
  if (Array.isArray(asn1Obj)) return asn1Obj.map(o => decodeASN1Object(o));
  const decodedAsn1Obj = Object.assign({}, asn1Obj);
  decodedAsn1Obj.tagClass = decodeTagClass(decodedAsn1Obj.tagClass);
  decodedAsn1Obj.encoding = decodeEncoding(decodedAsn1Obj.encoding);
  decodedAsn1Obj.type = decodeType(decodedAsn1Obj);
  if (decodedAsn1Obj.content != null) decodedAsn1Obj.content = decodeContent(decodedAsn1Obj);
  if (decodedAsn1Obj.children) decodedAsn1Obj.children = decodeASN1Object(decodedAsn1Obj.children);
  return decodedAsn1Obj;
}

function from(object, encoding, { decode = true } = {}) {
  const encodingName = encoding.name;
  debug.parse('parsing object using %s encoding', encodingName);
  let asn1Obj = null;
  if (Buffer.isBuffer(object)) {
    const { fromBuffer } = encoding;
    if (!fromBuffer) throw new Errors.ASN1Error(`${encodingName} encoding does not support parsing from a buffer`);
    try {
      asn1Obj = fromBuffer(object);
    } catch (err) {
      throw new Errors.ASN1ParseError(err, 'failed to parse buffer');
    }
  }
  if (asn1Obj == null) throw new Errors.ASN1Error(`can not parse from this ${typeof object}`);
  return decode ? decodeASN1Object(asn1Obj) : asn1Obj;
}

export default {
  from,
  Encodings,
  Errors,
  Types,
};
