import {PropertyDecoratorFactory} from '@loopback/metadata';

// todo: provide an explict field name for a given type.
export function field() {
  return PropertyDecoratorFactory.createDecorator(
    'GRAPHQL_OBJECT_TYPE_PARAMETER_FIELD',
    {},
    {
      decoratorName: '@graphql.field',
    },
  );
}
