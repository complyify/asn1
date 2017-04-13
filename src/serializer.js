import { InvalidASN1ObjectModelError } from './errors';

function validateAOM(aom) {
  if (aom === null) throw new InvalidASN1ObjectModelError('ASN.1 object model must not be null');
  if (aom === undefined) throw new InvalidASN1ObjectModelError('ASN.1 object model must not be undefined');
  if (typeof aom !== 'object') throw new InvalidASN1ObjectModelError('ASN.1 object model must be an object');
  if (Array.isArray(aom) && aom.length < 1) throw new InvalidASN1ObjectModelError('ASN.1 object model is empty');
}

export class Serializer {

  constructor() {
    return this.serialize.bind(this);
  }

  serialize(aom, params) {
    validateAOM(aom);
    return this.serializationImpl(aom, params);
  }

}
