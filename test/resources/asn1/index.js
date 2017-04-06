import { readdirSync, readFileSync } from 'fs';
import { basename, join } from 'path';

const thisFileName = basename(__filename);
const asn1ResourceFileProcessors = [
  {
    pattern: /^(.+?)\.js$/i,
    parameter: 'object',
    process: file => require(file).default, // eslint-disable-line global-require, import/no-dynamic-require
  },
  {
    pattern: /^(.+?)\.json$/i,
    parameter: 'json',
    process: file => JSON.parse(readFileSync(file, 'utf8')),
  },
];

const asn1Resources = {};

function importASN1Resource(file) {
  asn1ResourceFileProcessors.some(({ pattern, parameter, process }) => {
    const [, fileName] = pattern.exec(file) || [];
    if (!fileName) return false;
    if (!asn1Resources[fileName]) asn1Resources[fileName] = {};
    asn1Resources[fileName][parameter] = process(join(__dirname, file));
    return true;
  });
}

readdirSync(__dirname).filter(file => file !== thisFileName).forEach(importASN1Resource);

export default asn1Resources;
