import { InputType, InputTypeCastWithunknown } from "../classify";
import { DeepReadonly, FixStringName, HexColorString } from "../util";

export type FullArg = `[${string}${`:${InputType}` | ""}${`=${string}` | ""}]`;
export type FindName<A extends FullArg> = FixStringName<
    A extends `[${infer N}:${string}=${string}]`
    ? N
    : A extends `[${infer N}:${string}]`
    ? N
    : A extends `[${infer N}=${string}]`
    ? N
    : A extends `[${infer N}]`
    ? N
    : never
>;
export type FixType<T extends string> = FixStringName<T> extends InputType ? FixStringName<T> : "unknown"
export type FindType<A extends FullArg> = FixStringName<
    A extends `[${string}:${infer T}=${string}]`
    ? FixType<T>
    : A extends `[${string}:${infer T}]`
    ? FixType<T>
    : "string"
>;
export type FindValue<A extends FullArg> =
    A extends `[${string}:${string}=${infer V}]`
    ? V
    : A extends `[${string}=${infer V}]`
    ? V
    : ""
    ;
export type FindArgumentTexts<T extends string> =
    T extends `${string}[${infer A}]${string}`
    ? [`[${A}]`, ...FindArgumentTexts<T extends `${string}[${string}]${infer B}` ? B : "">]
    : [];
export type ArgumentMap<T extends string, _L extends Record<string, unknown>> = DeepReadonly<{
    [K in FindArgumentTexts<T>[number]as FindName<K>]: InputTypeCastWithunknown[FindType<K>];
}>;
export type DefaultMap<T extends string> = DeepReadonly<{
    [K in FindArgumentTexts<T>[number]as FindName<K>]: ParseValue<FindValue<K>>;
}>;
export type ParseValue<T extends string> =
    T extends `${infer N extends number}` ? N :
    T extends `"${infer S extends string}"` ? S :
    T extends HexColorString ? T :
    T extends "true" ? true :
    T extends "false" ? false :
    unknown;