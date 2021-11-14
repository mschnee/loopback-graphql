import {ClassDecoratorFactory} from '@loopback/metadata';

// TODO: need to pass options to provide a type name.
export function resolver() {
  return ClassDecoratorFactory.createDecorator(
    'GRAPHQL_RESOLVER_CLASS',
    {},
    {
      decoratorName: '@graphql.resolver',
    },
  );
}
