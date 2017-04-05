import VError from 'verror';

export class ASN1Error extends VError { }

export class ContentError extends ASN1Error { }
export class InvalidContentError extends ContentError { }

export class EncodingError extends ASN1Error { }
export class UnsupportedEncodingError extends EncodingError { }

export class ExtensionError extends ASN1Error { }
export class InvalidExtensionError extends ExtensionError { }

export class DeserializationError extends ASN1Error { }
export class DERDeserializationError extends DeserializationError { }
export class PEMDeserializationError extends DeserializationError { }

export class SerializationError extends ASN1Error { }
export class DERSerializationError extends SerializationError { }
export class PEMSerializationError extends SerializationError { }
