import {expect} from 'chai';
import {GraphQLBoolean, GraphQLInt, GraphQLSchema, GraphQLString, printSchema} from 'graphql';
import {field} from '../decorators/field.decorator.js';
import {interfaceType} from '../decorators/interfaceType.decorator.js';
import {objectType} from '../decorators/objectType.decorator.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';

describe('GraphQLSchemaBuilder @interfaceType()', () => {
  @interfaceType({name: 'InterfaceA'})
  class InterfaceA {
    @field({type: () => GraphQLBoolean, required: true, defaultValue: true})
    boolField!: boolean;
  }
  @interfaceType({name: 'InterfaceB'})
  class InterfaceB extends InterfaceA {
    @field({type: () => GraphQLInt, required: true, defaultValue: true})
    intField!: boolean;
  }

  @objectType({name: 'ObjectC'})
  class ObjectC extends InterfaceB {
    @field({type: () => GraphQLString, required: true, defaultValue: true})
    stringField!: number;
  }

  it('prints two types and a union', () => {
    const b = new BaseGraphQLSchemaBuilder([InterfaceA, InterfaceB, ObjectC]);
    let schema: GraphQLSchema | undefined;
    expect(() => (schema = b.build())).to.not.throw();
    expect(schema).to.exist;
    const printedSdl = printSchema(schema!);
    expect(printedSdl).to.contain('interface InterfaceA {\n  boolField: Boolean!\n}\n');
    expect(printedSdl).to.contain('interface InterfaceB {\n  boolField: Boolean!\n  intField: Int!\n}\n');
    expect(printedSdl).to.contain(
      'type ObjectC implements InterfaceB & InterfaceA {\n  boolField: Boolean!\n  intField: Int!\n  stringField: String!\n}',
    );
  });
});
