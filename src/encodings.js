const Encoding = (type, value) => class {

  static get type() { return type; }
  static get value() { return value; }

};

export class Primitive extends Encoding('primitive', 0x00) { }
export class Constructed extends Encoding('constructed', 0x20) { }

export function findEncoding(value) {
  return [Primitive, Constructed].find(encoding => encoding.type === value);
}
