import {expect} from 'chai';
import {GraphQLID, GraphQLSchema, GraphQLString, printSchema} from 'graphql';
import {field, inputType, objectType} from '../decorators/index.js';
import {Enum, EnumValue} from './Enum.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';

describe('GraphQLSchemaBuilder.build() @inputType', () => {
  it('throws on an inputType with a complex output type', () => {
    @inputType()
    class InputType {
      @field({type: () => OutputType})
      outType?: OutputType;

      @field({type: () => GraphQLID})
      id!: string;
    }

    @objectType()
    class OutputType {
      @field({type: () => GraphQLID})
      id!: string;
    }

    const builder = new BaseGraphQLSchemaBuilder([InputType, OutputType]);
    expect(() => builder.build()).to.throw('Input Fields must be GraphQLScalars or Enumerations');
  });

  it('creates a valid input type', () => {
    const IdentityStatus = Enum('IdentityStatus', 'New', 'PasswordReset', 'Active', 'Inactive', 'Locked');
    @inputType()
    class IdentityInput {
      @field({type: () => GraphQLID, required: true})
      id!: string;

      @field({type: () => GraphQLString})
      date?: Date;

      @field({type: () => GraphQLString})
      firstName?: string;

      @field({type: () => GraphQLString})
      lastName?: string;

      @field({type: () => IdentityStatus})
      status?: EnumValue<typeof IdentityStatus>;
    }

    @objectType()
    class IdentityOutput {
      @field({type: () => GraphQLID, required: true})
      id!: string;

      @field({type: () => GraphQLString})
      date?: Date;

      @field({type: () => GraphQLString})
      firstName?: string;

      @field({type: () => GraphQLString})
      lastName?: string;

      @field({type: () => IdentityStatus})
      status?: EnumValue<typeof IdentityStatus>;
    }

    const builder = new BaseGraphQLSchemaBuilder([IdentityStatus, IdentityOutput, IdentityInput]);
    let schema: GraphQLSchema | undefined;
    expect(() => (schema = builder.build())).to.not.throw();
    expect(schema).to.exist;
    const printedSdl = printSchema(schema!);
    expect(printedSdl).to.exist;
    expect(printedSdl).to.contain('input IdentityInput {\n');
  });
});
