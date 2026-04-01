import { ContextEnvironment, ExtensionStored, ScratchRuntime, ScratchTranslateKeyDescriptor } from "fs-context/structs/stored";
import { TranslatorMetadata } from "./metadata";

/**
 * @description 指的是“ScratchMod”的加载器，不是传统意义的“模组”
 */
export interface ModLoader {
    id: string;
    apply?(this: ModLoader, environment: ContextEnvironment): void;
    initExtender?(this: ModLoader, stored: ExtensionStored, ...args: unknown[]): void;
    isSandboxed(this: ModLoader, environment: ContextEnvironment, runtime: ScratchRuntime): boolean;
    obtainRuntime(this: ModLoader, environment: ContextEnvironment, ...contextData: unknown[]): ScratchRuntime;
    load(this: ModLoader, environment: ContextEnvironment, runtime: ScratchRuntime, ...contextData: unknown[]): void;
    unload?(this: ModLoader, environment: ContextEnvironment, runtime: ScratchRuntime, ...contextData: unknown[]): void;
    expose?(this: ModLoader, environment: ContextEnvironment): unknown;
    setupTranslation?(this: ModLoader, environment: ContextEnvironment, runtime: ScratchRuntime, translators: TranslatorMetadata[]): void;
    readTranslationKey?(this: ModLoader, environment: ContextEnvironment, runtime: ScratchRuntime, key: ScratchTranslateKeyDescriptor): string;
}
export function defineModLoader(loader: ModLoader) {
    return loader;
}