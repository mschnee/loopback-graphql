# loopback-graphql

The purpose of this example is to provide a means via loopback to instantiate a GraphQLSchema using the reference implementation, [`graphql-js`](https://github.com/graphql/graphql-js).

# Design

- `ObjectType`, `InputType`, and `InterfaceType` are represented in code by DTOs, object decorated with `@objectType()`, `@inputType()`, and `@interfaceType()` respectively. GraphQL type inheretance/extension model does not match ECMAScript's, so we don't try to be fancy: an object type that implements one or more interfaces has to declare them via `@objectType({implements: [IOne, ITwo, ...INth]})` or `@objectImplements(IOne, ITwo, IThree, ...INth)`
- These DTOs describe the shape of data but do not provide implementation.

# Goals

### Phase 1

- Supply a `GraphQLComponent` with booters that can load `*.type.ts` and `*.resolver.ts` class objects.
- Separate `Type` and `Resolver` classes. The `Type` class declaration will be much like a `Model` class delcaration, in that the class and it's properties/methods describe a `GraphQLObjectType`. The `Resolver` class declarations are dependency-injectionable instances with functions that can be used to either root queries, root mutations, or typed field resolvers.
  - The purpose behind this, instead of having fesolver functions on the `Type` like in a `GraphQLObjectType`, is to maintain a separation of concerns. The `Type` should only be the type. The `Resolver` should contain the functionality.
  - There can be multiple resolver classes for a single type, so long as there are no duplicated root query names or field resolvers.
- Appropriate decorators:
  - `@type()` class-declaration decorator, denoting that the class is a `GraphQLObjectType` type.
  - `@field()` property decorator identifying a field on a Type class.
  - `@resolver(() => Type | string)` class-declaration decorator that denotes the current class provides root queries, root mutations, and field resolvers for a given type.
  - `@query(name?: string)` method decorator that identifies a method providing a root query.
  - `@fieldResolver(name?: string)` method decorator that identifies a method for being a resolve() function for a field.
- Supply a `buildSchema` function, whose output will be a valid `GraphQLSchema` object: see [Constructing Types](https://graphql.org/graphql-js/constructing-types/) in the official documentation.
- Each of the decorators should fully support the options as required by the graphQL-js object types.

### Phase 2

- Supply a `GraphQLExpressMiddleware` which can take a built schema and serve it using loopback middleware.
- Ensure that this happens _after_ any possible authentication middleware so that `@inject(SecurityBindings.User)` is possible.

### Phase 3

- Supply a `ApolloExpressMiddleware` which can take a built schema and serve it using apollo-express middleware.

### Phase 4

This phase will add mutations and input types, using `@mutation(name?:string)` method decorator, `@args(InputType)` parameter decorator, `@input()` class-declaration decorator

### Phase 5

Add support for enums, interfaces, unions.

### Phase 6

Support apollo federation subschemas via `@resolveReference`

- Ensure that the generated schema has the correct functions.
- Enforce that only `ApolloExpressMiddleware` can support `@resolveReference`. If said schema is passed to `GraphQLExpressMiddleware`, it should FATAL error.
