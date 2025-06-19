type CaseStyle = 'snake_to_camel' | 'camel_to_snake';

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function convertCase<T>(input: T, mode: CaseStyle): T {
  if (Array.isArray(input)) {
    return input.map((item) => convertCase(item, mode)) as unknown as T;
  }

  if (input !== null && typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in input as Record<string, unknown>) {
      // eslint-disable-next-line no-prototype-builtins
      if ((input as Record<string, unknown>).hasOwnProperty(key)) {
        const newKey = mode === 'snake_to_camel' ? toCamelCase(key) : toSnakeCase(key);
        result[newKey] = convertCase((input as Record<string, unknown>)[key], mode);
      }
    }

    return result as T;
  }

  return input;
}
