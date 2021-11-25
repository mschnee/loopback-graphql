import {MetadataInspector} from '@loopback/metadata';
import {expect} from '@loopback/testlab';
import {graphql} from '../';
import {DecoratorKeys} from '../../keys';
import {ResolverDecoratorSpec} from '../resolver.decorator';

describe('@graphql.query()', () => {
  it('throws when there are no types on either the method or class', () => {
    function testFn() {
      class TestResolver {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @graphql.query(undefined as any)
        someResolver() {}
      }
      return TestResolver;
    }
    expect(testFn).to.throwError(
      '@graphql.query() requires a type parameter in either the method decorator or class decorator: TestResolver.prototype.someResolver()',
    );
  });

  it('gets the class thunk from @graphql.resolver() if unset', () => {
    const thunk = () => 'Unknown';
    function testFn() {
      @graphql.resolver(thunk)
      class TestResolver {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @graphql.query(undefined as any)
        someResolver() {}
      }
      return TestResolver;
    }

    const cls = testFn();
    const spec = MetadataInspector.getMethodMetadata<ResolverDecoratorSpec>(
      DecoratorKeys.ResolverClass,
      cls,
      'someResolver',
    );
    expect(spec).to.not.be.undefined();
    expect(spec?.nameOrTypeThunk).to.eql(thunk);
  });
});
