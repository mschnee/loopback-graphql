import {expect} from 'chai';
import {GraphQLBoolean, GraphQLSchema, printSchema} from 'graphql';
import {field} from '../decorators/field.decorator';
import {objectType} from '../decorators/objectType.decorator';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder';

describe('GraphQLSchemaBuilder', () => {
  @objectType({name: 'MyType'})
  class SimpleType {
    @field(() => GraphQLBoolean, {nullable: true, defaultValue: true})
    boolField: boolean;
  }
  describe('.build', () => {
    it('builds a simple type', () => {
      const b = new BaseGraphQLSchemaBuilder([SimpleType]);
      let schema: GraphQLSchema | undefined;
      expect(() => (schema = b.build())).to.not.throw();
      expect(schema).to.exist;
      const printedSdl = printSchema(schema!);
      expect(printedSdl).to.contain('MyType');
    });
  });
});
