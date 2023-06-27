import {expect} from 'chai';
import {GraphQLBoolean} from 'graphql';
import {field} from '../decorators/field.decorator';
import {objectType} from '../decorators/objectType.decorator';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder';

describe('GraphQLSchemaBuilder.buildTypeMap', () => {
  @objectType({name: 'MyType'})
  class SimpleType {
    @field(() => GraphQLBoolean, {nullable: true, defaultValue: true})
    boolField: boolean;
  }

  it('builds a simple type', () => {
    const b = new BaseGraphQLSchemaBuilder([SimpleType]);
    const typeMap = b.buildNamedTypes();
    const entries = Object.entries(typeMap);
    expect(entries).to.have.lengthOf(1);
    const [name, spec] = entries[0];
    expect(name).to.equal('MyType');
    expect(spec).to.have.property('name', 'MyType');
  });
});
