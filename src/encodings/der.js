/*
DER Encoding: https://en.wikipedia.org/wiki/X.690#DER_encoding
*/

import Debug from '@complyify/debug';

import * as Errors from '../errors';
import * as Types from '../types';

const MASK_TAG_CLASS = 0b11000000;
const MASK_TAG_ENCODING = 0b00100000;
const MASK_TAG_TYPE = 0b00011111;
const MASK_LENGTH = 0b01111111;

const FLAG_CONSTRUCTED = 0b00100000;
const FLAG_LONG = 0b10000000;

const debug = {
  parse: Debug('complyify:asn1:der:parse'),
  binary: Debug('complyify:asn1:der:parse:binary'),
};

/** Parse TLV triplet for long form content byte boundaries */
function longContentBytes(buffer, tlvFirstByte) {
  const lengthOctetsBytePosition = tlvFirstByte + 1;
  debug.binary('parsing long form content length from byte %d', lengthOctetsBytePosition);
  const lengthOctetsByte = buffer[lengthOctetsBytePosition];
  debug.binary('parsing long form content length octet %b', lengthOctetsByte);
  const lengthOctets = lengthOctetsByte & MASK_LENGTH;
  debug.binary('isolated long form content length %b', lengthOctets);
  if (lengthOctets > 6) {
    throw new Errors.UnsupportedASN1DataError(
      'content length exceeds maximum supported of 2^32 bytes');
  }
  const lengthStartByte = lengthOctetsBytePosition + 1;
  const lengthEndByte = lengthStartByte + (lengthOctets - 1);
  debug.binary(
    'processing %d bytes (bytes %d thru %d) to identify content length',
    lengthOctets, lengthStartByte, lengthEndByte);
  const length = buffer.readUIntBE(lengthStartByte, lengthOctets);
  debug.parse('parsed content length of %d bytes', length);
  const startByte = lengthEndByte + 1;
  const endByte = startByte + (length - 1);
  return { startByte, endByte };
}

/** Parse TLV triplet for short form content byte boundaries */
function shortContentBytes(buffer, tlvFirstByte) {
  const lengthBytePosition = tlvFirstByte + 1;
  debug.binary('parsing short form content length from byte %d', lengthBytePosition);
  const lengthByte = buffer[lengthBytePosition];
  debug.binary('parsing short form content length octet %b', lengthByte);
  const length = lengthByte & MASK_LENGTH;
  debug.binary('isolated short form content length %b', length);
  debug.binary('parsed content length of %d bytes', length);
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
  debug.binary('parsing TLV triplet from byte %d', byte);
  const tagOctet = buffer[byte];
  if (!tagOctet) {
    throw new Errors.InvalidASN1DataError(
      `too few bytes to read ASN.1 tag octet at byte ${byte}, only ${buffer.length} bytes avaliable`);
  }
  const tagClass = tagOctet & MASK_TAG_CLASS;
  debug.parse('parsed tag class %d', tagClass);
  const encoding = tagOctet & MASK_TAG_ENCODING;
  debug.parse('parsed tag encoding %d', encoding);
  const type = tagOctet & MASK_TAG_TYPE; // TODO: support long form tag types (non-universal)
  debug.parse('parsed tag type %d', type);
  const { startByte: contentStart, endByte: contentEnd } = contentBytes(buffer, byte);
  let content = null;
  let lastByte = byte + 1; // null content type indicator in DER encoding is always 2 bytes (0x05 0x00)
  if (contentStart != null && contentEnd != null) { // if content is not null, change the aforementioned defaults
    debug.binary('isolating content from bytes %d through %d', contentStart, contentEnd);
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

export const DER = {

  name: 'DER',

  fromBuffer(buffer) {
    debug.parse('parsing %d bytes as DER', buffer.length);
    let byte = 0;
    const values = [];
    do {
      const { tagClass, encoding, type, content, lastByte } = tlv(buffer, byte);
      const value = { tagClass, encoding, type, content };
      if (encoding & FLAG_CONSTRUCTED && type !== Types.Universal.EOC.value) {
        delete value.content;
        value.children = DER.fromBuffer(content);
      }
      values.push(value);
      byte = lastByte + 1;
    } while (byte < buffer.length);
    debug.parse('done parsing DER, found %d entries', values.length);
    return values;
  },

};
