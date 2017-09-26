import { Universal } from '../../../src/types';

const {
  Bool,
  Integer,
  Null,
  PrintableString,
  Sequence,
} = Universal;

const sequence = new Sequence([
  new Integer(-Number.MAX_SAFE_INTEGER),
  new Integer(Number.MAX_SAFE_INTEGER),
  new Null(),
  new Bool(true),
  new PrintableString('nice marmot'),
]);

const complex = new Sequence([sequence, sequence, sequence]);

export default complex;
