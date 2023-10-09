import {expect, use} from 'chai';
import {buildSchema} from 'graphql';
import {plugin} from './index.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import chaiDiff from 'chai-diff';
use(chaiDiff);

declare global {
  namespace Chai {
    interface DifferentFromOpts {
      showSpace?: boolean;
      relaxedSpace?: boolean;
      context?: number;
    }
    interface Assertion {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      differentFrom(expected: any, opt?: DifferentFromOpts): Assertion;
    }
    interface Assert {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      differentFrom(val: any, exp: any, opt?: DifferentFromOpts, msg?: string): void;
    }
  }
}

describe('Codegen ObjectType', () => {
  it('should generate type-graphql classes for object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type A {
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
      type B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, {outputFile: ''});

    const check = result.content
      .trim()
      .split('\n')
      .map(r => r.trim());
    const expected = `@graphql.objectType()
        export class A {
          __typename?: 'A';

          @graphql.field(type => GraphQLID)
          id?: Maybe<Scalars['ID']['output']>;

          @graphql.field(type => GraphQLID, { isRequired: true })
          mandatoryId!: Scalars['ID']['output'];

          @graphql.field(type => GraphQLString)
          str?: Maybe<Scalars['String']['output']>;

          @graphql.field(type => GraphQLString, { isRequired: true })
          mandatoryStr!: Scalars['String']['output'];

          @graphql.field(type => GraphQLBoolean)
          bool?: Maybe<Scalars['Boolean']['output']>;

          @graphql.field(type => GraphQLBoolean, { isRequired: true })
          mandatoryBool!: Scalars['Boolean']['output'];

          @graphql.field(type => GraphQLInt)
          int?: Maybe<Scalars['Int']['output']>;

          @graphql.field(type => GraphQLInt, { isRequired: true })
          mandatoryInt!: Scalars['Int']['output'];

          @graphql.field(type => GraphQLFloat)
          float?: Maybe<Scalars['Float']['output']>;

          @graphql.field(type => GraphQLFloat, { isRequired: true })
          mandatoryFloat!: Scalars['Float']['output'];

          @graphql.field(type => B)
          b?: Maybe<B>;

          @graphql.field(type => B, { isRequired: true })
          mandatoryB!: B;

          @graphql.field(type => GraphQLString, { isArray: true, isRequired: 'items' })
          arr?: Maybe<Array<Scalars['String']['output']>>;

          @graphql.field(type => GraphQLString, { isArray: true, isRequired: 'list' })
          mandatoryArr!: Array<Maybe<Scalars['String']['output']>>;

          @graphql.field(type => GraphQLString, { isArray: true, isRequired: 'both' })
          mandatoryArrAndItems!: Array<Scalars['String']['output']>;
        };`
      .split('\n')
      .map(r => r.trim());

    const firstIndex = check.findIndex(i => i.trim() === '@graphql.objectType()');
    const secondIndex = check.findLastIndex(i => i.trim() === '@graphql.objectType()');
    const slices = check.slice(firstIndex, secondIndex - 1);
    expect(slices).to.not.be.differentFrom(expected, {relaxedSpace: true});
  });
});
