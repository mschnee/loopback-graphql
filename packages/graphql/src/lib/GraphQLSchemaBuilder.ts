import {MetadataInspector} from '@loopback/metadata';
import {
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
  type GraphQLInputType,
  type GraphQLNamedType,
  GraphQLObjectType,
  type GraphQLOutputType,
  type GraphQLResolveInfo,
  GraphQLSchema,
  type GraphQLSchemaConfig,
  type ThunkObjMap,
  getNamedType,
  isOutputType,
  isType,
} from 'graphql';
import {type FieldDecoratorSpec} from '../decorators/field.decorator';
import {type InputTypeDecoratorSpec} from '../decorators/inputType.decorator';
import {type TypeDecoratorSpec} from '../decorators/objectType.decorator';
import {DecoratorKeys} from '../keys';
import {type Maybe, type NamedInputMap, type NamedTypeMap} from '../types';
import {buildObjectType} from './build-object-type';

export abstract class GraphQLSchemaBuilderInterface {
  constructor(readonly typeClasses: Function[] = [], readonly resolverClasses: Function[] = []) {}
  abstract build(): GraphQLSchema;

  abstract buildNamedTypes(): NamedTypeMap;
  abstract buildNamedInputs(): NamedInputMap;

  abstract getAllFieldSpecsForTypeByName(n: string): Array<{spec: FieldDecoratorSpec; decoratedClass: any}>;

  abstract buildFieldsThunkForInput(t: Function): ThunkObjMap<GraphQLInputFieldConfig>;
  abstract buildFieldsThunkForType(t: Function): ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
  abstract buildTypeFieldForSpec(spec: FieldDecoratorSpec): GraphQLFieldConfig<any, any>;
}

export class BaseGraphQLSchemaBuilder extends GraphQLSchemaBuilderInterface {
  typeCache: NamedTypeMap = {};
  inputCache: NamedInputMap = {};

  options: GraphQLSchemaConfig = {};
  buildNamedTypes(): NamedTypeMap {
    this.typeClasses.forEach(t => {
      const gqlTypeDefinition = buildObjectType(this.typeCache, t);
      this.typeCache[gqlTypeDefinition.name] = gqlTypeDefinition;
    });
    return this.typeCache;
  }

  buildNamedInputs(): NamedInputMap {
    return this.inputCache;
  }

  getTypeForName(name: string): Maybe<GraphQLObjectType> {
    return this.typeCache[name];
  }

  getInputForName(name: string): Maybe<GraphQLInputType> {
    return this.inputCache[name];
  }

  getAllTypeNames(): string[] {
    return Array.from(
      Object.values(this.typeClasses).reduce((accum: Set<string>, t) => {
        const classSpec = MetadataInspector.getClassMetadata<TypeDecoratorSpec>(DecoratorKeys.ObjectTypeClass, t);
        if (classSpec) {
          accum.add(classSpec.typeName);
        }
        return accum;
      }, new Set<string>()),
    );
  }

  getAllInputNames(): string[] {
    return Array.from(
      Object.values(this.resolverClasses).reduce((accum: Set<string>, t) => {
        const classSpec = MetadataInspector.getClassMetadata<InputTypeDecoratorSpec>(DecoratorKeys.InputTypeClass, t);
        if (classSpec) {
          accum.add(classSpec.typeName);
        }
        return accum;
      }, new Set<string>()),
    );
  }

