import {
  BindingScope,
  Constructor,
  Context,
  inject,
  injectable,
} from '@loopback/context';
import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';
import {NameOrTypeThunk} from './types';

@injectable({
  scope: BindingScope.SERVER,
})
export class GraphQLSchemaGenerator {
  constructor(
    @inject.context() rootContext: Context,
    @inject.tag('graphql-types')
    protected graphqlTypeClasses: Constructor<{}>[],
  ) {}

  getNameForNameOrType(nameOrType: NameOrTypeThunk): string {
    const nort = nameOrType();
    const nval = Array.isArray(nort) ? nort[0] : nort;
    if (typeof nval === 'string') {
      return nval;
    } else {
      return nval.name;
    }
  }
  async getDefinitionForNamedType(
    namedGqlType: string,
  ): Promise<GraphQLObjectType | GraphQLScalarType> {
    // EXAMPLEE
    const ot = new GraphQLObjectType({
      name: 'fooBarType',
      fields: {
        foo: {
          type: new GraphQLObjectType({
            name: 'barType',
            fields: {
              bar: {
                type: GraphQLString,
                // resolve: () => 'foo-bar-baz', // should be accessible
              },
            },
          }),
        },
      },
    });

    const fieldEntry = Object.entries(ot.getFields()).find(
      ([key, item]) => key === 'foo',
    );

    fieldEntry![1].resolve = () => ({bar: 'foo-bar-baz'});

    return GraphQLBoolean;
  }
}
