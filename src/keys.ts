import {BindingKey} from '@loopback/context';

export namespace DecoratorKeys {
  /**
   * Class Keys
   */
  export const ResolverClass = 'io.loopback.graphql.decorator.class.GRAPHQL_RESOLVER_CLASS';
  export const TypeClass = 'io.loopback.graphql.decorator.class.GRAPHQL_TYPE_CLASS';

  /**
   * Method keys
   */
  export const QueryMethod = 'io.loopback.graphql.decorator.method.GRAPHPQ_QUERY';
  export const FieldResolverMethod = 'io.loopback.graphql.decorator.method.GRAPHPQ_FIELD_RESOLVER';

  /**
   * Property keys
   */
  export const TypeFieldProperty = 'io.loopback.graphql.decorator.property.GRAPHPQ_TYPE_FIELD';
}

export namespace BindingKeys {
  export const GraphQLComponent = BindingKey.create('io.loopback.graphql.component');
  export const GraphQLTypeBooter = BindingKey.create('io.loopback.graphql.booter.graphql-type');
  export const GraphQLResolverBooter = BindingKey.create('io.loopback.graphql.booter.graphql-resolver');
}
