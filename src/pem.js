/* eslint-disable class-methods-use-this */

import { DERDeserializer, DERSerializer, Deserializer, Serializer } from '.';
import { PEMDeserializationError, PEMSerializationError } from './errors';
import * as patterns from './patterns';

export function pem2der(pemString) {
  const pemParts = patterns.PEM.exec(pemString);
  if (!pemParts) throw new PEMDeserializationError('string is not PEM encoded');
  const pemBody = pemParts[patterns.results.PEM.body];
  const base64Der = pemBody.replace(/\s+/g, '');
  const der = Buffer.from(base64Der, 'base64');
  return der;
}

export function der2pem(der) {
  throw new Error('der2pem unimplemented');
}

const PEM = BaseClass => class extends BaseClass {

  constructor() {
    super('PEM');
  }

};

export class PEMDeserializer extends PEM(Deserializer) {

  constructor() {
    super();
    this.der = new DERDeserializer();
  }

  deserialize(pemString) {
    if (typeof pemString !== 'string') throw new PEMDeserializationError('can only deserialize from a string');
    const der = pem2der(pemString);
    return this.der.deserialize(der);
  }

}

export class PEMSerializer extends PEM(Serializer) {

  constructor() {
    super();
    this.der = new DERSerializer();
  }

  serialize(ast) {
    if (typeof ast !== 'object') throw new PEMSerializationError('can only serialize from an ASN.1 AST object');
    const der = this.der.serializse(ast);
    return der2pem(der);
  }

}
