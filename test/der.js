import ASN1 from '../src';

import {
  pkcs10DER,
  pkcs10JSON,
  rsaPrivateKeyDER,
  rsaPrivateKeyJSON,
} from './resources';

describe('DER', () => {
  let pkcs10Obj;
  let rsaPrivateKeyObj;
  describe('deserializing', () => {
    it('should deserialize a DER-encoded pkcs#10', () => {
      pkcs10Obj = ASN1.deserialize(pkcs10DER, ASN1.Encodings.DER);
      //JSON.stringify(asn1).should.equal(JSON.stringify(pkcs10JSON));
      console.log(JSON.stringify(pkcs10Obj, null, 2));
    });
    it('should deserialize a DER-encoded RSA private key', () => {
      rsaPrivateKeyObj = ASN1.deserialize(rsaPrivateKeyDER, ASN1.Encodings.DER);
      //JSON.stringify(asn1).should.equal(JSON.stringify(pkcs10JSON));
      //console.log(JSON.stringify(asn1, null, 2));
    });
  });
  describe('serializing', () => {
    it('should serialize a PKCS#10 object', () => {
      try {
        const der = ASN1.serialize(pkcs10Obj, ASN1.Encodings.DER);
      } catch (err) {
        console.error(err);
        throw err;
      }
    });
  });
});
