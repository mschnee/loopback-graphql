```ts
var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        },
      },
    },
  }),
});
```

```ts
@resolver(() => GraphQLString)
class HelloWorldResolver {
    @query({ name: 'hello' })
    hello() {
        return 'world'
    }
}
```