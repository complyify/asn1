import { Universal } from '../../../src/types';

const { Integer, Sequence } = Universal;

const sequence = new Sequence([
  new Integer(Number.MAX_SAFE_INTEGER),
]);

export default sequence;
