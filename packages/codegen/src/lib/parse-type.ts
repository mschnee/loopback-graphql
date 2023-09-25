import {NormalizedScalarsMap} from '@graphql-codegen/visitor-plugin-common';
import {TypeNode} from 'graphql';
import {ARRAY_REGEX, MAYBE_REGEX, SCALARS, SCALAR_REGEX} from '../consts.js';
import {Type} from '../types.js';

function isTypeNode(t: TypeNode | string): t is TypeNode {
  return typeof t !== 'string';
}
export function parseType(rawType: TypeNode | string, customScalars: NormalizedScalarsMap = {}): Type {
  if (isTypeNode(rawType)) {
    if (rawType.kind === 'NamedType') {
      return {
        type: rawType.name.value,
        isRequired: false,
        isArray: false,
        areItemsRequired: false,
        isScalar: SCALARS.includes(rawType.name.value),
      };
    }
    if (rawType.kind === 'NonNullType') {
      return {
        ...parseType(rawType.type, customScalars),
        isRequired: true,
      };
    }
    if (rawType.kind === 'ListType') {
      return {
        ...parseType(rawType.type, customScalars),
        isArray: true,
        isRequired: false,
      };
    }
  }

  const isRequired = !rawType.match(MAYBE_REGEX);
  const nonNullableType = rawType.replace(MAYBE_REGEX, '$1');
  const isArray = !!nonNullableType.match(ARRAY_REGEX);
  const singularType = nonNullableType.replace(ARRAY_REGEX, '$1');
  const isSingularTypeRequired = !singularType.match(MAYBE_REGEX);
  const singularNonNullableType = singularType.replace(MAYBE_REGEX, '$1');
  const isScalar = !!singularNonNullableType.match(SCALAR_REGEX);
  const type = singularNonNullableType.replace(SCALAR_REGEX, (match, t) => {
    if (SCALARS.includes(t)) {
      return `GraphQL${t}`;
    }
    if (t in global) {
      // This is a JS native type
      return t;
    }
    if (customScalars[t]) {
      // This is a type specified in the configuration
      return customScalars[t];
    }
    throw new Error(`Unknown scalar type ${t}`);
  });

  return {
    type,
    isRequired,
    isArray,
    isScalar,
    areItemsRequired: isArray && isSingularTypeRequired,
  };
}
