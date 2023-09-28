import {expect} from 'chai';
import {buildSchema} from 'graphql';
import {plugin} from './index.js';
import {strippedString} from './lib/stripped-string.js';

describe('Codegen Exports', () => {
  it('should expose Maybe', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, {outputFile: ''});
    expect(strippedString(result.prepend)).to.contain('export type Maybe<T> =');
  });

  it('should expose Exact', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, {outputFile: ''});
    expect(strippedString(result.prepend)).to.contain('export type Exact<');
  });

  it('should expose FixDecorator', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, {outputFile: ''});
    expect(strippedString(result.prepend)).to.contain('export type FixDecorator<T> = T;');
  });

  it('should generate type-graphql import/export', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, {outputFile: ''});

    expect(strippedString(result.prepend)).to.contain(
      `import * as graphql from '@mschnee/loopback-graphql';export { graphql };`,
    );
  });
});
