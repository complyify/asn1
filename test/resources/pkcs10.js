const pkcs10 = [
  {
    tagClass: 'universal',
    encoding: 'constructed',
    type: 'sequence',
    children: [
      {
        tagClass: 'universal',
        encoding: 'constructed',
        type: 'sequence',
        children: [
          {
            tagClass: 'universal',
            encoding: 'primitive',
            type: 'integer',
            content: 0,
          },
          {
            tagClass: 'universal',
            encoding: 'constructed',
            type: 'sequence',
            children: [
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'set',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'constructed',
                    type: 'sequence',
                    children: [
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'oid',
                        content: '2.5.4.6',
                      },
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'printableString',
                        content: 'US',
                      },
                    ],
                  },
                ],
              },
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'set',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'constructed',
                    type: 'sequence',
                    children: [
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'oid',
                        content: '2.5.4.8',
                      },
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'printableString',
                        content: 'Texas',
                      },
                    ],
                  },
                ],
              },
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'set',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'constructed',
                    type: 'sequence',
                    children: [
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'oid',
                        content: '2.5.4.7',
                      },
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'printableString',
                        content: 'Dallas',
                      },
                    ],
                  },
                ],
              },
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'set',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'constructed',
                    type: 'sequence',
                    children: [
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'oid',
                        content: '2.5.4.10',
                      },
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'printableString',
                        content: 'Complyify LLC',
                      },
                    ],
                  },
                ],
              },
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'set',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'constructed',
                    type: 'sequence',
                    children: [
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'oid',
                        content: '2.5.4.11',
                      },
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'printableString',
                        content: 'Engineering',
                      },
                    ],
                  },
                ],
              },
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'set',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'constructed',
                    type: 'sequence',
                    children: [
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'oid',
                        content: '2.5.4.3',
                      },
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'printableString',
                        content: 'Test Cert for Testing Only Plz',
                      },
                    ],
                  },
                ],
              },
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'set',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'constructed',
                    type: 'sequence',
                    children: [
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'oid',
                        content: '1.2.840.113549.1.9.1',
                      },
                      {
                        tagClass: 'universal',
                        encoding: 'primitive',
                        type: 'ia5String',
                        content: 'comply@whiterabbit.wtf',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            tagClass: 'universal',
            encoding: 'constructed',
            type: 'sequence',
            children: [
              {
                tagClass: 'universal',
                encoding: 'constructed',
                type: 'sequence',
                children: [
                  {
                    tagClass: 'universal',
                    encoding: 'primitive',
                    type: 'oid',
                    content: '1.2.840.113549.1.1.1',
                  },
                  {
                    tagClass: 'universal',
                    encoding: 'primitive',
                    type: 'null',
                    content: null,
                  },
                ],
              },
              {
                tagClass: 'universal',
                encoding: 'primitive',
                type: 'bitString',
                content: Buffer.from([0, 48, 129, 137, 2, 129, 129, 0, 198, 57, 8, 195, 252, 20, 26, 233, 156, 133, 167, 72, 213, 234, 110, 82, 245, 67, 188, 241, 140, 88, 154, 75, 7, 163, 156, 129, 154, 203, 169, 61, 137, 10, 212, 75, 84, 195, 234, 149, 60, 160, 144, 92, 134, 83, 204, 204, 127, 45, 174, 51, 163, 190, 54, 247, 225, 218, 154, 244, 8, 1, 55, 160, 49, 16, 245, 224, 110, 240, 54, 169, 42, 201, 150, 114, 61, 248, 28, 94, 62, 143, 165, 97, 153, 124, 242, 207, 195, 110, 243, 101, 198, 250, 187, 151, 235, 30, 176, 41, 66, 89, 153, 248, 240, 49, 179, 33, 85, 53, 192, 253, 92, 99, 142, 127, 195, 118, 247, 87, 186, 181, 20, 207, 81, 185, 142, 183, 2, 3, 1, 0, 1]),
              },
            ],
          },
          {
            tagClass: 'context specific',
            encoding: 'constructed',
            type: 0,
            content: null,
          },
        ],
      },
      {
        tagClass: 'universal',
        encoding: 'constructed',
        type: 'sequence',
        children: [
          {
            tagClass: 'universal',
            encoding: 'primitive',
            type: 'oid',
            content: '1.2.840.113549.1.1.5',
          },
          {
            tagClass: 'universal',
            encoding: 'primitive',
            type: 'null',
            content: null,
          },
        ],
      },
      {
        tagClass: 'universal',
        encoding: 'primitive',
        type: 'bitString',
        content: Buffer.from([0, 187, 18, 116, 139, 25, 206, 106, 116, 189, 231, 118, 47, 98, 147, 148, 206, 181, 129, 144, 68, 102, 28, 5, 225, 123, 199, 227, 245, 126, 128, 89, 179, 148, 58, 104, 160, 74, 67, 102, 94, 52, 189, 43, 51, 12, 141, 82, 81, 62, 12, 54, 177, 95, 101, 140, 221, 202, 69, 103, 217, 9, 254, 56, 246, 68, 68, 179, 95, 175, 250, 164, 72, 214, 51, 24, 200, 101, 87, 106, 208, 97, 223, 23, 100, 164, 182, 8, 114, 187, 159, 114, 78, 184, 155, 27, 68, 105, 78, 205, 19, 54, 167, 105, 29, 222, 81, 210, 69, 197, 91, 104, 34, 75, 126, 45, 146, 224, 1, 109, 173, 69, 73, 129, 67, 162, 3, 210, 145]),
      },
    ],
  },
];

export default pkcs10;
