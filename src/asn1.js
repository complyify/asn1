import { InvalidContentError, InvalidExtensionError, UnsupportedEncodingError } from './errors';
import { Deserializer, Serializer } from '.';

const _deserializers = new WeakMap();
const _serializers = new WeakMap();

export default class ASN1 {

  static use(extension) {
    let map = null;
    if (extension == null) throw new InvalidExtensionError('extension cannot be null or undefined');
    if (extension instanceof Serializer) map = _serializers;
    if (extension instanceof Deserializer) map = _deserializers;
    if (map == null) throw new InvalidExtensionError('extension must extend Deserializer or Serializer');
    const extensions = map.get(this) || [];
    extensions.push(extension);
    map.set(this, extensions);
  }

  static deserialize(content, encoding) {
    if (encoding == null) throw new UnsupportedEncodingError('deserialization encoding must be specified');
    if (typeof encoding !== 'string') throw new UnsupportedEncodingError(`unsupported encoding: ${encoding}`);
    const deserializer = _deserializers.get(this).find(d => d.encoding === encoding);
    if (!deserializer) throw new UnsupportedEncodingError(`unsupported deserialization encoding: ${encoding}`);
    return deserializer.deserialize(content);
  }

  static serialize(content, encoding) {
    if (encoding == null) throw new UnsupportedEncodingError('serialization encoding must be specified');
    if (typeof encoding !== 'string') throw new UnsupportedEncodingError(`unsupported encoding: ${encoding}`);
    if (content == null) throw new InvalidContentError('null or undefined content cannot be serialized');
    if (typeof content !== 'object') throw new InvalidContentError('serialization content must be an ASN.1 AST');
    const serializer = _serializers.get(this).find(s => s.encoding === encoding);
    if (!serializer) throw new UnsupportedEncodingError(`unsupported serialization encoding: ${encoding}`);
    return serializer.serialize(content);
  }

}
