import {MethodDecoratorFactory} from '@loopback/metadata';

// todo: provide an explict field name for a given type.
export function resolveField() {
  return MethodDecoratorFactory.createDecorator(
    'GRAPHQL_RESOLVER_METHOD_FIELDRESOLVER',
    {},
    {
      decoratorName: '@graphql.field',
    },
  );
}
