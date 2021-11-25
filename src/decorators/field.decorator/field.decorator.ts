import {PropertyDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';
import {NameOrTypeThunk} from '../../types';

/**
 * M1- the field *MUST* have either a GraphQLScalar type, or be an object
 *
 * @param typeThunk
 * @returns
 */
export function field(typeThunk: NameOrTypeThunk) {
  return PropertyDecoratorFactory.createDecorator(
    DecoratorKeys.TypeFieldProperty,
    {},
    {
      decoratorName: '@graphql.field',
    },
  );
}
