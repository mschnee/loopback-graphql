import {Type} from '../types.js';

export function fixDecorator(type: Type, typeString: string) {
  return type.isArray || type.isRequired || type.isScalar ? typeString : `FixDecorator<${typeString}>`;
}
