import {MetadataInspector} from '@loopback/metadata';
import {expect} from 'chai';
import {GraphQLString} from 'graphql';
import {field, type TypeFieldDecoratorOptions} from './field.decorator.js';
import * as DecoratorKeys from './keys.js';

describe('@graphql.query()', () => {
  it('gets the class thunk from @graphql.resolver() if unset', () => {
    function testFn() {
      class TestType {
        @field('someStringField', {type: () => GraphQLString, description: 'descritpion of a string field'})
        someField!: string;
      }
      return TestType;
    }

    const cls = testFn();
    const spec = MetadataInspector.getPropertyMetadata<TypeFieldDecoratorOptions>(
      DecoratorKeys.TypeFieldProperty,
      cls.prototype,
      'someField',
    );
    expect(spec).to.exist;
  });
});
