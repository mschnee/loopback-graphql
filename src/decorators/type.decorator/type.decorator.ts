import {ClassDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';

export function type(options?: TypeDecoratorOptions) {
  return function decorateClassAsGraphqlType(target: Function) {
    return ClassDecoratorFactory.createDecorator<TypeDecoratorSpec>(
      DecoratorKeys.TypeClass,
      {
        typeName: options?.name ?? target.name,
      },
      {
        decoratorName: '@graphql.type',
      },
    )(target);
  };
}

export interface TypeDecoratorSpec {
  typeName: string;
}

export interface TypeDecoratorOptions {
  name?: string;
}
