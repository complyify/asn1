import { inspect } from 'util';

import { Constructed, InvalidASN1ObjectModelError, Serializer, Type } from '.';

function jsonify(content) {
  const contentType = typeof content;
  switch (contentType) {
    case 'string': case 'number': case 'boolean': return content;
    case 'object': {
      if (Array.isArray(content)) return content.map(item => jsonify(item));
      if (Buffer.isBuffer(content)) return content.toString('base64');
      if (typeof content.toString === 'function' && !(content instanceof Type)) { return content.toString(); }
      throw new InvalidASN1ObjectModelError(`No mechanism to serialize content object: "${inspect(content)}"`);
    }
    default: throw new InvalidASN1ObjectModelError(`Illegal ASN.1 object model content type "${contentType}"`);
  }
}

export class JSONSerializer extends Serializer {
  serializationImpl(aom) {
    if (Array.isArray(aom)) return aom.map(item => this.serializationImpl(item));

    const {
      tagClass,
      type,
      encoding,
      content,
    } = aom;
    const { type: tagClassName } = tagClass;
    const { type: encodingName } = encoding;

    const serialized = {
      tagClass: tagClassName,
      type,
      encoding: encodingName,
    };

    if (content != null) {
      serialized.content = encoding.type === Constructed.type ? this.serializationImpl(content) : jsonify(content);
    }

    return serialized;
  }
}
