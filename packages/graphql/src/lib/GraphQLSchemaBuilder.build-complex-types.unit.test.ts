import {expect} from 'chai';
import {GraphQLID, GraphQLSchema, GraphQLString, printSchema} from 'graphql';
import {field, objectType} from '../graphql.decorators.js';
import {Enum, EnumValue} from './Enum.js';
import {BaseGraphQLSchemaBuilder} from './GraphQLSchemaBuilder.js';

describe('GraphQLSchemaBuilder.build() complex types', () => {
  it('Builds a straightforward set of complex types', () => {
    const IdentityStatus = Enum('IdentityStatus', 'New', 'PasswordReset', 'Active', 'Inactive', 'Locked');

    @objectType()
    class Identity {
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
    class CompanyUser {
      @field({type: () => GraphQLID, required: true})
      id!: string;

      @field({type: () => Identity, required: true})
      userIdentity!: Identity;

      @field({type: () => Company, required: true})
      company!: Company;
    }

    @objectType()
    class Company {
      @field({type: () => GraphQLString})
      name!: string;

      @field({type: () => CompanyUser, array: true})
      employees!: CompanyUser[];
    }

    const builder = new BaseGraphQLSchemaBuilder([IdentityStatus, Identity, CompanyUser, Company]);
    let schema: GraphQLSchema | undefined;
    expect(() => (schema = builder.build())).to.not.throw();
    expect(schema).to.exist;
    const printedSdl = printSchema(schema!);
  });
});
