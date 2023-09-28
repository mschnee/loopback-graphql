import {Change} from 'diff';
export function diffsToString(diffs: Change[]): string {
  let result = '';

  diffs.forEach(part => {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added ? '+ ' : part.removed ? '- ' : '  ';
    result += color + part.value;
  });

  return result;
}
