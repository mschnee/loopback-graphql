import {TypeScriptPluginParsedConfig} from '@graphql-codegen/typescript';
import {AvoidOptionalsConfig} from '@graphql-codegen/visitor-plugin-common';

export type DecoratorOptions = {[key: string]: string};
export type DecoratorConfig = {
  type: string;
  interface: string;
  field: string;
  input: string;
  arguments: string;
};

export interface LoopbackGraphQLPluginParsedConfig extends TypeScriptPluginParsedConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
  decoratorName: DecoratorConfig;
  decorateTypes?: string[];
}
