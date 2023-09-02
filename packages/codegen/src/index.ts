import {PluginFunction, Types, getCachedDocumentNodeFromSchema, oldVisit} from '@graphql-codegen/plugin-helpers';
import {TsIntrospectionVisitor, includeIntrospectionTypesDefinitions} from '@graphql-codegen/typescript';
import {GraphQLSchema} from 'graphql';
import {LoopbackGraphQLPluginConfig} from './config.js';
import {LoopbackGraphQLVisitor} from './visitor.js';

export * from './visitor.js';

const LB_GRAPHQL_IMPORT = `import * as graphql from '@mschnee/loopback-graphql';`;
const isDefinitionInterface = (definition: string) => definition.includes('@graphql.interfaceType()');

export const plugin: PluginFunction<LoopbackGraphQLPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: LoopbackGraphQLPluginConfig,
) => {
  const visitor = new LoopbackGraphQLVisitor(schema, config);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = oldVisit(astNode, {leave: visitor});
  const introspectionDefinitions = includeIntrospectionTypesDefinitions(schema, documents, config);
  const scalars = visitor.scalarsDefinition;

  const {definitions} = visitorResult;
  // Sort output by interfaces first, classes last to prevent TypeScript errors
  definitions.sort(
    (definition1, definition2) => +isDefinitionInterface(definition2) - +isDefinitionInterface(definition1),
  );

  return {
    prepend: [...visitor.getEnumsImports(), ...visitor.getWrapperDefinitions(), LB_GRAPHQL_IMPORT],
    content: [scalars, ...definitions, ...introspectionDefinitions].join('\n'),
  };
};

export {TsIntrospectionVisitor};
