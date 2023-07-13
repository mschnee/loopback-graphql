import {MetadataInspector} from '@loopback/metadata';
import {expect} from 'chai';
import {GraphQLString} from 'graphql';
import {field, type TypeFieldDecoratorOptions} from './field.decorator';
import * as DecoratorKeys from './keys';

describe('@graphql.query()', () => {
  it('gets the class thunk from @graphql.resolver() if unset', () => {
    function testFn() {
      class TestType {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @field(() => GraphQLString, {name: 'someStringField'})
        someField: string;
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
