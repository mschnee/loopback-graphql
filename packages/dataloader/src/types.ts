import {BindingAddress} from '@loopback/context';
import DataLoader from 'dataloader';

export interface DataLoaderMethodDecoratorMetadata<K, V, C> {
  loaderBindingKey: BindingAddress<DataLoader<K, V, C>>;
}

export interface DataLoaderClassDecoratorMetadata<K, V, C> {
  options?: DataLoader.Options<K, V, C>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DataLoaderProviderInterface<K, V, C = K> {
  load(keys: ReadonlyArray<K>): PromiseLike<ArrayLike<V | Error>>;
}
