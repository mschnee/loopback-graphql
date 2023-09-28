import {expect} from 'chai';
import {buildSchema} from 'graphql';
import {plugin} from './index.js';
import {strippedString} from './lib/stripped-string.js';

describe('Codegen Enumerations', () => {
  it('should generate type-graphql enums', async () => {
    const schema = buildSchema(/* GraphQL */ `
      "custom enum"
      enum MyEnum {
        "this is a"
        A
        "this is b"
        B
        C
      }
    `);
    const result = await plugin(schema, [], {}, {outputFile: ''});

    const expectedParts = [
      `export const MyEnum = graphql.Enum({name: 'MyEnum', description: 'custom enum'}, `,
      `{name: 'A', value: 'A', description: 'this is a'}, `,
      `{name: 'B', value: 'B', description: 'this is b'}, `,
      `'C'`,
      `)`,
    ];
    expect(strippedString(result.content)).to.contain(expectedParts.join(''));
  });
});
