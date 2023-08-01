import {
  BindingScope,
  Constructor,
  MetadataInspector,
  Provider,
  ValueOrPromise,
  inject,
  injectable,
  type BindingAddress,
} from '@loopback/context';
import DataLoader from 'dataloader';
import {DataloaderClassKey} from './keys.js';
import {DataLoaderClassDecoratorMetadata, DataLoaderProviderInterface} from './types.js';

type MaybeProperty = string | symbol;

const LoaderSymbol = Symbol('dataloader');
function boundValueMethod<K, V, C = K>(
  this: DataLoaderProviderInterface<K, V, C> & {[LoaderSymbol]?: DataLoader<K, V, C>},
): ValueOrPromise<DataLoader<K, V, C>> {
  const metadata = MetadataInspector.getClassMetadata<DataLoaderClassDecoratorMetadata<K, V, C>>(
    DataloaderClassKey,
    Object.getPrototypeOf(this),
  );
  if (!this[LoaderSymbol]) {
    this[LoaderSymbol] = new DataLoader<K, V, C>(this.load.bind(this), metadata?.options);
  }
  return this[LoaderSymbol];
}

/**
 * Class decorator version only, a wrapper for `@injectable.provider()`.
 * @param options
 */
export function dataloader<K, V, C = K>(options?: DataLoader.Options<K, V, C>): ClassDecorator;

/**
 * Parameter decorator version for injection, a wrapper for `@inject()`
 * @param options
 */
export function dataloader<K, V, C = K>(options?: BindingAddress<DataLoader<K, V, C>>): ParameterDecorator;

/**
 * decorator implementation
 * @param options
 * @returns
 */
export function dataloader<K, V, C = K>(
  options?: BindingAddress<DataLoader<K, V, C>> | DataLoader.Options<K, V, C>,
): ClassDecorator | ParameterDecorator {
  return function dataloaderWrapper(
    target: Function,
    property?: MaybeProperty,
    propertyDescriptor?: TypedPropertyDescriptor<unknown> | number,
  ) {
    if (isDecoratingParameter(options, target, property, propertyDescriptor) && 'undefined' === typeof property) {
      // return MethodDecoratorFactory.createDecorator<DataLoaderMethodDecoratorMetadata<K, V, C>>(
      //   DataloaderParameterKey,
      //   {loaderBindingKey: options},
      //   {decoratorName: '@dataloader'},
      // )(target, property!, propertyDescriptor!);
      return inject(options, {decorator: '@dataloader'})(target, property, propertyDescriptor!);
    } else if (isDecoratingClass(options, target, property, propertyDescriptor)) {
      if (!Object.hasOwn(target.prototype, 'load')) {
        throw new Error('Decorating a class with `@dataloader({options})` requires a `load()` method on the class.');
      }
      if (!Object.hasOwn(target.prototype, 'value')) {
        target.prototype.value = boundValueMethod; //.bind(target);
      }

      return injectable.provider(binding => {
        binding.inScope(BindingScope.REQUEST);
      })(target as Constructor<Provider<DataLoader<K, V, C>>>);
    } else {
      throw new Error('@dataloader can only be used on a class or a method parameter for injection.');
    }
  };
}

function isDecoratingParameter<K, V, C = K>(
  obj: undefined | BindingAddress<DataLoader<K, V, C>> | DataLoader.Options<K, V, C>,
  target: unknown,
  property?: MaybeProperty,
  propertyDescriptor?: TypedPropertyDescriptor<unknown> | number,
): obj is BindingAddress<DataLoader<K, V, C>> {
  return !!target && !property && Number.isInteger(propertyDescriptor);
}

function isDecoratingClass<K, V, C = K>(
  obj: undefined | BindingAddress<DataLoader<K, V, C>> | DataLoader.Options<K, V, C>,
  target: unknown,
  property?: MaybeProperty,
  propertyDescriptor?: TypedPropertyDescriptor<unknown> | number,
): obj is DataLoader.Options<K, V, C> {
  return !!target && !property && !propertyDescriptor;
}
