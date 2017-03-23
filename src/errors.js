import VError from 'verror';

export class ASN1Error extends VError { }
export class ASN1DeserializationError extends ASN1Error { }
export class ASN1SerializationError extends ASN1Error { }
export class InvalidASN1DataError extends ASN1Error { }
export class UnsupportedASN1DataError extends ASN1Error { }
export class DERError extends ASN1Error { }

export class IllegalContent extends ASN1Error { }
export class IllegalEncoding extends IllegalContent { }
export class UnknownTagClass extends ASN1Error { }
export class UnknownEncoding extends ASN1Error { }
export class UnknownUniversalType extends ASN1Error { }
export class UnsupportedContentLength extends ASN1Error { }
export class UnsupportedUniversalType extends ASN1Error { }
export class UnsupportedTagClass extends ASN1Error { }
