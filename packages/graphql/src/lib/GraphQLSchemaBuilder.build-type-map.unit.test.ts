import {expect} from 'chai';
import {GraphQLBoolean} from 'graphql';
import {field} from '../decorators/field.decorator.js';
import {objectType} from '../decorators/objectType.decorator.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';

describe('GraphQLSchemaBuilder.buildTypeMap', () => {
  @objectType({name: 'MyType'})
  class SimpleType {
    @field({type: () => GraphQLBoolean, required: true, defaultValue: true})
    boolField!: boolean;
  }

  it('builds a simple type', () => {
    const b = new BaseGraphQLSchemaBuilder([SimpleType]);
    const typeMap = b.buildNamedObjectTypes();
    const entries = Object.entries(typeMap);
    expect(entries).to.have.lengthOf(1);
    const [name, spec] = entries[0];
    expect(name).to.equal('MyType');
    expect(spec).to.have.property('name', 'MyType');
  });
});
