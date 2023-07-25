import {expect} from 'chai';
import {GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLSchema, GraphQLString, printSchema} from 'graphql';
import {field} from '../decorators/field.decorator.js';
import {objectType} from '../decorators/objectType.decorator.js';
import {Enum, EnumValue} from './Enum.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';

describe('GraphQLSchemaBuilder', () => {
  const ColorEnum = Enum(
    'ColorEnum',
    'RED',
    {name: 'GREEN', description: 'The color green', value: 'GREEN'},
    {name: 'BLUE', value: 3},
  );
  @objectType({name: 'MyType'})
  class SimpleType {
    @field({type: () => GraphQLBoolean, nullable: true, defaultValue: true})
    boolField!: boolean;
  }

  @objectType({name: 'MyScalarsType'})
  class MyScalersType {
    @field({type: () => GraphQLBoolean, nullable: true, defaultValue: true})
    boolField!: boolean;

    @field({type: () => GraphQLInt, nullable: true, defaultValue: 1})
    intField!: number;

    @field({type: () => GraphQLFloat, nullable: true, defaultValue: 1.0})
    floatField!: number;

    @field({type: () => GraphQLString, nullable: true, defaultValue: 'string'})
    stringField!: string;

    @field({type: () => GraphQLID, nullable: true, defaultValue: 'id'})
    idField!: string;

    @field({type: () => ColorEnum})
    enumField!: EnumValue<typeof ColorEnum>;
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
      const b = new BaseGraphQLSchemaBuilder([MyScalersType, ColorEnum]);
      let schema: GraphQLSchema | undefined = b.build();
      // expect(() => (schema = b.build())).to.not.throw();
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
