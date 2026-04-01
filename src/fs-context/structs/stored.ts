import { BlockTypeStored, InputTypeStored } from "./classify";
import { ExtensionBuilder } from "./builder";
import { ExtensionMetadata, TranslationStore, BlockMetadata, MenuMetadata, BlockActionExecute } from "./metadata";
import { HexColorString } from "./util";
import { ScratchBlocks } from "./cast";

export interface ScratchVM extends VM {
    scratchBlocks?: ScratchBlocks;
    runtime: NonNullable<ScratchRuntime>;
    vm: ScratchVM;
    startHats?: VM.Runtime["startHats"];
}

export interface BlockStored {
    opcode?: string;
    blockType: BlockTypeStored;
    text: string;
    arguments?: Record<string, BlockArgumentStored>;
    onClick?: BlockActionExecute;
    func?: BlockActionExecute | string;
}
export interface BlockArgumentStored {
    type: InputTypeStored;
    defaultValue?: unknown;
    menu?: string;
}
export interface MenuItemStored {
    text: string;
    value: unknown;
}
export interface MenuStored {
    items: (string | MenuItemStored)[] | string;
    acceptReporters: boolean;
}
export interface ExtensionInfoStored {
    id: string;
    name: string;
    blocks: (BlockStored | "---")[];
    menus: Record<string, MenuStored>;
    color1?: HexColorString;
    color2?: HexColorString;
    color3?: HexColorString;
}
export type ExtensionStored = {
    getInfo(): ExtensionInfoStored;
    runtime?: ScratchRuntime;
} & Record<string, unknown>;
export type ScratchRuntime = null | {
    extensions: {
        unsandboxed: boolean;
        register(extension: ExtensionStored): void;
        unregister(extension: ExtensionStored): void;
    }
    translate: ScratchTranslate;
    scratchBlocks: ScratchBlocks;
    getFormatMessage: (key: TranslationStore) => (key: ScratchTranslateKeyDescriptor) => string; //这里是原版的{[语言]:{[键]:内容}}，虽然位置不一样但是数据结构一样
} & VM.Runtime;
export interface ScratchTranslateKeyDescriptor<K extends string = string> {
    id?: K;
    default: string;
    description?: string;
}
export interface ScratchTranslate {
    (key: ScratchTranslateKeyDescriptor | string): string;
    setup(store: Record<string, Record<string, string>>): void;
    get language(): string;
}
export interface ExtenderData<
    B extends BlockMetadata[] = BlockMetadata[],
    M extends MenuMetadata[] = MenuMetadata[],
    L extends Record<string, unknown> = Record<string, unknown>
> {
    stored: new () => ExtensionStored;
    metadata: ExtensionBuilder<B, M, L>;
}
export interface ExtensionData<
    B extends BlockMetadata[] = BlockMetadata[],
    M extends MenuMetadata[] = MenuMetadata[],
    L extends Record<string, unknown> = Record<string, unknown>
> {
    stored: ExtensionStored;
    metadata: ExtensionMetadata<B, M, L>;
}
export interface ContextEnvironment<
    B extends BlockMetadata[] = BlockMetadata[],
    M extends MenuMetadata[] = MenuMetadata[],
    L extends Record<string, unknown> = Record<string, unknown>
> {
    window: Window;
    extension: ExtensionData<B, M, L>;
    extender: ExtenderData<B, M, L>;
}