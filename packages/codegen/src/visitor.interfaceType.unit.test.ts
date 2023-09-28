import {expect} from 'chai';
import {diffTrimmedLines} from 'diff';
import {buildSchema} from 'graphql';
import {plugin} from './index.js';
import {diffsToString} from './lib/diffs-to-string.js';
import {strippedString} from './lib/stripped-string.js';

describe('Codegen InterfaceType', () => {
  it('should generate type-graphql classes implementing type-graphql interfaces for object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test implements ITest {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, {outputFile: ''});
    const expectation = `
      @graphql.objectType({ implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';

        @graphql.field(type => GraphQLID)
        id?: Maybe<Scalars['ID']['output']>;

        @graphql.field(type => GraphQLString, { isRequired: true })
        mandatoryStr!: Scalars['String']['output'];
      }
    `;
    expect(strippedString(result.content)).to.contain(
      strippedString(expectation),
      diffsToString(diffTrimmedLines(result.content, expectation)),
    );

    expect(strippedString(result.content)).to.contain(
      strippedString(`
          @graphql.interfaceType()
          export abstract class ITest {
            @graphql.field(type => GraphQLID)
            id?: Maybe<Scalars['ID']['output']>;
          }
        `),
    );
  });
});
