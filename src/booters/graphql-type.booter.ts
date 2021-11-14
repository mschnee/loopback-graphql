import {
  ArtifactOptions,
  BaseArtifactBooter,
  BootBindings,
} from '@loopback/boot';
import {
  Application,
  config,
  CoreBindings,
  createBindingFromClass,
  inject,
} from '@loopback/core';

export class GraphqlTypeBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config() public booterConfiguration: ArtifactOptions = {},
  ) {
    super(projectRoot, {
      ...booterConfiguration,
      ...GraphqlTypeBooterDefaultOptions,
    });
  }

  async load() {
    await super.load();
    for (const c of this.classes) {
      const binding = createBindingFromClass(c, {
        namespace: 'graphql-js.types',
        name: c.name,
      });
      this.app.add(binding);
    }
  }
}

export const GraphqlTypeBooterDefaultOptions: ArtifactOptions = {
  dirs: 'graphql-types',
  extensions: '.type.js',
  nested: true,
};
