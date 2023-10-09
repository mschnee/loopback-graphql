import type {Type} from '../types.js';

export function buildInputFieldTypeString(inputType: Type | string): string {
  if (typeof inputType === 'string') {
    return inputType;
  }
  let typeName = inputType.type.replace(/^GraphQL/, '');
  // Unsure what the purpose of FixDecorator<T> is for in the context of SDL->TS generation.
  // if (!inputType.isArray && !inputType.isScalar && !inputType.isRequired) {
  //   typeName = `FixDecorator<${typeName}>`;
  // }
  if (inputType.isScalar) {
    typeName = `Scalars['${typeName}']['input']`;
  }
  if (inputType.isArray) {
    typeName = `Array<${typeName}>`;
  }
  if (!inputType.isRequired) {
    typeName = `Maybe<${typeName}>`;
  }

  return typeName;
}
