import {GraphQLNamedInputType, GraphQLSchema, GraphQLSchemaConfig} from 'graphql';

export function buildSchemaFromMetadata(classes: Array<Function>): GraphQLSchema {
  const config: GraphQLSchemaConfig = {
    types:
  };
  return new GraphQLSchema(config);
}

function buildInputType(type: Function): GraphQLNamedInputType {
  return {
    name: type.name
  }
}
