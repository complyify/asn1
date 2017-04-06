import {
  Deserializer,
  InvalidJSONError,
  Primitive,
  findEncoding,
  findTagClass,
  findType,
} from '.';

function validateJSON(json, root = true) {
  if (json === null) throw new InvalidJSONError('ASN.1 abstract JSON must not be null');
  if (json === undefined) throw new InvalidJSONError('ASN.1 abstract JSON must not be undefined');
  if (typeof json !== 'object') throw new InvalidJSONError('ASN.1 abstract JSON must be an object');
  if (!Array.isArray(json) && Object.keys(json).length < 1) {
    throw new InvalidJSONError('ASN.1 abstract JSON must not be empty object');
  }
  if (root && Array.isArray(json) && json.length < 1) {
    throw new InvalidJSONError('ASN.1 abstract JSON root must not be empty array');
  }
  // TODO schema validation
}

export class JSONDeserializer extends Deserializer {

  deserializationImpl(json, root = true) {
    validateJSON(json, root);

    if (Array.isArray(json)) return json.map(item => this.deserializationImpl(item, false));

    const { tagClass: tagClassValue, encoding: encodingValue, type: typeValue, content: contentValue } = json;
    const tagClass = findTagClass(tagClassValue);
    const encoding = findEncoding(encodingValue);
    const content = encoding.type === Primitive.type ? contentValue : this.deserializationImpl(contentValue, false);
    if (typeof typeValue === 'string') {
      const Type = findType(typeValue);
      return new Type(content);
    }
    return new tagClass(typeValue, content, encoding); // eslint-disable-line new-cap
  }

}
