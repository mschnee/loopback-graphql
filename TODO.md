# TODOS

# 0.1.0

This milestone represent Schema creation. If you can create a schema using `graphql-js`, you can create it with `@loopback/graphql`

Note that

- [ ] The `@field()` property decorator should accept a thunk as its first argument, e.g. `@field(() => GraphQLString)`
- [ ] The `@field()` property decorator should accept a `GraphQLScalar` as its first argument, e.g. `@field(GraphQLString)`
- [ ] Make complex objects work (e.g. an `@objectType()` with a `@field()` property that is itself another object type)

# 0.2.0

Implement Resolvers.

- [ ] Hook up ObjectType creation to check for applicable resolver metadata.