  /**
   * A "type" can be split across multiple @objectType() decorated classes, using the `name` property as the identifier.
   * In order to get "all fields" of a given type by name, we need to:
   * 1. iterate over all @objectType() decorated classes, and find the one with the matching `name` property.
   * 2. collect all @field() decorated properties from that class.
   * 3. error if multiple classes define the same @field() by `name` (field name, not type name)
   *   - TODO: eventually, we may want to support multiple classes defining the same field, as this would be consistent
   *     to how graphql itself performs resolution.  However, we need to first consider things like preference order.
   * @param n
   * @returns
   */
  getAllFieldSpecsForTypeByName(
    n: string,
  ): Array<{spec: FieldDecoratorSpec; decoratedClass: any; propertyName: string}> {
    return Object.values(this.typeClasses).reduce((accum, t) => {
      const classSpec = MetadataInspector.getClassMetadata<TypeDecoratorSpec>(DecoratorKeys.ObjectTypeClass, t);
      const fieldSpecs = MetadataInspector.getAllPropertyMetadata<FieldDecoratorSpec>(
        DecoratorKeys.TypeFieldProperty,
        t,
      );
      if (classSpec?.typeName === n && fieldSpecs) {
        const allSpecs = Object.entries(fieldSpecs).map(([propertyName, spec]) => ({
          spec,
          propertyName,
          decoratedClass: t,
        }));
        return accum.concat(allSpecs);
      } else {
        return accum;
      }
    }, [] as Array<{spec: FieldDecoratorSpec; decoratedClass: any; propertyName: string}>);
  }

  buildFieldsThunkForInput(t: Function): ThunkObjMap<GraphQLInputFieldConfig> {
    return {};
  }

  /**
   * A note about fields:
   * Without trying to be proscriptive, there are two ways to write a field resolver:
   * 1. on an @objectType() decorated class, with a @field() decorated method
   * 2. on a @resolver(() > ForType) decorated class, with a @field() decorated method.
   */
  buildFieldsThunkForType<TFunction extends Function>(
    decoratedClass: TFunction,
  ): ThunkObjMap<GraphQLFieldConfig<TFunction, GraphQLResolveInfo, any>> {
    return () => {
      const result: ThunkObjMap<GraphQLFieldConfig<TFunction, GraphQLResolveInfo, any>> = {};
      const classSpec = MetadataInspector.getClassMetadata<TypeDecoratorSpec>(
        DecoratorKeys.ObjectTypeClass,
        decoratedClass,
      );
      if (!classSpec) {
        throw new Error(`No spec found for class ${decoratedClass.name}`);
      }

      /**
       * First: get the static field specs.
       */
      const fieldSpecs = this.getAllFieldSpecsForTypeByName(classSpec.typeName);

      if (fieldSpecs) {
        for (const [key, spec] of Object.entries(fieldSpecs)) {
          // find resolver for this field
          // find subscriber for this field
          // if there is a resolver, there are also args.
          result[key] = this.buildTypeFieldForSpec(spec.spec);
        }
      }

      const fieldResolverSpecs = MetadataInspector.getAllMethodMetadata<FieldDecoratorSpec>(
        DecoratorKeys.TypeFieldProperty,
        decoratedClass,
      );

      /**
       * Second: parse the resolver classes.
       * TODO
       */

      return result;
    };
  }

  buildTypeFieldForSpec(spec: FieldDecoratorSpec): GraphQLFieldConfig<any, any> {
    const maybeName = spec.nameOrTypeThunk();
    let type: Maybe<GraphQLOutputType> = undefined;
    if (typeof maybeName === 'string') {
      const gt = this.getTypeForName(maybeName);
      if (isOutputType(gt)) {
        type = gt;
      }
    } else if (isType(maybeName)) {
      type = maybeName;
    }

    if (!type) {
      throw new Error('What am I?');
    }
    return {
      type,
      description: spec.description,
      deprecationReason: spec.deprecationReason,
      // args: buildFieldArguments(cache, spec, decoratedClass, key), -- handled by @arg()
      // resolve: spec.resolve, -- handled by @fieldResolver()
      // subscribe: spec.subscribe -- handled by @fieldSubscription(),
    };
  }

  build() {
    const types: GraphQLNamedType[] = [];
    return new GraphQLSchema({
      types: types.concat(
        Object.values(this.buildNamedTypes()).map(v => getNamedType(v)),
        Object.values(this.buildNamedInputs()).map(v => getNamedType(v)),
      ),
    });
  }
}
