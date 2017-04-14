import { InvalidASN1ObjectModelError } from '.';

const Encoding = (type, value) => class {

  static get type() { return type; }
  static get value() { return value; }

};

export class Primitive extends Encoding('primitive', 0x00) { }
export class Constructed extends Encoding('constructed', 0x20) { }

const Encodings = [Primitive, Constructed];

export function findEncoding(value) {
  const valueType = typeof value;
  switch (valueType) {
    case 'string': return Encodings.find(encoding => encoding.type === value);
    case 'number': return Encodings.find(encoding => encoding.value === value);
    default: throw new InvalidASN1ObjectModelError(`Must use string or number to lookup encoding, not "${valueType}"`);
  }
}
