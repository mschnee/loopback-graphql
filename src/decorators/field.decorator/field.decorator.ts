import {PropertyDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';
import {getOptionsAndThunk} from '../../lib/get-options-and-thunk';
import {NameOrTypeThunk, OptionsOrThunk} from '../../types';
const debug = require('debug')('loopback:graphql:metadata:type:field');

/**
 * M1- the field *MUST* have either a GraphQLScalar type, or be an object
 *
 * @param typeThunk
 * @returns
 */
export function field(
  nameOrTypeThunk: NameOrTypeThunk,
  optionsOrThunk?: OptionsOrThunk<FieldDecoratorOptions>,
): PropertyDecorator {
  return function decoratePropertyAsGraphqlField(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    property: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    propertyDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    debug(target, property, propertyDescriptor);

    const [options, nameThunk] = getOptionsAndThunk<FieldDecoratorOptions>(optionsOrThunk, nameOrTypeThunk);
    return PropertyDecoratorFactory.createDecorator(
      DecoratorKeys.TypeFieldProperty,
      {
        nameOrTypeThunk: nameThunk,
        fieldName: options?.name ?? property.toString(),
        nullable: options?.nullable ?? false,
      },
      {
        decoratorName: '@graphql.field',
      },
    )(target, property);
  };
}

export interface FieldDecoratorSpec {
  nameOrTypeThunk: NameOrTypeThunk;
  fieldName: string;
  nullable: boolean;
}

export interface FieldDecoratorOptions {
  name?: string; // optional fieldName
  nullable?: boolean;
}
