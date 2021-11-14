import {MethodDecoratorFactory} from '@loopback/metadata';

// TODO: need to pass options to provide a name | default to methodName.
export function query() {
  return MethodDecoratorFactory.createDecorator(
    'GRAPHQL_RESOLVER_METHOD_QUERY',
    {},
    {
      decoratorName: '@graphql.query',
    },
  );
}
