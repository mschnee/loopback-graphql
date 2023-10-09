/// <reference types="chai" />
interface DifferentFromOpts {
  showSpace?: boolean;
  relaxedSpace?: boolean;
  context?: number;
}

declare module 'chai-diff' {
  interface ChaiDiff extends Chai.ChaiPlugin {
    stringify(v: any): string;

    /** Normalize whitespace in strings for relaxed comparison. */
    normalize(values: any[]): any;
    diffLines(expected: string, actual: string, options?: DifferentFromOpts): {diffCount: number; diffStr: string};
  }

  const chaiDiff: ChaiDiff;
  export default chaiDiff;
}

declare namespace Chai {
  interface Assertion {
    /**
     * Diff the actual value against an expected value line by line and if different,
     * show a full difference with lines added and lines removed. If non-string values
     * are being compared, they are JSON stringified first.
     *
     * Takes an optional options object with flags for:
     *   - showSpace (false) whether to replace whitespace with unicode dots and arrows
     *   - relaxedSpaces (false) whether to normalize strings before comparing them.
     *         This removes empty lines, spaces from the beginning and end of each line
     *         and compresses sequences of whitespace to a single space.
     */
    differentFrom(expected: any, opt?: DifferentFromOpts): Assertion;
  }
  interface Assert {
    /**
     * Diff the actual value against an expected value line by line and if different,
     * show a full difference with lines added and lines removed. If non-string values
     * are being compared, they are JSON stringified first.
     *
     * Takes an optional options object with flags for:
     *   - showSpace (false) whether to replace whitespace with unicode dots and arrows
     *   - relaxedSpaces (false) whether to normalize strings before comparing them.
     *         This removes empty lines, spaces from the beginning and end of each line
     *         and compresses sequences of whitespace to a single space.
     */
    differentFrom(val: any, exp: any, opt?: DifferentFromOpts, msg?: string): void;
  }
}
