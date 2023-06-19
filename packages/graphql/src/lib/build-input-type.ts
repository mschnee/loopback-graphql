import {MetadataInspector} from '@loopback/metadata';
import {
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLNonNull,
  GraphQLType,
  ThunkObjMap,
  isType,
} from 'graphql';
import {FieldDecoratorSpec} from '../decorators/field.decorator';
import {InputTypeDecoratorSpec} from '../decorators/inputType.decorator';
import {DecoratorKeys} from '../keys';
import {NameOrClassOrType, ObjMap, TypeCache} from '../types';

export function getOrBuildInputType(typeCache: TypeCache, t: NameOrClassOrType): GraphQLType {
  if (isType(t)) {
    return t;
  }
  if (typeCache.inputTypes.has(t)) {
    return typeCache.inputTypes.get(t)!;
  }
}
export function buildInputType(typeCache: TypeCache, t: Function): GraphQLInputObjectType {
  const spec = MetadataInspector.getClassMetadata<InputTypeDecoratorSpec>(DecoratorKeys.InputTypeClass, t);

  return new GraphQLInputObjectType({
    name: spec?.typeName || t.name,
    description: spec?.description,
    fields: buildObjectTypeFields(t),
  });
}

function buildObjectTypeFields(typeCache: TypeCache, t: Function): ThunkObjMap<GraphQLInputFieldConfig> {
  return () => {
    const specs = MetadataInspector.getAllPropertyMetadata<FieldDecoratorSpec>(DecoratorKeys.TypeFieldProperty, t);
    if (!specs) {
      return {};
    }
    const result: ObjMap<GraphQLInputFieldConfig> = {};
    Object.entries(specs).forEach(([propertyOrMethodName, spec]) => {
      let type: GraphQLInputType;
      const maybeType = spec.nameOrTypeThunk();
      if (isType(maybeType)) {
        type = spec.nullable ? maybeType : new GraphQLNonNull(maybeType);
      } else {
        type = buildInputType(typeCache, maybeType);
      }
      result[propertyOrMethodName] = {
        type,
      };
    });
    return {};
  };
}
