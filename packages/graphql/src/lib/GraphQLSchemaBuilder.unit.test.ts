import {expect} from 'chai';
import {GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLSchema, GraphQLString, printSchema} from 'graphql';
import {field} from '../decorators/field.decorator.js';
import {objectType} from '../decorators/objectType.decorator.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';

describe('GraphQLSchemaBuilder', () => {
  @objectType({name: 'MyType'})
  class SimpleType {
    @field(() => GraphQLBoolean, {nullable: true, defaultValue: true})
    boolField!: boolean;
  }

  @objectType({name: 'MyScalarsType'})
  class MyScalersType {
    @field(() => GraphQLBoolean, {nullable: true, defaultValue: true})
    boolField!: boolean;

    @field(() => GraphQLInt, {nullable: true, defaultValue: 1})
    intField!: number;

    @field(() => GraphQLFloat, {nullable: true, defaultValue: 1.0})
    floatField!: number;

    @field(() => GraphQLString, {nullable: true, defaultValue: 'string'})
    stringField!: string;

    @field(() => GraphQLID, {nullable: true, defaultValue: 'id'})
    idField!: string;
  }

  describe('.build', () => {
    it('builds a simple type', () => {
      const b = new BaseGraphQLSchemaBuilder([SimpleType]);
      let schema: GraphQLSchema | undefined;
      expect(() => (schema = b.build())).to.not.throw();
      expect(schema).to.exist;
      const printedSdl = printSchema(schema!);
      expect(printedSdl).to.contain('type MyType {');
      expect(printedSdl).to.contain('boolField: Boolean');
    });

    it('builds a type with all scalars', () => {
      const b = new BaseGraphQLSchemaBuilder([MyScalersType]);
      let schema: GraphQLSchema | undefined;
      expect(() => (schema = b.build())).to.not.throw();
      expect(schema).to.exist;
      const printedSdl = printSchema(schema!);
      expect(printedSdl).to.contain('type MyScalarsType {');
      expect(printedSdl).to.contain('boolField: Boolean');
      expect(printedSdl).to.contain('intField: Int');
      expect(printedSdl).to.contain('floatField: Float');
      expect(printedSdl).to.contain('stringField: String');
      expect(printedSdl).to.contain('idField: ID');
    });
  });
});
