import {ArtifactOptions, BaseArtifactBooter, BootBindings} from '@loopback/boot';
import {
  Application,
  config,
  ContextTags,
  CoreBindings,
  createBindingFromClass,
  inject,
  injectable,
} from '@loopback/core';
import {BindingKeys} from '../keys';

@injectable({
  tags: {[ContextTags.KEY]: BindingKeys.GraphQLTypeBooter},
})
export class GraphqlTypeBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config(BindingKeys.GraphQLTypeBooter) public booterConfiguration: ArtifactOptions = {},
  ) {
    super(projectRoot, {
      ...GraphqlTypeBooterDefaultOptions,
      ...booterConfiguration,
    });
    const opts = {
      ...GraphqlTypeBooterDefaultOptions,
      ...booterConfiguration,
    };
    console.log(opts);
  }

  async load() {
    await super.load();
    for (const c of this.classes) {
      const binding = createBindingFromClass(c, {
        namespace: 'graphql-js.types',
        name: c.name,
      }).tag('graphql-js.types');
      this.app.add(binding);
    }
  }
}

export const GraphqlTypeBooterDefaultOptions: ArtifactOptions = {
  dirs: 'graphql-types',
  extensions: '.type.js',
  nested: true,
};
