---
sidebar_position: 1
---

# Introduction to GraphQL with Loopback

:::caution

`@loopback/graphql` is still under development and is not yes available in any registry.

:::

Loopback's GraphQL libraries provide a SOLID foundation by which you can easily use GraphQL in your applications. These libraries do not require a Loopback Server or Application. In fact, you can use `@loopback/graphql` to easily add graphql to your own application!

```ts
import {GraphQLSchemaFactory, resolver, query} from '@loopback/graphql';
import {graphql, type GraphQLSchema} from 'graphql';

@resolver()
class ExampleResolver {
  @query(() => GraphQLString)
  queryHello() {
    return 'Hello world!';
  }
}
const builder = new GraphQLSchemaFactory({
  resolverClasses: [ExampleResolver],
});
const schema: GraphQLSchema = builder.build(/* ...additional options ...*/);

graphql({
  schema,
  query: '{ queryHello }',
});
```

Where `@loopback/graphql` really brings the SOLID principles is making it easy to use dependency injection without requiring an additional framework.

```ts
import {GraphQLSchemaFactory, resolver, query} from '@loopback/graphql';
import {graphql, type GraphQLSchema} from 'graphql';
import {MyEchoService} from './path/to/my-service';

@resolver()
class ExampleResolver {
  @query(() => GraphQLString)
  queryHello(
    @args('echo', () => GraphQLString) echoString: string,
    @inject(MyEchoService.name) service: MyEchoService,
  ) {
    return service.format(`Hello world, ${echoString}`);
  }
}
const builder = new GraphQLSchemaFactory({
  resolverClasses: [ExampleResolver],
});
const schema: GraphQLSchema = builder.build(/* ...additional options ...*/);

graphql({
  schema,
  query: '{ queryHello(echo: $echoVar) }',
  variableValues: {echoVar: 'foo'},
});
```