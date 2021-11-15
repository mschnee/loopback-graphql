import {ClassDecoratorFactory} from '@loopback/metadata';
import {NameOrTypeThunk} from '../types';

// TODO: need to pass options to provide a type name.
export function resolver(resolverFor: NameOrTypeThunk) {
  return ClassDecoratorFactory.createDecorator(
    'GRAPHQL_RESOLVER_CLASS',
    {},
    {
      decoratorName: '@graphql.resolver',
    },
  );
}
