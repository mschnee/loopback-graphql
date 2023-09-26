import {Type} from '../types.js';

export function getGraphQLRequiredValue(type: Type): string | undefined {
  if (type.isRequired) {
    if (type.areItemsRequired) {
      return "'both'";
    }
    return type.isArray ? "'list'" : 'true';
  }
  if (type.areItemsRequired) {
    return "'items'";
  }

  return undefined;
}
