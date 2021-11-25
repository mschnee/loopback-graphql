import {MethodDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';

export interface FieldResolverOptions {
  name?: string;
}
// todo: provide an explict field name for a given type.
export function fieldResolver() {
  return MethodDecoratorFactory.createDecorator(
    DecoratorKeys.FieldResolverMethod,
    {},
    {
      decoratorName: '@graphql.fieldResolver',
    },
  );
}
