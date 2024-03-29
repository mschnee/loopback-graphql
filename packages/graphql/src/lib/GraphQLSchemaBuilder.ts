import {MetadataInspector, Reflector} from '@loopback/metadata';
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLUnionType,
  getNamedType,
  isOutputType,
  isScalarType,
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
  type GraphQLInputType,
  type GraphQLNamedType,
  type GraphQLOutputType,
  type GraphQLSchemaConfig,
  type ThunkObjMap,
} from 'graphql';
import {type TypeFieldDecoratorMetadata} from '../decorators/field.decorator.js';
import {type InputTypeDecoratorMetadata} from '../decorators/inputType.decorator.js';
import {InterfaceTypeDecoratorMetadata} from '../decorators/interfaceType.decorator.js';
import {type ObjectTypeDecoratorMetadata} from '../decorators/objectType.decorator.js';
import {UnionTypeDecoratorMetadata} from '../decorators/unionType.decorator.js';
import {DecoratorKeys} from '../keys.js';
import {
  NamedEnumMap,
  NamedInterfaceType,
  type Maybe,
  type NamedFieldResolverMap,
  type NamedInputMap,
  type NamedObjectTypeMap,
  type NamedUnionMap,
} from '../types.js';

type FieldSpec = {spec: TypeFieldDecoratorMetadata; decoratedClass: unknown; propertyName: string};
export abstract class GraphQLSchemaBuilderInterface {
  /**
   *
   * @param typeClasses this can be ALL decorated type classes: inputType, objectType, interfaceType, unionType.
   * @param resolverClasses this is all classes decorated with `@resolver()` or `@field()`
   */
  constructor(readonly typeClasses: Array<Function | Object> = []) {}
  abstract build(): GraphQLSchema;
  abstract buildNamedObjectTypes(): NamedObjectTypeMap;
  abstract buildNamedInputTypes(): NamedInputMap;
  abstract getAllFieldSpecsForTypeByName(n: string): FieldSpec[];
  abstract buildFieldsThunkForInput(t: Function): ThunkObjMap<GraphQLInputFieldConfig>;
  abstract buildFieldsThunkForType(t: Function): ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>>;
  abstract buildTypeFieldForSpec(spec: TypeFieldDecoratorMetadata): GraphQLFieldConfig<unknown, unknown>;
}

export class BaseGraphQLSchemaBuilder extends GraphQLSchemaBuilderInterface {
  objectTypeCache: NamedObjectTypeMap = {};
  inputTypeCache: NamedInputMap = {};
  interfaceTypeCache: NamedInterfaceType = {};
  unionTypeCache: NamedUnionMap = {};
  resolverCache: NamedFieldResolverMap = new Map();
  enumTypeCache: NamedEnumMap = {};

  options: GraphQLSchemaConfig = {};
  buildNamedObjectTypes(): NamedObjectTypeMap {
    this.typeClasses.forEach(t => {
      const gqlTypeDefinition = this.buildObjectType(t as Function);
      if (gqlTypeDefinition) {
        this.objectTypeCache[gqlTypeDefinition.name] = gqlTypeDefinition;
      }
    });
    return this.objectTypeCache;
  }

  lookupInterfacesForClass<TFunction extends Function>(decoratedClass: TFunction): readonly GraphQLInterfaceType[] {
    let currentPrototype = Object.getPrototypeOf(decoratedClass);
    const allInterfaces: GraphQLInterfaceType[] = [];
    while (currentPrototype) {
      const metadata = MetadataInspector.getClassMetadata<InterfaceTypeDecoratorMetadata>(
        DecoratorKeys.InterfaceTypeClass,
        currentPrototype,
      );

      if (metadata) {
        const interfaceType = this.getInterfaceForName(metadata.typeName);
        if (interfaceType) {
          allInterfaces.push(interfaceType);
        }
      }

      currentPrototype = Object.getPrototypeOf(currentPrototype);
    }
    return allInterfaces;
  }

  buildObjectType<TFunction extends Function>(decoratedClass: TFunction): GraphQLObjectType | null {
    const spec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
      DecoratorKeys.ObjectTypeClass,
      decoratedClass,
      {
        ownMetadataOnly: true,
      },
    );
    if (!spec) {
      return null;
    }

