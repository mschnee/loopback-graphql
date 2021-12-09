import {ArtifactOptions, BootMixin} from '@loopback/boot';
import {Application, Constructor, inject} from '@loopback/core';
import {expect} from '@loopback/testlab';
import * as path from 'path';
import {BindingKeys} from '../keys';
import {GraphqlTypeBooter} from './graphql-type.booter';

describe('GraphqlTypeBooter', () => {
  class BootedTypeService {
    constructor(
      @inject.tag('graphql-js.types', {optional: true})
      protected graphqlTypeClasses: Constructor<{}>[],
    ) {}

    getClasses() {
      return this.graphqlTypeClasses;
    }
  }

  class TestApplication extends BootMixin(Application) {
    constructor() {
      super();
      this.projectRoot = path.resolve(__dirname, '../__tests__');
      this.configure<ArtifactOptions>(BindingKeys.GraphQLTypeBooter).to({
        dirs: 'fixtures',
        nested: true,
        extensions: ['.type.ts'],
      });
      this.booters(GraphqlTypeBooter);
      this.service(BootedTypeService);
    }
  }

  describe('booting works', () => {
    let app: TestApplication;
    beforeEach(async () => {
      app = new TestApplication();
      await app.boot();
      await app.start();
    });

    afterEach(async () => {
      await app.stop();
    });

    it('Boots successfully', async () => {
      const service = await app.get<BootedTypeService>(`services.BootedTypeService`);
      expect(service.getClasses()).lengthOf(1);
    });
  });
});
