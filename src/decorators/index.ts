export const foo = 'bar';

import {field} from './field.decorator';
import {fieldResolver} from './fieldResolver.decorator';
import {query} from './query.decorator';
import {resolver} from './resolver.decorator';
import {type} from './type.decorator';

export const graphql = {
  resolver,
  field,
  fieldResolver,
  query,
  type,
};
