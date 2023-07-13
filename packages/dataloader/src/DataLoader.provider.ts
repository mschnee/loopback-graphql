import {BindingScope, injectable, MetadataInspector, type Provider, type ValueOrPromise} from '@loopback/context';
import DataLoader from 'dataloader';
import type {DataLoaderClassDecoratorMetadata} from './dataloader.decorator';
import {DataloaderClassKey} from './keys';

@injectable.provider({scope: BindingScope.REQUEST})
export class DataLoaderProvider<K, V, C = K> implements Provider<DataLoader<K, V, C>> {
  loader?: DataLoader<K, V, C>;

  value(): ValueOrPromise<DataLoader<K, V, C>> {
    const metadata = MetadataInspector.getClassMetadata<DataLoaderClassDecoratorMetadata<K, V, C>>(
      DataloaderClassKey,
      Object.getPrototypeOf(this),
    );
    if (!this.loader) {
      this.loader = new DataLoader<K, V, C>(this.load.bind(this), metadata?.options);
    }
    return this.loader;
  }

  load(keys: ReadonlyArray<K>): PromiseLike<ArrayLike<V | Error>> {
    throw new Error('Not implemented');
  }
}
