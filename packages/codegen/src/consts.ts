export const MAYBE_REGEX = /^Maybe<(.*?)>$/;
export const ARRAY_REGEX = /^Array<(.*?)>$/;
export const SCALAR_REGEX = /^Scalars\['(.*?)'\].*$/;
export const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];
export const SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];
export const TYPE_GRAPHQL_SCALARS = ['ID', 'Int', 'Float'];

export const FIX_DECORATOR_SIGNATURE = `type FixDecorator<T> = T;`;
