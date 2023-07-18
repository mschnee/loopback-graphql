import {BindingScope, inject, injectable, type BindingAddress} from '@loopback/context';
import DataLoader from 'dataloader';

type MaybeProperty = string | symbol;

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
    target: any,
    property?: MaybeProperty,
    propertyDescriptor?: TypedPropertyDescriptor<any> | number,
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
      return injectable.provider(binding => {
        binding.inScope(BindingScope.REQUEST);
      })(target);
    } else {
      throw new Error('@dataloader can only be used on a class or a method parameter for injection.');
    }
  };
}

export interface DataLoaderMethodDecoratorMetadata<K, V, C> {
  loaderBindingKey: BindingAddress<DataLoader<K, V, C>>;
}

export interface DataLoaderClassDecoratorMetadata<K, V, C> {
  options?: DataLoader.Options<K, V, C>;
}

function isDecoratingParameter(
  obj: any,
  target: any,
  property?: MaybeProperty,
  propertyDescriptor?: TypedPropertyDescriptor<any> | number,
): obj is BindingAddress<any> {
  return target && !property && Number.isInteger(propertyDescriptor);
}

function isDecoratingClass<K, V, C>(
  obj: any,
  target: any,
  property?: MaybeProperty,
  propertyDescriptor?: TypedPropertyDescriptor<any> | number,
): obj is DataLoader.Options<K, V, C> {
  return target && !property && !propertyDescriptor;
}
