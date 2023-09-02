import {TsVisitor} from '@graphql-codegen/typescript';
import {FieldDefinitionNode, ObjectTypeDefinitionNode} from 'graphql';

export type DecoratorConfig = {
  type: string;
  interface: string;
  field: string;
  input: string;
  arguments: string;
};

export class LoopbackGraphQLVisitor extends TsVisitor {
  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: string | number, parent: any): string {}

  FieldDefinition(node: FieldDefinitionNode, key?: string | number | undefined, parent?: any): string {}
}
