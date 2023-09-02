export function escapeString(str: string) {
  return (
    "'" +
    String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/'/g, "\\'") +
    "'"
  );
}
