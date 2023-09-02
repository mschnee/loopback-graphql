export * from './decorators/index.js';
export {Enum} from './lib/Enum.js';
export {Union} from './lib/Union.js';

import type {GraphQLSchema, GraphQLSchemaConfig} from 'graphql';
import {BaseGraphQLSchemaBuilder} from './lib/GraphQLSchemaBuilder.js';

export function createSchema(objects: Array<Object | Function>, config?: GraphQLSchemaConfig): GraphQLSchema {
  const builder = new BaseGraphQLSchemaBuilder(objects);
  return builder.build(config);
}
