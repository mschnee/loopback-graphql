import {ClassDecoratorFactory} from '@loopback/metadata';

export function type() {
  return ClassDecoratorFactory.createDecorator(
    'GRAPHQL_OBJECT_TYPE',
    {},
    {
      decoratorName: '@graphql.type',
    },
  );
}
