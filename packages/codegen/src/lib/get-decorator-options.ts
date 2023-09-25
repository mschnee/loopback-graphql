import type {
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql';
import type {DecoratorOptions} from '../types.js';
import {escapeString} from './escape-string.js';

export function getDecoratorOptions(
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
