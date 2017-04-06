import { Universal } from '../../../src/types';

const { Set } = Universal;

function genSet(i) {
  if (i < 1) return null;
  if (i === 1) return new Set();
  return new Set([genSet(i - 1)]);
}

export default genSet(24);
