import { expect } from 'chai';
import { inspect } from 'util';

import * as resources from './resources';

import { JSONSerializer } from '../src';
import { InvalidASN1ObjectModelError } from '../src/errors';

describe('ASN1 JSON serialization', function () {

  const serialize = new JSONSerializer();

  /* should throw InvalidContentError if passed null, empty, function, or 0 */
  [undefined, null, '', [], () => {}, 0].forEach((invalidContent) => {
    const expectedErr = InvalidASN1ObjectModelError;
    it(`should throw ${expectedErr.name} when serializing ${inspect(invalidContent)}`, function () {
      const serializeInvalidContent = () => serialize(invalidContent);
      expect(serializeInvalidContent).to.throw(expectedErr);
    });
  });

  Object.keys(resources.asn1).forEach((resourceName) => {
    const resource = resources.asn1[resourceName];
    it(`should return the expected JSON when serializing ${resourceName}`, function () {
      this.timeout(5000);
      const actual = serialize(resource.object);
      const expected = resource.json;
      expect(actual).to.deep.equal(expected);
    });
  });

});
