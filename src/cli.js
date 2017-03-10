#!/usr/bin/env node

import CLI, { ArgTypes } from '@complyify/cli';

import ASN1 from '.';

const options = {
  file: {
    type: ArgTypes.FILE,
    args: ['f', 'file'],
    purpose: 'file to read',
    multiple: false,
    stdin: true,
    required: true,
  },
  decodeContent: {
    type: ArgTypes.FLAG,
    args: ['decodeContent'],
    env: 'DECODE_CONTENT',
    purpose: 'decode content data',
  },
};

const { file, decodeContent, der } = CLI.parse(options);
const encoding = der ? ASN1.Encoding.DER : undefined;
const asn1Obj = ASN1.from(file, encoding, decodeContent);
process.stdout.write(JSON.stringify(asn1Obj, null, 2));
