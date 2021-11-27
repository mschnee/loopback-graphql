import {MethodDecoratorFactory} from '@loopback/metadata';
import {DecoratorKeys} from '../../keys';
import {getOptionsAndThunk} from '../../lib/get-options-and-thunk';
import {NameOrTypeThunk, OptionsOrThunk} from '../../types';
const debug = require('debug')('loopback:graphql:metadata:resolver:query');

export function query(nameOrTypeThunk: NameOrTypeThunk): MethodDecorator;
export function query(
  optionsOrThunk?: OptionsOrThunk<QueryDecoratorOptions>,
  nameOrTypeThunk?: NameOrTypeThunk,
): MethodDecorator {
  return function decorateMethodAsQuery(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    method?: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    debug(target, method, methodDescriptor);

    const [options, nameThunk] = getOptionsAndThunk<QueryDecoratorOptions>(optionsOrThunk, nameOrTypeThunk);

    if (method && methodDescriptor) {
      return MethodDecoratorFactory.createDecorator<QueryDecoratorSpec>(
        DecoratorKeys.QueryMethod,
        {
          nameOrTypeThunk: nameThunk,
          queryName: options?.name ?? (method.toString() as string),
          isQueryDeprecated: options?.isDeprecated ?? false,
          targetName: MethodDecoratorFactory.getTargetName(target, method, methodDescriptor),
        },
        {
          decoratorName: '@graphql.query',
        },
      )(target, method, methodDescriptor);
    } else {
      throw new Error(
        '@graphql.query() is only allowable on a class method: ' +
          MethodDecoratorFactory.getTargetName(target, method, methodDescriptor),
      );
    }
  };
}

export interface QueryDecoratorSpec {
  // this is the name of the root query
  queryName: string;
  // This is "${ClassName}.${methodName}"
  targetName: string;
  // marks the query as deprecated
  isQueryDeprecated: boolean;
  // used to determine the GraphQL type of the result.  Assumed to be `T` in `@graphql.resolver(() => T)` if unset
  nameOrTypeThunk?: NameOrTypeThunk;
}

export interface QueryDecoratorOptions {
  name?: string;
  isDeprecated?: boolean;
}
