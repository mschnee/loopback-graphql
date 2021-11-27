import {PropertyDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';
import {getOptionsAndThunk} from '../../lib/get-options-and-thunk';
import {NameOrTypeThunk, OptionsOrThunk} from '../../types';

/**
 * M1- the field *MUST* have either a GraphQLScalar type, or be an object
 *
 * @param typeThunk
 * @returns
 */
export function field(nameOrTypeThunk: NameOrTypeThunk): MethodDecorator;
export function field(
  optionsOrThunk: OptionsOrThunk<FieldDecoratorOptions>,
  nameOrTypeThunk?: NameOrTypeThunk,
): PropertyDecorator {
  return function decoratePropertyAsGraphqlField(target: Object, property: string | symbol) {
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
