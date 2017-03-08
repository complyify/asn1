import { readFileSync } from 'fs';
import { join } from 'path';

import { DER } from '../src';

describe('der', () => {
  it('should do shit', () => {
    const file = readFileSync(join(__dirname, 'resources/pkcs10.der'));
    //const file = readFileSync(join(__dirname, 'resources/rsa_private_key_1024.der'));
    const asn1 = DER.parse(file);
    console.log('-------------- RESULT --------------');
    console.log(JSON.stringify(asn1, null, 2));
  });
});
