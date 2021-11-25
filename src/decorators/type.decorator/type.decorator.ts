import {ClassDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';

export function type() {
  return ClassDecoratorFactory.createDecorator(
    DecoratorKeys.TypeClass,
    {},
    {
      decoratorName: '@graphql.type',
    },
  );
}
