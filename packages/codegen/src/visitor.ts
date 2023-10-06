/* eslint-disable @typescript-eslint/naming-convention */
import {TsVisitor, TypeScriptOperationVariablesToObject} from '@graphql-codegen/typescript';
import {indent, type DeclarationBlock} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLEnumType,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  TypeNode,
} from 'graphql';
import {LoopbackGraphQLPluginConfig} from './config.js';
import {FIX_DECORATOR_SIGNATURE, GRAPHQL_TYPES} from './consts.js';
import {buildTypeString} from './lib/build-type-string.js';
import {formatDecoratorOptions} from './lib/format-decorator-options.js';
import {getDecoratorOptions} from './lib/get-decorator-options.js';
import {getGraphQLRequiredValue} from './lib/get-graphql-nullable-value.js';
import {parseType} from './lib/parse-type.js';
import {LoopbackGraphQLPluginParsedConfig} from './types.js';

export class LoopbackGraphQLVisitor<
  TRawConfig extends LoopbackGraphQLPluginConfig = LoopbackGraphQLPluginConfig,
  TParsedConfig extends LoopbackGraphQLPluginParsedConfig = LoopbackGraphQLPluginParsedConfig,
> extends TsVisitor<TRawConfig, TParsedConfig> {
  typescriptVisitor: TsVisitor<TRawConfig, TParsedConfig>;

  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      avoidOptionals: pluginConfig.avoidOptionals ?? false,
      maybeValue: pluginConfig.maybeValue ?? 'T | null',
      constEnums: pluginConfig.constEnums ?? false,
      enumsAsTypes: pluginConfig.enumsAsTypes ?? false,
      immutableTypes: pluginConfig.immutableTypes ?? false,
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
  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string, parent: any): string {
    if (!this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.InterfaceTypeDefinition(node, key, parent);
    }

    const interfaceDecorator = this.config.decoratorName.interface;
    const originalNode = parent[key] as InterfaceTypeDefinitionNode;

    const decoratorOptions = getDecoratorOptions(node);

    const declarationBlock = this.getInterfaceTypeDeclarationBlock(node, originalNode).withDecorator(
      `@graphql.${interfaceDecorator}(${formatDecoratorOptions(decoratorOptions)})`,
    );

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  ObjectTypeDefinition(
    node: ObjectTypeDefinitionNode,
    key: number | string,
    parent: {[key: string]: ObjectTypeDefinitionNode},
  ): string {
    const isGraphQLType = GRAPHQL_TYPES.includes(node.name as unknown as string);
    if (!isGraphQLType && !this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.ObjectTypeDefinition(node, key, parent);
    }

    const typeDecorator = this.config.decoratorName.type;
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    const decoratorOptions = getDecoratorOptions(node);

    let declarationBlock: DeclarationBlock;
    if (isGraphQLType) {
      declarationBlock = this.typescriptVisitor.getObjectTypeDeclarationBlock(node, originalNode);
    } else {
      declarationBlock = this.getObjectTypeDeclarationBlock(node, originalNode);

      // Add type-graphql ObjectType decorator
      const interfaces = originalNode?.interfaces?.map(i => this.convertName(i));
      if (interfaces && interfaces.length > 1) {
        decoratorOptions.implements = `[${interfaces.join(', ')}]`;
      } else if (interfaces && interfaces.length === 1) {
        decoratorOptions.implements = interfaces[0];
      }
      declarationBlock = declarationBlock.withDecorator(
        `@graphql.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`,
      );
    }

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    if (!this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.InputObjectTypeDefinition(node);
    }

    const typeDecorator = this.config.decoratorName.input;

    const decoratorOptions = getDecoratorOptions(node);

    let declarationBlock = this.getInputObjectDeclarationBlock(node);

    // Add type-graphql InputType decorator
    declarationBlock = declarationBlock.withDecorator(
      `@graphql.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`,
    );

    return declarationBlock.string;
  }

  InputValueDefinition(
    node: InputValueDefinitionNode,
    key?: number | string,
    parent?: unknown,
    path?: Array<string | number>,
    ancestors?: Array<TypeDefinitionNode>,
  ): string {
    const parentName = ancestors?.[ancestors.length - 1].name.value;
    if (parent && !this.hasTypeDecorators(parentName)) {
      return this.typescriptVisitor.InputValueDefinition(node, key, parent, path, ancestors);
    }

    const fieldDecorator = this.config.decoratorName.field;
    const rawType = node.type as TypeNode | string;

    const type = parseType(rawType, this.scalars);

    const decoratorOptions = getDecoratorOptions(node);

    const requiredValue = getGraphQLRequiredValue(type);
    if (requiredValue) {
      decoratorOptions.isRequired = requiredValue;
    }

    const decorator =
      '\n' +
      indent(`@graphql.${fieldDecorator}(type => ${type.type}${formatDecoratorOptions(decoratorOptions, false)})`) +
      '\n';

    const nameString = node.name.kind ? node.name.value : node.name;
    const typeString = buildTypeString(type);

    return (
      decorator +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${nameString}${type.isRequired ? '!' : '?'}: ${typeString};`,
      )
    );
  }

  FieldDefinition(
    node: FieldDefinitionNode,
    key?: number | string,
    parent?: unknown,
    path?: unknown,
    ancestors?: TypeDefinitionNode[],
  ): string {
    const parentName = ancestors?.[ancestors.length - 1].name.value;
    if (parentName && !this.hasTypeDecorators(parentName)) {
      return this.typescriptVisitor.FieldDefinition(node, key, parent);
    }

    const fieldDecorator = this.config.decoratorName.field;
    const typeString = node.type as unknown as string;

    const type = parseType(typeString, this.scalars);

    const decoratorOptions = getDecoratorOptions(node);

    if (type.isArray) {
      decoratorOptions['isArray'] = 'true';
    }

    const requiredValue = getGraphQLRequiredValue(type);
    if (requiredValue) {
      decoratorOptions.isRequired = requiredValue;
    }

    const decorator =
      '\n' +
      indent(`@graphql.${fieldDecorator}(type => ${type.type}${formatDecoratorOptions(decoratorOptions, false)})`) +
      '\n';

    // typeString = fixDecorator(type, typeString);

    return (
      decorator +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${type.isRequired ? '!' : '?'}: ${typeString};`,
      )
    );
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (!this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.EnumTypeDefinition(node);
    }

    const convertedName = this.convertName(node);
    const values = node.values?.reduce<string[]>((accum, val) => {
      const hasDescription = !!val.description;
      if (hasDescription) {
        accum.push(`{name: '${val.name}', value: '${val.name}', description: '${val.description}'}`);
      } else {
        accum.push(`'${val.name}'`);
      }
      return accum;
    }, []);

    const hasDescription = !!node.description;
    if (hasDescription) {
      return `export const ${convertedName} = graphql.Enum({name: '${convertedName}', description: '${
        node.description
      }'}, ${values?.join(', ')});\n`;
    } else {
      return `export const ${convertedName} = graphql.Enum('${convertedName}', ${values?.join(', ')});\n`;
    }
  }

  protected hasTypeDecorators(typeName?: string): boolean {
    if (typeName && GRAPHQL_TYPES.includes(typeName)) {
      return false;
    }

    if (!this.config.decorateTypes) {
      return true;
    }

    return this.config.decorateTypes.some(filter => filter === typeName);
  }

  public getWrapperDefinitions(): string[] {
    return [...super.getWrapperDefinitions(), this.getFixDecoratorDefinition()];
  }

  public getFixDecoratorDefinition(): string {
    return `${this.getExportPrefix()}${FIX_DECORATOR_SIGNATURE}`;
  }
}
