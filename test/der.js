import ASN1 from '../src';

import {
  pkcs10DER,
  pkcs10JSON,
  rsaPrivateKeyDER,
  rsaPrivateKeyJSON,
} from './resources';

describe('DER', () => {
  it('should parse a DER-encoded pkcs#10', () => {
    const asn1 = ASN1.from(pkcs10DER, ASN1.Encodings.DER);
    //JSON.stringify(asn1).should.equal(JSON.stringify(pkcs10JSON));
    console.log(JSON.stringify(asn1, null, 2));
  });
  it('should parse a DER-encoded RSA private key', () => {
    const asn1 = ASN1.from(rsaPrivateKeyDER, ASN1.Encodings.DER);
    //JSON.stringify(asn1).should.equal(JSON.stringify(pkcs10JSON));
    console.log(JSON.stringify(asn1, null, 2));
  });
});
