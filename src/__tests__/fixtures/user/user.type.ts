import {GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLString} from 'graphql';
import {graphql} from '../../../decorators';

@graphql.type()
export class User {
  @graphql.field(() => GraphQLBoolean)
  boolField: boolean;

  @graphql.field(() => GraphQLString)
  stringField: string;

  @graphql.field(() => GraphQLInt)
  intField: number;

  @graphql.field(() => GraphQLFloat)
  floatField: number;

  @graphql.field(() => GraphQLString, {nullable: true})
  nullableString?: string;

  @graphql.field(() => GraphQLInt, {name: 'alternatNameInt'})
  _secondIntField: number;
}
