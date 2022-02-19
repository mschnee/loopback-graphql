import {expect} from '@loopback/testlab';
import {GraphQLSchema, printSchema} from 'graphql';
import {SchemaGenerator} from './schema.generator';
import {TestUserType} from './__tests__/fixtures/user/user.type';

describe('SchemaGenerator', () => {
  it('unit test', () => {
    const generator = new SchemaGenerator([TestUserType], []);
    let schema: GraphQLSchema;
    expect(() => {
      schema = generator.buildSchema();
      const output = printSchema(schema);
      console.log(output);
    }).to.not.throw();
  });
});