    return new GraphQLObjectType({
      name: spec.typeName,
      description: spec.description,
      isTypeOf: spec.isTypeOf,
      interfaces: this.lookupInterfacesForClass.bind(this, decoratedClass),
      /**
       * The Schema Builder will replace this
       */
      fields: this.buildFieldsThunkForType(decoratedClass),
    });
  }

  buildNamedInterfaceTypes(): NamedInterfaceType {
    this.typeClasses.forEach(t => {
      const gqlTypeDefinition = this.buildInterfaceType(t as Function);
      if (gqlTypeDefinition) {
        this.interfaceTypeCache[gqlTypeDefinition.name] = gqlTypeDefinition;
      }
    });
    return this.interfaceTypeCache;
  }
  buildInterfaceType<TFunction extends Function>(decoratedClass: TFunction): GraphQLInterfaceType | null {
    const spec = MetadataInspector.getClassMetadata<InterfaceTypeDecoratorMetadata>(
      DecoratorKeys.InterfaceTypeClass,
      decoratedClass,
      {
        ownMetadataOnly: true,
      },
    );
    if (!spec) {
      return null;
    }

    return new GraphQLInterfaceType({
      name: spec.typeName,
      description: spec.description,

      /**
       * The Schema Builder will replace this
       */
      fields: this.buildFieldsThunkForInterface(decoratedClass),
    });
  }

  /**
   * According to the GraphQL spec, input types can only be made up of scalar fields.
   *
   * This makes the code path look similar to the regular named output types, but
   * they are fundamentally different. Making the code DRY results in
   * a significant increase in complexity.
   *
   * A significant refactor is expected in 2.0.0, after the library has been
   * completed and proven stable.
   * @returns
   */
  buildNamedInputTypes(): NamedInputMap {
    this.typeClasses.forEach(t => {
      const gqlTypeDefinition = this.buildInputType(t as Function);
      if (gqlTypeDefinition) {
        this.inputTypeCache[gqlTypeDefinition.name] = gqlTypeDefinition;
      }
    });
    return this.inputTypeCache;
  }

  buildInputType<TFunction extends Function>(decoratedClass: TFunction): GraphQLInputObjectType | null {
    const spec = MetadataInspector.getClassMetadata<InputTypeDecoratorMetadata>(
      DecoratorKeys.InputTypeClass,
      decoratedClass,
      {
        ownMetadataOnly: true,
      },
    );
    if (!spec) {
      return null;
    }
    return new GraphQLInputObjectType({
      name: spec.typeName,
      description: spec.description,
      fields: this.buildFieldsThunkForInputType(decoratedClass),
    });
  }
  buildFieldsThunkForInputType<TFunction extends Function>(
    decoratedClass: TFunction,
  ): ThunkObjMap<GraphQLInputFieldConfig> {
    return () => {
      const result: ThunkObjMap<GraphQLInputFieldConfig> = {};
      const classSpec = MetadataInspector.getClassMetadata<InputTypeDecoratorMetadata>(
        DecoratorKeys.InputTypeClass,
        decoratedClass,
        {
          ownMetadataOnly: true,
        },
      );
      if (!classSpec) {
        throw new Error(`No spec found for class ${decoratedClass.name}`);
      }
      /**
       * First: get the static field specs.
       */
      const fieldSpecs = this.getAllFieldSpecsForInputTypeByName(classSpec.typeName);

      if (fieldSpecs) {
        for (const [, spec] of Object.entries(fieldSpecs)) {
          // find resolver for this field
          // find subscriber for this field
          // if there is a resolver, there are also args.
          result[spec.propertyName] = this.buildInputTypeFieldForSpec(spec.spec);
        }
      }

      return result;
    };
  }

  buildInputTypeFieldForSpec(spec: TypeFieldDecoratorMetadata): GraphQLInputFieldConfig {
    const maybeScalar = typeof spec.typeThunk === 'function' ? spec.typeThunk() : spec.typeThunk;
    let type: Maybe<GraphQLInputType> = undefined;
    // input fields must be scalars

    if (isScalarType(maybeScalar)) {
      type = maybeScalar;
    }

    if (!type) {
      const enumSpec = Reflector.getMetadata(DecoratorKeys.EnumObjectClass, maybeScalar);
      if (enumSpec) {
        type = this.getEnumForName(enumSpec.name);
      }
    }

    if (!type) {
      throw new Error('Input Fields must be GraphQLScalars or Enumerations');
    }

    type = spec.required ? new GraphQLNonNull(type) : type;
    type = spec.array ? new GraphQLList(type) : type;

    return {
      type,
      description: spec.description,
      deprecationReason: spec.deprecationReason,
    };
  }

  buildUnionTypes(): NamedUnionMap {
    this.typeClasses.forEach(t => {
      const gqlUnionTypeDefinition = this.buildUnionType(t as Function);
      if (gqlUnionTypeDefinition) {
        this.unionTypeCache[gqlUnionTypeDefinition.name] = gqlUnionTypeDefinition;
      }
    });
    return this.unionTypeCache;
  }

  buildEnumTypes(): NamedEnumMap {
    this.typeClasses.forEach(t => {
      const gqlEnumTypeDefinition = this.buildEnumType(t);
      if (gqlEnumTypeDefinition) {
        this.enumTypeCache[gqlEnumTypeDefinition.name] = gqlEnumTypeDefinition;
      }
    });
    return this.enumTypeCache;
  }

  buildEnumType<T extends Object>(objectWithMetadata: T): GraphQLEnumType | null {
    const spec = Reflector.getMetadata(DecoratorKeys.EnumObjectClass, objectWithMetadata);
    if (!spec) {
      return null;
    } else {
      return new GraphQLEnumType(spec);
    }
  }

  buildUnionType<TFunction extends Function>(decoratedClass: TFunction): GraphQLUnionType | null {
    const spec = MetadataInspector.getClassMetadata<UnionTypeDecoratorMetadata<Function[]>>(
      DecoratorKeys.UnionTypeClass,
      decoratedClass,
      {
        ownMetadataOnly: true,
      },
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

  getTypeForName(name: string): Maybe<GraphQLOutputType> {
    return this.objectTypeCache[name];
  }

  getInputForName(name: string): Maybe<GraphQLInputType> {
    return this.inputTypeCache[name];
  }

  getEnumForName(name: string): Maybe<GraphQLEnumType> {
    return this.enumTypeCache[name];
  }

  getInterfaceForName(name: string): Maybe<GraphQLInterfaceType> {
    return this.interfaceTypeCache[name];
  }

  getAllInputNames(): string[] {
    return Array.from(
      Object.values(this.typeClasses).reduce((accum: Set<string>, t) => {
        const classSpec = MetadataInspector.getClassMetadata<InputTypeDecoratorMetadata>(
          DecoratorKeys.InputTypeClass,
          t as Function,
        );
        if (classSpec) {
          accum.add(classSpec.typeName);
        }
        return accum;
      }, new Set<string>()),
    );
  }

  getAllFieldsSpecsForInterfaceByName(n: string): FieldSpec[] {
    return Object.values(this.typeClasses).reduce<FieldSpec[]>((accum, t) => {
      const classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
        DecoratorKeys.InterfaceTypeClass,
        t as Function,
        {
          ownMetadataOnly: true,
        },
      );

      if (!(t as Function).prototype) {
        return accum;
      }

      const fieldSpecs = MetadataInspector.getAllPropertyMetadata<TypeFieldDecoratorMetadata>(
        DecoratorKeys.TypeFieldProperty,
        (t as Function).prototype,
        {
          ownMetadataOnly: true,
        },
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
    }, [] as FieldSpec[]);
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
  getAllFieldSpecsForTypeByName(n: string): FieldSpec[] {
    return Object.values(this.typeClasses).reduce<FieldSpec[]>((accum, t) => {
      const classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
        DecoratorKeys.ObjectTypeClass,
        t as Function,
        {
          ownMetadataOnly: true,
        },
      );
      if (!(t as Function).prototype) {
        return accum;
      }

      const fieldSpecs = MetadataInspector.getAllPropertyMetadata<TypeFieldDecoratorMetadata>(
        DecoratorKeys.TypeFieldProperty,
        (t as Function).prototype,
        {
          ownMetadataOnly: true,
        },
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
    }, [] as FieldSpec[]);
  }

  getAllFieldSpecsForInputTypeByName(n: string): FieldSpec[] {
    return Object.values(this.typeClasses).reduce<FieldSpec[]>((accum, t) => {
      const classSpec = MetadataInspector.getClassMetadata<InputTypeDecoratorMetadata>(
        DecoratorKeys.InputTypeClass,
        t as Function,
        {
          ownMetadataOnly: true,
        },
      );
      if (!(t as Function).prototype) {
        return accum;
      }

      const fieldSpecs = MetadataInspector.getAllPropertyMetadata<TypeFieldDecoratorMetadata>(
        DecoratorKeys.TypeFieldProperty,
        (t as Function).prototype,
        {
          ownMetadataOnly: true,
        },
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
    }, [] as FieldSpec[]);
  }

  buildFieldsThunkForInput(t: Function): ThunkObjMap<GraphQLInputFieldConfig> {
    return {};
  }

  buildFieldsThunkForInterface<TFunction extends Function>(
    decoratedClass: TFunction,
  ): ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>> {
    return () => {
      const result: ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>> = {};

      const classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
        DecoratorKeys.InterfaceTypeClass,
        decoratedClass,
        {
          ownMetadataOnly: true,
        },
      );
      if (!classSpec) {
        throw new Error(`No spec found for class ${decoratedClass.name}`);
      }

      /**
       * First: get the static field specs.
       */
      const fieldSpecs = this.getAllFieldsSpecsForInterfaceByName(classSpec.typeName);

      if (fieldSpecs) {
        for (const [, spec] of Object.entries(fieldSpecs)) {
          // find resolver for this field
          // find subscriber for this field
          // if there is a resolver, there are also args.
          result[spec.propertyName] = this.buildTypeFieldForSpec(spec.spec);
        }
      }

      return result;
    };
  }
  /**
   * A note about fields:
   * Without trying to be proscriptive, there are two ways to write a field resolver:
   * 1. on an @objectType() decorated class, with a @field() decorated method
   * 2. on a @resolver(() > ForType) decorated class, with a @field() decorated method.
   */
  buildFieldsThunkForType<TFunction extends Function>(
    decoratedClass: TFunction,
  ): ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>> {
    return () => {
      const result: ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>> = {};
      let classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
        DecoratorKeys.ObjectTypeClass,
        decoratedClass,
        {
          ownMetadataOnly: true,
        },
      );
      if (!classSpec) {
        classSpec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
          DecoratorKeys.InterfaceTypeClass,
          decoratedClass,
          {
            ownMetadataOnly: true,
          },
        );
      }
      if (!classSpec) {
        throw new Error(`No spec found for class ${decoratedClass.name}`);
      }

      /**
       * First: get the static field specs.
       */
      const fieldSpecs = this.getAllFieldSpecsForTypeByName(classSpec.typeName);

      if (fieldSpecs) {
        for (const [, spec] of Object.entries(fieldSpecs)) {
          // find resolver for this field
          // find subscriber for this field
          // if there is a resolver, there are also args.
          result[spec.propertyName] = this.buildTypeFieldForSpec(spec.spec);
        }
      }

      // const fieldResolverSpecs = MetadataInspector.getAllMethodMetadata<TypeFieldDecoratorMetadata>(
      //   DecoratorKeys.TypeFieldProperty,
      //   decoratedClass,
      //   {
      //     ownMetadataOnly: true,
      //   },
      // );

      /**
       * Second: parse the resolver classes.
       * TODO
       */

      return result;
    };
  }

  buildTypeFieldForSpec(spec: TypeFieldDecoratorMetadata): GraphQLFieldConfig<unknown, unknown, unknown> {
    const maybeName = typeof spec.typeThunk === 'function' ? spec.typeThunk() : spec.typeThunk;
    let type: Maybe<GraphQLOutputType> = undefined;
    if (typeof maybeName === 'function' && 'name' in maybeName) {
      const gt = this.getTypeForName(maybeName.name);
      if (isOutputType(gt)) {
        type = gt;
      }
    } else if (typeof maybeName === 'string') {
      const gt = this.getTypeForName(maybeName);
      if (isOutputType(gt)) {
        type = gt;
      }
    } else if (isOutputType(maybeName)) {
      type = maybeName;
    }

    if (!type) {
      const enumSpec = Reflector.getMetadata(DecoratorKeys.EnumObjectClass, maybeName);
      if (enumSpec) {
        type = this.getEnumForName(enumSpec.name);
      }
    }

    if (!type) {
      throw new Error('What am I?');
    }
    type = spec.required ? new GraphQLNonNull(type) : type;
    type = spec.array ? new GraphQLList(type) : type;

    return {
      type,
      description: spec.description,
      deprecationReason: spec.deprecationReason,
      // args: buildFieldArguments(cache, spec, decoratedClass, key), -- handled by @arg()
      // resolve: spec.resolve, -- handled by @fieldResolver()
      // subscribe: spec.subscribe -- handled by @fieldSubscription(),
    };
  }

  build(config?: GraphQLSchemaConfig) {
    const {types} = config ?? {types: []};

    const accum: GraphQLNamedType[] = [];

    const builtTypes = accum
      .concat(
        Object.values(this.buildEnumTypes()).map(v => getNamedType(v)),
        Object.values(this.buildNamedInterfaceTypes()).map(v => getNamedType(v)),
        Object.values(this.buildNamedObjectTypes()).map(v => getNamedType(v)),
        Object.values(this.buildNamedInputTypes()).map(v => getNamedType(v)),
        Object.values(this.buildUnionTypes()).map(v => getNamedType(v)),
      )
      .filter(f => {
        return !types?.find(t => t.name === f.name);
      });

    return new GraphQLSchema({
      types: accum.concat(builtTypes),
      ...config,
    });
  }
}
