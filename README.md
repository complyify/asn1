# @complyify/asn1

Javascript object serializer and deserializer for Abstract Syntax Notation One (ASN.1).

## Installation

`npm install @complyify/asn1`

## Usage


## Debugging

This library uses the [@complyify/debug] library for debugging. To enable debug messages, simply set the `DEBUG`
environment variable.

```shell
# enable all debugging messages in this library
DEBUG=complyify:asn1:* <your-exec-here>
# enable all debug messages except the bit twiddling messages
DEBUG=complyify:asn1:*,-complyify:asn1:*:binary <your-exec-here>
```

[@complyify/debug]: https://github.com/complyify/debug
[Overview]: ftp://ftp.rsa.com/pub/pkcs/ascii/layman.asc
[Latest ASN.1]: file:///Users/jc/Downloads/T-REC-X.680-201508-I!!PDF-E.pdf
[OID Encoding]: https://msdn.microsoft.com/en-us/library/bb540809(v=vs.85).aspx
