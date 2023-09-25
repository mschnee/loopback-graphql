import type {Type} from '../types.js';

export function buildTypeString(type: Type): string {
  if (!type.isArray && !type.isScalar && !type.isRequired) {
    type.type = `FixDecorator<${type.type}>`;
  }
  if (type.isScalar) {
    type.type = `Scalars['${type.type}']`;
  }
  if (type.isArray) {
    type.type = `Array<${type.type}>`;
  }
  if (!type.isRequired) {
    type.type = `Maybe<${type.type}>`;
  }

  return type.type;
}
