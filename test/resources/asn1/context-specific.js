import { ContextSpecific, Universal } from '../../../src/types';

const { Integer } = Universal;

const cs = new ContextSpecific(0, new Integer(42));

export default cs;
