import {ClassDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';

export function type(options?: TypeDecoratorOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function decorateClassAsGraphqlType(target: any) {
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
