import {
  TsVisitor,
  TypeScriptPluginParsedConfig
} from '@graphql-codegen/typescript';
import {
  AvoidOptionalsConfig,
  DeclarationBlock
} from '@graphql-codegen/visitor-plugin-common';
import {
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode
} from 'graphql';
import {TypeGraphQLPluginConfig} from './config.js';

export type DecoratorConfig = {
  type: string;
  interface: string;
  field: string;
  input: string;
  arguments: string;
};

export interface TypeGraphQLPluginParsedConfig extends TypeScriptPluginParsedConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
  decoratorName: DecoratorConfig;
  decorateTypes?: string[];
}

const MAYBE_REGEX = /^Maybe<(.*?)>$/;
const ARRAY_REGEX = /^Array<(.*?)>$/;
const SCALAR_REGEX = /^Scalars\['(.*?)'\]$/;
const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];
const SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];
const TYPE_GRAPHQL_SCALARS = ['ID', 'Int', 'Float'];

interface Type {
  type: string;
  isNullable: boolean;
  isArray: boolean;
  isScalar: boolean;
  isItemsNullable: boolean;
}

function escapeString(str: string) {
  return (
    "'" +
    String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/'/g, "\\'") +
    "'"
  );
}

type DecoratorOptions = { [key: string]: string };
function formatDecoratorOptions(options: DecoratorOptions, isFirstArgument = true) {
  if (!Object.keys(options).length) {
    return '';
  }
  return (
    (isFirstArgument ? '' : ', ') +
    ('{ ' +
      Object.entries(options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') +
      ' }')
  );
}

const FIX_DECORATOR_SIGNATURE = `type FixDecorator<T> = T;`;

function getTypeGraphQLNullableValue(type: Type): string | undefined {
  if (type.isNullable) {
    if (type.isItemsNullable) {
      return "'itemsAndList'";
    }
    return 'true';
  }
  if (type.isItemsNullable) {
    return "'items'";
  }

  return undefined;
}

export class TypeGraphQLVisitor<
  TRawConfig extends TypeGraphQLPluginConfig = TypeGraphQLPluginConfig,
  TParsedConfig extends TypeGraphQLPluginParsedConfig = TypeGraphQLPluginParsedConfig,
> extends TsVisitor<TRawConfig, TParsedConfig> {
  typescriptVisitor: TsVisitor<TRawConfig, TParsedConfig>;



  protected buildArgumentsBlock(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
  ): string {
    const fieldsWithArguments =
      node.fields.filter(field => field.arguments && field.arguments.length > 0) || [];
    return fieldsWithArguments
      .map(field => {
        const name =
          node.name.value +
          (this.config.addUnderscoreToArgsType ? '_' : '') +
          this.convertName(field, {
            useTypesPrefix: false,
            useTypesSuffix: false,
          }) +
          'Args';

        if (this.hasTypeDecorators(name)) {
          return this.getArgumentsObjectTypeDefinition(node, name, field);
        }
        return this.typescriptVisitor.getArgumentsObjectTypeDefinition(node, name, field);
      })
      .join('\n\n');
  }


  getArgumentsObjectDeclarationBlock(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode,
  ): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(field.arguments.map(argument => this.InputValueDefinition(argument)).join('\n'));
  }

  getArgumentsObjectTypeDefinition(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode,
  ): string {
    const typeDecorator = this.config.decoratorName.arguments;

    let declarationBlock = this.getArgumentsObjectDeclarationBlock(node, name, field);

    // Add type-graphql Args decorator
    declarationBlock = declarationBlock.withDecorator(`@TypeGraphQL.${typeDecorator}()`);

    return declarationBlock.string;
  }



  protected clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }

    return str;
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
