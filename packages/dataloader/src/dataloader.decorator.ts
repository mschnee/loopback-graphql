import {BindingScope, inject, injectable, type BindingAddress} from '@loopback/context';
import DataLoader from 'dataloader';

type MaybeProperty = string | symbol;
export function dataloader<K, V, C = K>(options?: DataLoader.Options<K, V, C> | BindingAddress<DataLoader<K, V, C>>) {
  return function dataloaderWrapper(
    target: any,
    property?: MaybeProperty,
    propertyDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (isDecoratingMethod(options, target, property, propertyDescriptor)) {
      // return MethodDecoratorFactory.createDecorator<DataLoaderMethodDecoratorMetadata<K, V, C>>(
      //   DataloaderParameterKey,
      //   {loaderBindingKey: options},
      //   {decoratorName: '@dataloader'},
      // )(target, property!, propertyDescriptor!);
      return inject(options, {decorator: '@dataloader'})(target, property!.toString(), propertyDescriptor!);
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

function isDecoratingMethod(
  obj: any,
  target: any,
  property?: MaybeProperty,
  propertyDescriptor?: TypedPropertyDescriptor<any>,
): obj is BindingAddress<any> {
  return target && property && propertyDescriptor;
}

function isDecoratingClass<K, V, C>(
  obj: any,
  target: any,
  property?: MaybeProperty,
  propertyDescriptor?: TypedPropertyDescriptor<any>,
): obj is DataLoader.Options<K, V, C> {
  return target && !property && !propertyDescriptor;
}
