import {MetadataInspector} from '@loopback/metadata';
import {
  GraphQLFieldConfig,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo,
  ThunkObjMap,
  isType,
} from 'graphql';
import {FieldDecoratorSpec} from '../decorators/field.decorator';
import {TypeDecoratorSpec} from '../decorators/objectType.decorator';
import {DecoratorKeys} from '../keys';
import {NamedTypeMap} from '../types';

export function buildObjectType<TFunction extends Function>(
  cache: NamedTypeMap,
  decoratedClass: TFunction,
): GraphQLObjectType {
  const spec = MetadataInspector.getClassMetadata<TypeDecoratorSpec>(DecoratorKeys.ObjectTypeClass, decoratedClass);
  if (!spec) {
    throw new Error(`Class '${decoratedClass.name}' is not decorated with ObjectTypeClass metadata`);
  }

  return new GraphQLObjectType({
    name: spec.typeName,
    description: spec.description,
    isTypeOf: spec.isTypeOf,
    /**
     * The Schema Builder will replace this
     */
    fields: () => ({}),
  });
}

export function buildObjectTypeFields<TFunction extends Function>(
  cache: NamedTypeMap,
  decoratedClass: TFunction,
): ThunkObjMap<GraphQLFieldConfig<TFunction, GraphQLResolveInfo, any>> {
  return () => {
    const specs = MetadataInspector.getAllPropertyMetadata<FieldDecoratorSpec>(
      DecoratorKeys.TypeFieldProperty,
      decoratedClass,
    );
    if (!specs) {
      return {};
    }
    const result: ThunkObjMap<GraphQLFieldConfig<TFunction, GraphQLResolveInfo, any>> = {};
    for (const [key, spec] of Object.entries(specs)) {
      result[key] = buildField(cache, spec, decoratedClass, key);
    }
    return result;
  };
}

export function buildField(
  cache: NamedTypeMap,
  spec: FieldDecoratorSpec,
  decoratedClass: Function,
  key: string,
): GraphQLFieldConfig<any, any> {
  const maybeName = spec.nameOrTypeThunk();
  let type: GraphQLOutputType;
  if (typeof maybeName === 'string') {
    type = cache[maybeName];
  } else if (isType(maybeName)) {
    type = maybeName;
  } else {
    throw new Error('What am I?');
  }
  return {
    type,
    description: spec.description,
    deprecationReason: spec.deprecationReason,
    // args: buildFieldArguments(cache, spec, decoratedClass, key),
    resolve: spec.resolve,
    subscribe: spec.subscribe,
  };
}
