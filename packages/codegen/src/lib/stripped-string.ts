import {oneLine} from 'common-tags';

export function strippedString(received?: string | string[]) {
  if (!received) {
    return '';
  } else if (Array.isArray(received)) {
    return oneLine`${received.join('')}`.replace(/\s\s+/g, ' ');
  } else {
    return oneLine`${received}`.replace(/\s\s+/g, ' ');
  }
}
