import {expect, use} from 'chai';
import {buildSchema} from 'graphql';
import {plugin} from './index.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import chaiDiff from 'chai-diff';
import {strippedString} from './lib/stripped-string.js';
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
        mandatoryArr: [String!]!
      }
      input B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, {outputFile: ''});

    expect(strippedString(result.content)).to.contain(`
          @graphql.inputType()
          export class A {

            @graphql.field(type => TypeGraphQL.ID, { nullable: true })
            id?: Maybe<Scalars['ID']['input']>;

            @graphql.field(type => TypeGraphQL.ID)
            mandatoryId!: Scalars['ID']['input'];

            @graphql.field(type => String, { nullable: true })
            str?: Maybe<Scalars['String']['input']>;

            @graphql.field(type => String)
            mandatoryStr!: Scalars['String']['input'];

            @graphql.field(type => Boolean, { nullable: true })
            bool?: Maybe<Scalars['Boolean']['input']>;

            @graphql.field(type => Boolean)
            mandatoryBool!: Scalars['Boolean']['input'];

            @graphql.field(type => TypeGraphQL.Int, { nullable: true })
            int?: Maybe<Scalars['Int']['input']>;

            @graphql.field(type => TypeGraphQL.Int)
            mandatoryInt!: Scalars['Int']['input'];

            @graphql.field(type => TypeGraphQL.Float, { nullable: true })
            float?: Maybe<Scalars['Float']['input']>;

            @graphql.field(type => TypeGraphQL.Float)
            mandatoryFloat!: Scalars['Float']['input'];

            @graphql.field(type => B, { nullable: true })
            b?: Maybe<B>;

            @graphql.field(type => B)
            mandatoryB!: FixDecorator<B>;

            @graphql.field(type => [String], { nullable: true })
            arr?: Maybe<Array<Scalars['String']['input']>>;

            @graphql.field(type => [String])
            mandatoryArr!: Array<Scalars['String']['input']>;
          }
        `);
  });
});
