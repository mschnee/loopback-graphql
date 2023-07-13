import {type NameOrClassOrTypeThunk, type OptionsOrThunk} from '../types';

export type OptOrThunkResult<T> = [T | undefined, NameOrClassOrTypeThunk];
export function getOptionsAndThunk<T>(
  maybeThunk: NameOrClassOrTypeThunk,
  opts?: OptionsOrThunk<T>,
): OptOrThunkResult<T> {
  if (maybeThunk && typeof maybeThunk === 'function') {
    return [opts as T, maybeThunk];
  } else {
    return [undefined, opts as NameOrClassOrTypeThunk];
  }
}
