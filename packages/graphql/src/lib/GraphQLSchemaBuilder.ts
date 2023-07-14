import {MetadataInspector} from '@loopback/metadata';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLUnionType,
  getNamedType,
  isOutputType,
  isType,
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
  type GraphQLInputType,
  type GraphQLNamedType,
  type GraphQLOutputType,
  type GraphQLResolveInfo,
  type GraphQLSchemaConfig,
  type ThunkObjMap,
} from 'graphql';
import {type TypeFieldDecoratorMetadata} from '../decorators/field.decorator.js';
import {type InputTypeDecoratorMetadata} from '../decorators/inputType.decorator.js';
import {type ObjectTypeDecoratorMetadata} from '../decorators/objectType.decorator.js';
import {UnionTypeDecoratorMetadata} from '../decorators/unionType.decorator.js';
import {DecoratorKeys} from '../keys.js';
import {
  type Maybe,
  type NamedFieldResolverMap,
  type NamedInputMap,
  type NamedTypeMap,
  type NamedUnionMap,
} from '../types.js';

export abstract class GraphQLSchemaBuilderInterface {
  /**
   *
   * @param typeClasses this can be ALL decorated type classes: inputType, objectType, interfaceType, unionType.
   * @param resolverClasses this is all classes decorated with `@resolver()` or `@field()`
   */
  constructor(readonly typeClasses: Function[] = [], readonly resolverClasses: Function[] = []) {}
  abstract build(): GraphQLSchema;
  abstract buildNamedObjectTypes(): NamedTypeMap;
  abstract buildNamedInputTypes(): NamedInputMap;
  abstract getAllFieldSpecsForTypeByName(n: string): Array<{spec: TypeFieldDecoratorMetadata; decoratedClass: any}>;
  abstract buildFieldsThunkForInput(t: Function): ThunkObjMap<GraphQLInputFieldConfig>;
  abstract buildFieldsThunkForType(t: Function): ThunkObjMap<GraphQLFieldConfig<any, any, any>>;
  abstract buildTypeFieldForSpec(spec: TypeFieldDecoratorMetadata): GraphQLFieldConfig<any, any>;
}

export class BaseGraphQLSchemaBuilder extends GraphQLSchemaBuilderInterface {
  objectTypeCache: NamedTypeMap = {};
  inputTypeCache: NamedInputMap = {};
  unionTypeCache: NamedUnionMap = {};
  resolverCache: NamedFieldResolverMap = new Map();

  options: GraphQLSchemaConfig = {};
  buildNamedObjectTypes(): NamedTypeMap {
    this.typeClasses.forEach(t => {
      const gqlTypeDefinition = this.buildObjectType(t);
      if (gqlTypeDefinition) {
        this.objectTypeCache[gqlTypeDefinition.name] = gqlTypeDefinition;
      }
    });
    return this.objectTypeCache;
  }

  buildObjectType<TFunction extends Function>(decoratedClass: TFunction): GraphQLObjectType | null {
    const spec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
      DecoratorKeys.ObjectTypeClass,
      decoratedClass,
    );
    if (!spec) {
      return null;
    }

    return new GraphQLObjectType({
      name: spec.typeName,
      description: spec.description,
      isTypeOf: spec.isTypeOf,
      /**
       * The Schema Builder will replace this
       */
      fields: this.buildFieldsThunkForType(decoratedClass),
    });
  }

  buildNamedInputTypes(): NamedInputMap {
    return this.inputTypeCache;
  }

  buildUnionTypes(): NamedUnionMap {
    this.typeClasses.forEach(t => {
      const gqlUnionTypeDefinition = this.buildUnionType(t);
      if (gqlUnionTypeDefinition) {
        this.unionTypeCache[gqlUnionTypeDefinition.name] = gqlUnionTypeDefinition;
      }
    });
    return this.unionTypeCache;
  }

  buildUnionType<TFunction extends Function>(decoratedClass: TFunction): GraphQLUnionType | null {
    const spec = MetadataInspector.getClassMetadata<UnionTypeDecoratorMetadata<Function[]>>(
      DecoratorKeys.UnionTypeClass,
      decoratedClass,
    );
    if (!spec) {
      return null;
    }
    return new GraphQLUnionType({
      name: spec.name,
      types: () => spec.types.map(t => this.getTypeForName(t.name)).filter(t => t) as GraphQLObjectType[],
      description: spec.description,
      resolveType: spec.resolveType ?? undefined,
    });
  }

  getTypeForName(name: string): Maybe<GraphQLObjectType> {
    return this.objectTypeCache[name];
  }

  getInputForName(name: string): Maybe<GraphQLInputType> {
    return this.inputTypeCache[name];
  }

  getAllTypeNames(): string[] {
    return Array.from(
      Object.values(this.typeClasses).reduce((accum: Set<string>, t) => {
        const classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
          DecoratorKeys.ObjectTypeClass,
          t,
        );
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
        const classSpec = MetadataInspector.getClassMetadata<InputTypeDecoratorMetadata>(
          DecoratorKeys.InputTypeClass,
          t,
        );
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
  ): Array<{spec: TypeFieldDecoratorMetadata; decoratedClass: any; propertyName: string}> {
    return Object.values(this.typeClasses).reduce((accum, t) => {
      const classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
        DecoratorKeys.ObjectTypeClass,
        t,
      );
      const fieldSpecs = MetadataInspector.getAllPropertyMetadata<TypeFieldDecoratorMetadata>(
        DecoratorKeys.TypeFieldProperty,
        t.prototype,
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
    }, [] as Array<{spec: TypeFieldDecoratorMetadata; decoratedClass: any; propertyName: string}>);
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
      const classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
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
          result[spec.propertyName] = this.buildTypeFieldForSpec(spec.spec);
        }
      }

      const fieldResolverSpecs = MetadataInspector.getAllMethodMetadata<TypeFieldDecoratorMetadata>(
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

  buildTypeFieldForSpec(spec: TypeFieldDecoratorMetadata): GraphQLFieldConfig<any, any> {
    const maybeName = typeof spec.typeThunk === 'function' ? spec.typeThunk() : spec.typeThunk;
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
        Object.values(this.buildNamedObjectTypes()).map(v => getNamedType(v)),
        Object.values(this.buildNamedInputTypes()).map(v => getNamedType(v)),
        Object.values(this.buildUnionTypes()).map(v => getNamedType(v)),
      ),
    });
  }
}
