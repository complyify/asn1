import { expect } from 'chai';
import { inspect } from 'util';

import * as resources from './resources';

import { JSONDeserializer } from '../src';
import { InvalidJSONError } from '../src/errors';

describe('ASN1 JSON deserialization', function () {

  const deserialize = new JSONDeserializer();

  /* should throw InvalidContentError if passed null, empty, function, or 0 */
  [undefined, null, '', [], {}, () => {}, 0].forEach((invalidJSON) => {
    const expectedErr = InvalidJSONError;
    it(`should throw ${expectedErr.name} when deserializing ${inspect(invalidJSON)}`, function () {
      const deserializeInvalidJSON = () => deserialize(invalidJSON);
      expect(deserializeInvalidJSON).to.throw(expectedErr);
    });
  });

  Object.keys(resources.asn1).forEach((resourceName) => {
    const resource = resources.asn1[resourceName];
    it(`should return the expected ASN.1 object model when deserializing ${resourceName}`, function () {
      this.timeout(5000);
      const actual = deserialize(resource.json);
      const expected = resource.object;
      expect(actual).to.deep.equal(expected);
    });
  });

});
