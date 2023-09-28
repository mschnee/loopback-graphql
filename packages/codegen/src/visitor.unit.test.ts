/**
 * Retrieved from https://github.com/dotansimha/graphql-code-generator/blob/a46b8d99c797283d773ec14163c62be9c84d4c2b/packages/plugins/typescript/type-graphql/tests/type-graphql.spec.ts
 */
import {Types} from '@graphql-codegen/plugin-helpers';
import {expect, use} from 'chai';
import {oneLine} from 'common-tags';
import {buildSchema} from 'graphql';
import {plugin} from './index.js';

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

function strippedString(received?: string | string[]) {
  if (!received) {
    return '';
  } else if (Array.isArray(received)) {
    return oneLine`${received.join('')}`.replace(/\s\s+/g, ' ');
  } else {
    return oneLine`${received}`.replace(/\s\s+/g, ' ');
  }
}

describe('@loopback/graphql-codegen', () => {
  it('should generate an args type', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Mutation {
        test(
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
        ): Boolean!
      }

      input B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, {outputFile: ''});

    expect(strippedString(result.content)).to.contain(`
      @TypeGraphQL.ArgsType()
      export class MutationTestArgs {

        @graphql.field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;

        @graphql.field(type => TypeGraphQL.ID)
        mandatoryId!: Scalars['ID'];

        @graphql.field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;

        @graphql.field(type => String)
        mandatoryStr!: Scalars['String'];

        @graphql.field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;

        @graphql.field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];

        @graphql.field(type => TypeGraphQL.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;

        @graphql.field(type => TypeGraphQL.Int)
        mandatoryInt!: Scalars['Int'];

        @graphql.field(type => TypeGraphQL.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;

        @graphql.field(type => TypeGraphQL.Float)
        mandatoryFloat!: Scalars['Float'];

        @graphql.field(type => B, { nullable: true })
        b?: Maybe<B>;

        @graphql.field(type => B)
        mandatoryB!: FixDecorator<B>;

        @graphql.field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;

        @graphql.field(type => [String])
        mandatoryArr!: Array<Scalars['String']>;
      }
    `);
  });

  it('should generate type-graphql types as custom types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = (await plugin(
      schema,
      [],
      {decoratorName: {type: 'Foo', field: 'Bar', interface: 'FooBar'}},
      {outputFile: ''},
    )) as Types.ComplexPluginOutput;

    expect(strippedString(result.content)).to.contain(`
        @TypeGraphQL.Foo()
        export class Test {
          __typename?: 'Test';
          @TypeGraphQL.Bar(type => TypeGraphQL.ID, { nullable: true })
          id?: Maybe<Scalars['ID']>;
          @TypeGraphQL.Bar(type => String)
          mandatoryStr!: Scalars['String'];
        }
      `);
    expect(strippedString(result.content)).to.contain(`
        @TypeGraphQL.FooBar()
        export abstract class ITest {

          @TypeGraphQL.Bar(type => TypeGraphQL.ID, { nullable: true })
          id?: Maybe<Scalars['ID']>;
        }
      `);
  });

  it('should generate custom scalar types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar DateTime

      type A {
        date: DateTime
        mandatoryDate: DateTime!
      }
    `);

    const result = (await plugin(
      schema,
      [],
      {scalars: {DateTime: 'Date'}},
      {outputFile: ''},
    )) as Types.ComplexPluginOutput;

    expect(strippedString(result.content)).to.contain(`
      @graphql.objectType()
      export class A {
        __typename?: 'A';
        @graphql.field(type => Date, { nullable: true })
        date?: Maybe<Scalars['DateTime']>;
        @graphql.field(type => Date)
        mandatoryDate!: Scalars['DateTime'];
      }
    `);
  });

  it('should correctly set options for nullable types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type MyType {
        str1: String
        str2: String!
        strArr1: [String]
        strArr2: [String]!
        strArr3: [String!]
        strArr4: [String!]!

        int1: Int
        int2: Int!
        intArr1: [Int]
        intArr2: [Int]!
        intArr3: [Int!]
        intArr4: [Int!]!

        custom1: MyType2
        custom2: MyType2!
        customArr1: [MyType2]
        customArr2: [MyType2]!
        customArr3: [MyType2!]
        customArr4: [MyType2!]!
      }

      input MyInputType {
        inputStr1: String
        inputStr2: String!
        inputStrArr1: [String]
        inputStrArr2: [String]!
        inputStrArr3: [String!]
        inputStrArr4: [String!]!

        inputInt1: Int
        inputInt2: Int!
        inputIntArr1: [Int]
        inputIntArr2: [Int]!
        inputIntArr3: [Int!]
        inputIntArr4: [Int!]!

        inputCustom1: MyType2
        inputCustom2: MyType2!
        inputCustomArr1: [MyType2]
        inputCustomArr2: [MyType2]!
        inputCustomArr3: [MyType2!]
        inputCustomArr4: [MyType2!]!
      }

      type MyType2 {
        id: ID!
      }
    `);

    const result = await plugin(schema, [], {}, {outputFile: ''});

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => String, { nullable: true })
      str1?: Maybe<Scalars['String']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => String)
      str2!: Scalars['String'];
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String], { nullable: 'itemsAndList' })
      strArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String], { nullable: 'items' })
      strArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String], { nullable: true })
      strArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String])
      strArr4!: Array<Scalars['String']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => TypeGraphQL.Int, { nullable: true })
      int1?: Maybe<Scalars['Int']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => TypeGraphQL.Int)
      int2!: Scalars['Int'];
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int], { nullable: 'itemsAndList' })
      intArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int], { nullable: 'items' })
      intArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int], { nullable: true })
      intArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int])
      intArr4!: Array<Scalars['Int']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => MyType2, { nullable: true })
      custom1?: Maybe<MyType2>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => MyType2)
      custom2!: FixDecorator<MyType2>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2], { nullable: 'itemsAndList' })
      customArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2], { nullable: 'items' })
      customArr2!: Array<Maybe<MyType2>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2], { nullable: true })
      customArr3?: Maybe<Array<MyType2>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2])
      customArr4!: Array<MyType2>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => String, { nullable: true })
      inputStr1?: Maybe<Scalars['String']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => String)
      inputStr2!: Scalars['String'];
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String], { nullable: 'itemsAndList' })
      inputStrArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String], { nullable: 'items' })
      inputStrArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String], { nullable: true })
      inputStrArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [String])
      inputStrArr4!: Array<Scalars['String']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => TypeGraphQL.Int, { nullable: true })
      inputInt1?: Maybe<Scalars['Int']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => TypeGraphQL.Int)
      inputInt2!: Scalars['Int'];
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int], { nullable: 'itemsAndList' })
      inputIntArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int], { nullable: 'items' })
      inputIntArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int], { nullable: true })
      inputIntArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [TypeGraphQL.Int])
      inputIntArr4!: Array<Scalars['Int']>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => MyType2, { nullable: true })
      inputCustom1?: Maybe<MyType2>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => MyType2)
      inputCustom2!: FixDecorator<MyType2>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2], { nullable: 'itemsAndList' })
      inputCustomArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2], { nullable: 'items' })
      inputCustomArr2!: Array<Maybe<MyType2>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2], { nullable: true })
      inputCustomArr3?: Maybe<Array<MyType2>>;
    `);

    expect(strippedString(result.content)).to.contain(`
      @graphql.field(type => [MyType2])
      inputCustomArr4!: Array<MyType2>;
    `);
  });

  it('should put the GraphQL description in the TypeGraphQL options', async () => {
    const schema = buildSchema(/* GraphQL */ `
      """
      Test type description
      """
      type Test implements ITest {
        """
        id field description
        inside Test class
        """
        id: ID

        """
        mandatoryStr field description
        """
        mandatoryStr: String!
      }

      """
      ITest interface description
      """
      interface ITest {
        """
        id field description
        inside ITest interface
        """
        id: ID
      }

      """
      TestInput input description
      """
      input TestInput {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, {outputFile: ''});

    expect(strippedString(result.content)).to.contain(`
      @graphql.objectType({ description: 'Test type description', implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';
        @graphql.field(type => TypeGraphQL.ID, { description: 'id field description\\ninside Test class', nullable: true })
        id?: Maybe<Scalars['ID']>;
        @graphql.field(type => String, { description: 'mandatoryStr field description' })
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(strippedString(result.content)).to.contain(`
      @TypeGraphQL.InterfaceType({ description: 'ITest interface description' })
      export abstract class ITest {

        @graphql.field(type => TypeGraphQL.ID, { description: 'id field description\\ninside ITest interface', nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);

    expect(strippedString(result.content)).to.contain(`
      @TypeGraphQL.InputType({ description: 'TestInput input description' })
      export class TestInput {

        @graphql.field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);
  });

  it('should only generate TypeGraphQL decorators for included types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      enum RegularEnum {
        A
        B
      }

      enum TypeGraphQLEnum {
        A
        B
      }

      interface IRegularInterfaceType {
        id: ID
      }

      interface ITypeGraphQLInterfaceType {
        id: ID
      }

      type RegularType {
        id: ID
      }

      type TypeGraphQLType {
        id: ID
      }

      input RegularInputType {
        id: ID
      }

      input TypeGraphQLInputType {
        id: ID
      }

      type Query {
        regularFunction(mandatoryId: ID!, optionalId: ID): Boolean!
        typeGraphQLFunction(mandatoryId: ID!, optionalId: ID): Boolean!
      }
    `);

    const result = await plugin(
      schema,
      [],
      {
        decorateTypes: [
          'TypeGraphQLEnum',
          'ITypeGraphQLInterfaceType',
          'TypeGraphQLType',
          'TypeGraphQLInputType',
          'QueryTypeGraphQlFunctionArgs',
        ],
      },
      {outputFile: ''},
    );

    expect(strippedString(result.content)).to.not.eq(
      `TypeGraphQL.registerEnumType(RegularEnum, { name: 'RegularEnum' });`,
    );

    expect(strippedString(result.content)).to.contain(
      `TypeGraphQL.registerEnumType(TypeGraphQlEnum, { name: 'TypeGraphQlEnum' });`,
    );

    expect(strippedString(result.content)).to.contain(
      `export type IRegularInterfaceType = {
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(strippedString(result.content)).to.contain(
      `
      @TypeGraphQL.InterfaceType()
      export abstract class ITypeGraphQlInterfaceType {
        @graphql.field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(strippedString(result.content)).to.contain(
      `export type RegularType = {
        __typename?: 'RegularType';
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(strippedString(result.content)).to.contain(
      `@graphql.objectType()
      export class TypeGraphQlType {
        __typename?: 'TypeGraphQLType';
        @graphql.field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(strippedString(result.content)).to.contain(
      `export type RegularInputType = {
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(strippedString(result.content)).to.contain(
      `@TypeGraphQL.InputType()
      export class TypeGraphQlInputType {
        @graphql.field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(strippedString(result.content)).to.contain(`
    export type Query = {
      __typename?: 'Query';
      regularFunction: Scalars['Boolean'];
      typeGraphQLFunction: Scalars['Boolean'];
    };`);

    expect(strippedString(result.content)).to.contain(`export type QueryRegularFunctionArgs = {
        mandatoryId: Scalars['ID'];
        optionalId?: InputMaybe<Scalars['ID']>;
      };`);

    expect(strippedString(result.content)).to.contain(` @TypeGraphQL.ArgsType()
       export class QueryTypeGraphQlFunctionArgs {

         @graphql.field(type => TypeGraphQL.ID)
         mandatoryId!: Scalars['ID'];

         @graphql.field(type => TypeGraphQL.ID, { nullable: true })
         optionalId?: Maybe<Scalars['ID']>;
       };`);
  });
});
