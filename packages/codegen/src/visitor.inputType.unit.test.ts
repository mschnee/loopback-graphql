import {expect, use} from 'chai';
import chaiDiff from 'chai-diff';
import {buildSchema} from 'graphql';
import {plugin} from './index.js';
use(chaiDiff);

describe('Codegen InputType', () => {
  it('should generate type-graphql classes for input types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      input A {
        id: ID
        mandatoryId: ID!
        str: String
        mandatoryStr: String!
        bool: Boolean
        mandatoryBool: Boolean!
        int: Int
        mandatoryInt: Int!
        float: Float
        mandatoryFloat: Float!
        b: B
        mandatoryB: B!
        arr: [String!]
        mandatoryArr: [String]!
        mandatoryArrAndItems: [String!]!
      }
      input B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, {outputFile: ''});

    const firstIndex = result.content.indexOf('@graphql.inputType()');
    const secondIndex = result.content.indexOf('@graphql.inputType()', firstIndex + 1);
    expect(result.content.slice(firstIndex, secondIndex)).to.not.be.differentFrom(
      `
          @graphql.inputType()
          export class A {

            @graphql.field(type => GraphQLID)
            id?: Maybe<Scalars['ID']['input']>;

            @graphql.field(type => GraphQLID, { isRequired: true })
            mandatoryId!: Scalars['ID']['input'];

            @graphql.field(type => GraphQLString)
            str?: Maybe<Scalars['String']['input']>;

            @graphql.field(type => GraphQLString, { isRequired: true })
            mandatoryStr!: Scalars['String']['input'];

            @graphql.field(type => GraphQLBoolean)
            bool?: Maybe<Scalars['Boolean']['input']>;

            @graphql.field(type => GraphQLBoolean, { isRequired: true })
            mandatoryBool!: Scalars['Boolean']['input'];

            @graphql.field(type => GraphQLInt)
            int?: Maybe<Scalars['Int']['input']>;

            @graphql.field(type => GraphQLInt, { isRequired: true })
            mandatoryInt!: Scalars['Int']['input'];

            @graphql.field(type => GraphQLFloat)
            float?: Maybe<Scalars['Float']['input']>;

            @graphql.field(type => GraphQLFloat, { isRequired: true })
            mandatoryFloat!: Scalars['Float']['input'];

            @graphql.field(type => B)
            b?: Maybe<B>;

            @graphql.field(type => B, { isRequired: true })
            mandatoryB!: B;

            @graphql.field(type => GraphQLString, { isArray: true, isRequired: 'items' })
            arr?: Maybe<Array<Scalars['String']['input']>>;

            @graphql.field(type => GraphQLString, { isArray: true, isRequired: 'list' })
            mandatoryArr!: Array<Maybe<Scalars['String']['input']>>;

            @graphql.field(type => GraphQLString, { isArray: true, isRequired: 'both' })
            mandatoryArrAndItems!: Array<Scalars['String']['input']>;
          };`,
      {relaxedSpace: true},
    );
  });
});
