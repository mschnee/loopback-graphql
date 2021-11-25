import {ClassDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';
import {NameOrTypeThunk} from '../../types';

// TODO: need to pass options to provide a type name.
export function resolver(typeThunk: NameOrTypeThunk) {
  return ClassDecoratorFactory.createDecorator<ResolverDecoratorSpec>(
    DecoratorKeys.ResolverClass,
    {
      nameOrTypeThunk: typeThunk,
    },
    {
      decoratorName: '@graphql.resolver',
    },
  );
}

export interface ResolverDecoratorSpec {
  // used to determine the GraphQL type of the result.  Assumed to be `T` in `@graphql.resolver(() => T)` if unset
  nameOrTypeThunk: NameOrTypeThunk;
}
