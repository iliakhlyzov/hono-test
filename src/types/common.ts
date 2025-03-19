export type CamelCase<S extends string> = S extends `${infer First}_${infer Rest}`
    ? `${First}${Capitalize<CamelCase<Rest>>}`
    : S;

export type ConvertKeysToCamel<T> = {
    [K in keyof T as CamelCase<K & string>]: T[K];
};