import {expect} from 'chai';
import {GraphQLBoolean, GraphQLInt, GraphQLSchema, printSchema} from 'graphql';
import {field} from '../decorators/field.decorator.js';
import {objectType} from '../decorators/objectType.decorator.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';
import {Union} from './Union.js';

describe('GraphQLSchemaBuilder Union()', () => {
  @objectType({name: 'BoolType'})
  class BoolType {
    @field({type: () => GraphQLBoolean, required: true, defaultValue: true})
    boolField!: boolean;
  }

  @objectType({name: 'IntType'})
  class IntType {
    @field({type: () => GraphQLInt, required: true, defaultValue: true})
    intField!: number;
  }

  it('prints two types and a union', () => {
    const UnionType = Union('MyUnion', BoolType, IntType);
    const b = new BaseGraphQLSchemaBuilder([BoolType, IntType, UnionType]);
    let schema: GraphQLSchema | undefined;
    expect(() => (schema = b.build())).to.not.throw();
    expect(schema).to.exist;
    const printedSdl = printSchema(schema!);
    expect(printedSdl).to.contain('union MyUnion = BoolType | IntType');
  });
});
