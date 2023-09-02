import {DecoratorOptions} from '../types.js';

export function formatDecoratorOptions(options: DecoratorOptions, isFirstArgument = true) {
  if (!Object.keys(options).length) {
    return '';
  }
  return (
    (isFirstArgument ? '' : ', ') +
    ('{ ' +
      Object.entries(options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') +
      ' }')
  );
}
