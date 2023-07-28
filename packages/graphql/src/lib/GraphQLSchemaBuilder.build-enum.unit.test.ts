import {expect} from 'chai';
import {GraphQLSchema, printSchema} from 'graphql';
import {Enum} from './Enum.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';

describe('GraphQLSchemaBuilder Enum()', () => {
  it('prints two types and a union', () => {
    const EnumType = Enum(
      'ColorEnum',
      'RED',
      {name: 'GREEN', description: 'The color green', value: 'GREEN'},
      {name: 'BLUE', value: 3},
    );

    const b = new BaseGraphQLSchemaBuilder([EnumType]);
    let schema: GraphQLSchema | undefined;
    expect(() => (schema = b.build())).to.not.throw();
    expect(schema).to.exist;
    const printedSdl = printSchema(schema!);
    const res = ['enum ColorEnum {', 'RED', '', '"""The color green"""', 'GREEN', 'BLUE', '}'];
    expect(printedSdl.split('\n').map(s => s.trim())).to.deep.equal(res);
  });
});
