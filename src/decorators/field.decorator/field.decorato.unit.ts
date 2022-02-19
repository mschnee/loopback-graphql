import {MetadataInspector} from '@loopback/metadata';
import {expect} from '@loopback/testlab';
import {GraphQLString} from 'graphql';
import {graphql} from '..';
import {DecoratorKeys} from '../../keys';
import {FieldDecoratorOptions} from './field.decorator';

describe('@graphql.query()', () => {
  it('gets the class thunk from @graphql.resolver() if unset', () => {
    function testFn() {
      class TestType {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @graphql.field(() => GraphQLString, {name: 'someStringField'})
        someField: string;
      }
      return TestType;
    }

    const cls = testFn();
    const spec = MetadataInspector.getPropertyMetadata<FieldDecoratorOptions>(
      DecoratorKeys.TypeFieldProperty,
      cls.prototype,
      'someField',
    );
    expect(spec).to.not.be.undefined();
  });
});
