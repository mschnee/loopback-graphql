import {ClassDecoratorFactory, Constructor, inject, MetadataInspector} from '@loopback/core';
import {
  GraphQLDirective,
  GraphQLFieldConfig,
  GraphQLList,
  GraphQLNamedOutputType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLSchemaConfig,
  isScalarType,
  ThunkObjMap,
} from 'graphql';
import {ObjMap} from 'graphql/jsutils/ObjMap';
import {FieldDecoratorSpec} from './decorators/field.decorator';
import {TypeDecoratorSpec} from './decorators/type.decorator';
import {DecoratorKeys} from './keys';
import {NameOrType, NameOrTypeThunk} from './types';

export class SchemaGenerator {
  /**
   * When parsing all of the bootloaded `*.field.ts` files, or when processing
   * resolver classes for types, we use this registry for two things:
   * - First: ensure that the type names are unique in this schema. For now, only on single `@graphql.type()` class defininition per unique string.
   *   The Specification requires that each named type in a graph is defined once.
   * - Second: the `fields` parameter of GraphQLObject type takes a Thunk that can be resolved later: this allows for recursive type references.
   *
   * We are delibarately choosing, at this point, to publish ALL types in the root schema object.  In M2 we sill consider a decorator to mark
   * a type as non-root.  Root types or not; the strict naming remains, as does the thunk lookup.
   */
  protected namedOutputTypeRegistry: Map<string, GraphQLNamedOutputType> = new Map();

  constructor(
    @inject.tag('graphql-js.types')
    protected graphqlTypeClasses: Constructor<{}>[],
    @inject.tag('graphql-js.resolvers')
    protected graphqlResolverClasses: Constructor<{}>[],
  ) {}

  buildSchema(): GraphQLSchema {
    const directives = this.buildDirectives();
    // const extensions = this.buildExtensions();
    const schema = new GraphQLSchema({
      directives,
      // extensions,
      query: this.buildRootQuery(),
      types: this.buildRootTypes(),
    });

    return schema;
  }

  buildDirectives(): GraphQLDirective[] {
    return [];
  }

  // buildExtensions(): GraphQLSchemaExtensions {
  //   return;
  // }

  buildRootQuery(): GraphQLObjectType {
    return new GraphQLObjectType({
      name: 'Query',
      fields: () => ({}),
    });
  }

  buildRootTypes(): GraphQLNamedType[] {
    /**
     * M2:
     * We may wish to filter this by some additional metadata, such as @graphql.root(false).
     *
     * If we do, we still need to register the type.
     */
    const rootTypes = this.graphqlTypeClasses.map(this.buildType);
    return rootTypes;
  }

  buildType(typeClass: Function): GraphQLNamedOutputType {
    const classSpec = MetadataInspector.getClassMetadata<TypeDecoratorSpec>(DecoratorKeys.TypeClass, typeClass);
    if (!classSpec) {
      throw new Error('A @graphql.type() decorated class was missing a spec.');
    }
    if (this.namedOutputTypeRegistry.has(classSpec.typeName)) {
      throw new Error(`The type name ${classSpec.typeName} has already been defined.`);
    }

    const namedType = new GraphQLObjectType({
      name: classSpec.typeName,
      // description: MetadataInspector.getClassMetadata(DecoratorKeys.ClassDescription),
      fields: this.getFieldsForClass(typeClass),
    });
    this.namedOutputTypeRegistry.set(classSpec.typeName, namedType);
    return namedType;
  }

  /**
   * Given a class decorated with `@graphql.field()`, returns a thunk that will
   * eventually resolve to all fields. If available.
   * @param classDef
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFieldsForClass(classDef: Function): ThunkObjMap<GraphQLFieldConfig<any, any>> {
    const fieldSpecs = MetadataInspector.getAllPropertyMetadata<FieldDecoratorSpec>(
      DecoratorKeys.TypeFieldProperty,
      classDef,
    );

    /**
     * If the `@graphql.type()` class has no `@graphql.fields()` on it, then its
     * not a type that can be handled by graphQL.  For M1, this is a fatal error.
     */
    if (!fieldSpecs || !Object.entries(fieldSpecs).length) {
      throw new Error(`Type ${ClassDecoratorFactory.getTargetName(classDef)} has no fields`);
    }
    return () => {
      return Object.entries(fieldSpecs).reduce((res, [propertyName, fieldSpec]) => {
        const fieldType = this.getFieldTypeFromThunk(fieldSpec.nameOrTypeThunk);
        const type = fieldSpec.nullable ? new GraphQLNonNull(fieldType) : fieldType;
        res[fieldSpec.fieldName] = {
          type,
          // todo: implement the resolve() lookup
        };
        return res;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {} as ObjMap<GraphQLFieldConfig<any, any>>);
    };
  }

  /**
   * Checks if the definition is an array; wraps it in GraphQlList() if so
   * @param nameOrTypeThunk
   * @returns
   */
  getFieldTypeFromThunk(nameOrTypeThunk: NameOrTypeThunk): GraphQLOutputType {
    const r = nameOrTypeThunk();
    if (Array.isArray(r)) {
      return new GraphQLList(this.getFieldTypeFromThunkValue(r[0]));
    } else {
      return this.getFieldTypeFromThunkValue(r);
    }
  }

  /**
   * Checks the registry; throws an error if a field type is referenced but missing.
   * @param nameOrType
   * @returns
   */
  getFieldTypeFromThunkValue(nameOrType: NameOrType): GraphQLNamedOutputType {
    if (typeof nameOrType === 'string') {
      const v = this.namedOutputTypeRegistry.get(nameOrType);
      if (!v) {
        throw new Error(`Named type '${nameOrType}' does not exist in the registry`);
      }
      return v;
    } else if (isScalarType(nameOrType)) {
      return nameOrType;
    } else {
      const spec = MetadataInspector.getClassMetadata<TypeDecoratorSpec>(DecoratorKeys.TypeClass, nameOrType);
      if (!spec) {
        throw new Error(`Given type ${nameOrType} is not decorated with @graphql.type()`);
      } else {
        const v = this.namedOutputTypeRegistry.get(spec.typeName);
        if (!v) {
          /**
           * TODO:
           * this is recursion.  On a big graph, this could smash the stack.
           * Maybe look into replacing this with generators?
           */
          const bv = this.buildType(nameOrType);
          if (!bv) {
            throw new Error(`Named type '${spec.typeName}' does not exist in the registry`);
          }
          return bv;
        } else {
          return v;
        }
      }
    }
  }
}

export type SchemaOptions = Omit<GraphQLSchemaConfig, 'extensions' | 'directives'>;
