import {PropertyDecoratorFactory} from '@loopback/metadata';
import debug from 'debug';
import {getOptionsAndThunk} from '../lib/get-options-and-thunk';
import {NameOrTypeThunk, OptionsOrThunk} from '../types';
import {TypeFieldProperty} from './keys';
const debugLog = debug('loopback:graphql:metadata:type:field');

/**
 * M1- the field *MUST* have either a GraphQLScalar type, or be a class decorated with @graphql.objectType()/@graphql.inputType()
 *
 * @param typeThunk
 * @returns
 */
export function field(
  nameOrTypeThunk: NameOrTypeThunk,
  optionsOrThunk?: OptionsOrThunk<FieldDecoratorOptions>,
): PropertyDecorator {
  return function decoratePropertyAsGraphqlField(target, property, propertyDescriptor?: TypedPropertyDescriptor<any>) {
    debugLog(target, property, propertyDescriptor);

    const [options, nameThunk] = getOptionsAndThunk<FieldDecoratorOptions>(optionsOrThunk, nameOrTypeThunk);
    return PropertyDecoratorFactory.createDecorator(
      TypeFieldProperty,
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
