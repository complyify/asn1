import { should } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';

const TYPE_BINARY = 'binary';
const TYPE_JSON = 'json';
const TYPE_UTF8 = 'utf8';

should();

function load(fileName, type) {
  const absolutePath = join(__dirname, fileName);
  const encoding = type === TYPE_BINARY ? undefined : TYPE_UTF8;
  const contents = readFileSync(absolutePath, encoding);
  return type === TYPE_JSON ? JSON.parse(contents) : contents;
}

export const pkcs10DER = load('pkcs10.der', TYPE_BINARY);
export const rsaPrivateKeyDER = load('rsa_private_key_1024.der', TYPE_BINARY);

export { default as pkcs10Obj } from './pkcs10';
