import {TsVisitor, TypeScriptOperationVariablesToObject} from '@graphql-codegen/typescript';

import autoBind from 'auto-bind';
import {
  FieldDefinitionNode,
  GraphQLEnumType,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql';
import {LoopbackGraphQLPluginConfig} from './config.js';
import {formatDecoratorOptions} from './lib/format-decorator-options.js';
import {DecoratorOptions, LoopbackGraphQLPluginParsedConfig} from './types.js';

const MAYBE_REGEX = /^Maybe<(.*?)>$/;
const ARRAY_REGEX = /^Array<(.*?)>$/;
const SCALAR_REGEX = /^Scalars\['(.*?)'\]$/;
const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];
const SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];
const TYPE_GRAPHQL_SCALARS = ['ID', 'Int', 'Float'];

export class LoopbackGraphQLVisitor<
  TRawConfig extends LoopbackGraphQLPluginConfig = LoopbackGraphQLPluginConfig,
  TParsedConfig extends LoopbackGraphQLPluginParsedConfig = LoopbackGraphQLPluginParsedConfig,
> extends TsVisitor<TRawConfig, TParsedConfig> {
  typescriptVisitor: TsVisitor<TRawConfig, TParsedConfig>;

  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      avoidOptionals: pluginConfig.avoidOptionals || false,
      maybeValue: pluginConfig.maybeValue || 'T | null',
      constEnums: pluginConfig.constEnums || false,
      enumsAsTypes: pluginConfig.enumsAsTypes || false,
      immutableTypes: pluginConfig.immutableTypes || false,
      declarationKind: {
        type: 'class',
        interface: 'abstract class',
        arguments: 'class',
        input: 'class',
        scalar: 'type',
      },
      decoratorName: {
        type: 'objectType',
        interface: 'interfaceType',
        arguments: 'argsType',
        field: 'field',
        input: 'inputType',
        ...pluginConfig.decoratorName,
      },
      decorateTypes: pluginConfig.decorateTypes ?? undefined,
      ...additionalConfig,
    } as TParsedConfig);
    autoBind(this);

    this.typescriptVisitor = new TsVisitor(schema, pluginConfig, additionalConfig);

    const enumNames = Object.values(schema.getTypeMap())
      .map(type => (type instanceof GraphQLEnumType ? type.name : undefined))
      .filter(t => t) as string[];

    this.setArgumentsTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName,
        this.config.avoidOptionals,
        this.config.immutableTypes,
        null,
        enumNames,
        this.config.enumPrefix,
        this.config.enumSuffix,
        this.config.enumValues,
        undefined,
        undefined,
        'Maybe',
      ),
    );
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    if (!this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.InputObjectTypeDefinition(node);
    }

    const typeDecorator = this.config.decoratorName.input;

    const decoratorOptions = this.getDecoratorOptions(node);

    let declarationBlock = this.getInputObjectDeclarationBlock(node);

    // Add type-graphql InputType decorator
    declarationBlock = declarationBlock.withDecorator(
      `@graphql.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`,
    );

    return declarationBlock.string;
  }

  getDecoratorOptions(
    node:
      | ObjectTypeDefinitionNode
      | InterfaceTypeDefinitionNode
      | FieldDefinitionNode
      | InputObjectTypeDefinitionNode
      | InputValueDefinitionNode,
  ): DecoratorOptions {
    const decoratorOptions: DecoratorOptions = {};

    if (node.description) {
      // Add description as TypeGraphQL description instead of comment
      decoratorOptions.description = escapeString(node.description as unknown as string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any).description = undefined;
    }

    return decoratorOptions;
  }

  protected hasTypeDecorators(typeName: string): boolean {
    if (GRAPHQL_TYPES.includes(typeName)) {
      return false;
    }

    if (!this.config.decorateTypes) {
      return true;
    }

    return this.config.decorateTypes.some(filter => filter === typeName);
  }
}
function escapeString(arg0: string): string {
  throw new Error('Function not implemented.');
}
