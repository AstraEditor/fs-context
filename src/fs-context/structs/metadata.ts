import { BlockUtility, Target } from "scratch-vm";
import { BlockType } from "./classify";
import { ArgumentMap } from "./parser/compiltime";
import { TextPart } from "./parser/runtime/text";
import { ContextEnvironment, ExtensionStored, ScratchRuntime, ScratchTranslateKeyDescriptor } from "./stored";
import { HexColorString } from "./util";

export interface ExtensionHookStore {
    stored?(stored: ExtensionStored): void;
}
export interface ExtensionMetadata<
    Blocks extends BlockMetadata[] = BlockMetadata[],
    Menus extends MenuMetadata[] = MenuMetadata[],
    Loaders extends Record<string, unknown> = Record<string, unknown>
> {
    id: string;
    name: string;
    description: string;
    blocks: Blocks;
    menus: Menus;
    loaders: Loaders;
    allowSandbox: boolean;
    color: [HexColorString | null, HexColorString | null, HexColorString | null];
    translators: TranslatorMetadata[];
    hooks: ExtensionHookStore;
}
export type BlockActionExecute<
    Text extends string = string,
    Value = unknown,
    Loaders extends Record<string, unknown> = Record<string, unknown>
> = (args: ArgumentMap<Text, Loaders>, target: BlockUtility) => Value;
export interface BlockMetadata<
    Text extends string = string,
    Value = unknown,
    Loaders extends Record<string, unknown> = Record<string, unknown>
> {
    parts(): TextPart[];
    opcode: string;
    text: Text;
    type: BlockType;
    action: BlockActionExecute<Text, Value, Loaders>;
    raw: object;
}
export interface MenuItem<Key extends string = string, Value = unknown> {
    key: Key;
    value: Value;
}
export type MenuReadback<N extends string, I extends MenuItem[]> = (menu: MenuMetadata<N, I>, target?: Target) => (MenuItem | string)[];
export interface MenuMetadata<Name extends string = string, Items extends MenuItem[] = MenuItem[]> {
    name: Name;
    items: Items;
    reportable: boolean;
    readback?: MenuReadback<Name, Items>;
}
export interface LoaderMetadata<Output = unknown> {
    (args: string): Output;
}

export interface PluginTypeMap {
    translator: TranslatorMetadata;
    desk: DeskMetadata;
}
export type PluginType = keyof PluginTypeMap;
export interface PluginableMetadata<Type extends PluginType = PluginType> {
    pluginType: Type;
}
//这个翻译库的格式是{[键]:{[语言]:内容}}，不是原版的{[语言]:{[键]:内容}}
export type TranslationStore = Record<string, Record<string, string>>;
export interface TranslatorMetadata<Store extends TranslationStore = TranslationStore> extends PluginableMetadata<"translator"> {
    write<K extends string, V extends Record<string, string>>(key: K, value: V): TranslatorMetadata<Store & Record<K, V>>;
    init(
        env: ContextEnvironment,
        runtime: ScratchRuntime
    ): TranslatorMetadata<Store>;
    <K extends keyof Store, L extends string>(key: ScratchTranslateKeyDescriptor<K & string>, language: L): Store[K][L];
    get store(): Store;
}
export interface DeskMetadata<Title extends string = string, Blocks extends BlockMetadata[] = BlockMetadata[]> extends PluginableMetadata<"desk"> {
    title: Title;
    blocks: Blocks;
}