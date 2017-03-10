import Debug from 'debug';
import { find } from 'lodash';

import * as Encodings from './encodings';
import * as Errors from './errors';
import * as Types from './types';

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

function decodeContent(asn1Obj) {
  return 'decoded!';
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
