import BigInteger from 'node-biginteger';

import { Universal } from '../../../src/types';

const { Integer, Sequence } = Universal;

const bigIntegerBuffer = Buffer.alloc(256); // Big Papi wants a biiiiig domincan integer
bigIntegerBuffer.fill(0x42);
const bigInteger = BigInteger.fromBuffer(1, bigIntegerBuffer);

const sequence = new Sequence([
  new Integer(bigInteger),
]);

export default sequence;
