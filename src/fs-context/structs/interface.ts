import { BlockBuilder } from "./builder";
import { BlockType } from "./classify";

export interface Buildable<out T> {
    build(): T;
};
export type Builder<T, ChainNext = unknown> = Buildable<T> & {
    [K in keyof T]-?: (v: T[K]) => ChainNext;
};
export type BuilderExcludedKeys<
    T,
    K extends keyof Builder<T, unknown> = keyof Builder<T, unknown>,
    C = unknown,
> = Omit<Builder<T, C>, K>;
export type BlockTypeSelector = {
    [T in BlockType]: <L extends Record<string, unknown>, T extends string = string, V = unknown>(opcode?: string) => BlockBuilder<T, V, L>;
};