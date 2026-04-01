import { BuilderExcludedKeys } from "./interface";
import { BlockMetadata, MenuMetadata, ExtensionMetadata, MenuItem, LoaderMetadata, TranslatorMetadata, ExtensionHookStore, DeskMetadata, BlockActionExecute, MenuReadback } from "./metadata";
import { HexColorString } from "./util";

export interface ExtensionBuilder<
    B extends BlockMetadata[] = [],
    M extends MenuMetadata[] = [],
    L extends Record<string, unknown> = Record<string, unknown>
> extends BuilderExcludedKeys<ExtensionMetadata<B, M, L>, "translators" | "blocks" | "menus" | "loaders" | "hooks", ExtensionBuilder<B, M, L>> {
    separator(): ExtensionBuilder<B, M, L>;
    label(text: string): ExtensionBuilder<B, M, L>;
    block<N extends BlockMetadata>(md: N): ExtensionBuilder<[...B, N], M, L>;
    menu<N extends MenuMetadata>(md: N): ExtensionBuilder<B, [...M, N], L>;
    loader<N extends string, O>(name: N, md: LoaderMetadata<O>): ExtensionBuilder<B, M, L & { [K in N]: O }>;
    theme(color: HexColorString, offset?: number): ExtensionBuilder<B, M, L>;
    use(...translators: TranslatorMetadata[]): ExtensionBuilder<B, M, L>;
    use<D extends DeskMetadata>(...desks: D[]): ExtensionBuilder<[...B, ...(D extends DeskMetadata<string, infer NB> ? NB : [])], M, L>;
    on<E extends keyof ExtensionHookStore>(event: E, handler: ExtensionHookStore[E]): ExtensionBuilder<B, M, L>;
}
export interface BlockBuilder<
    Text extends string = string,
    Value = unknown,
    Loaders extends Record<string, unknown> = Record<string, unknown>
> extends BuilderExcludedKeys<BlockMetadata<Text, Value, Loaders>, "parts", BlockBuilder<Text, Value, Loaders>> {
    action<NewValue>(method: BlockActionExecute<Text, Value, Loaders>): BlockBuilder<Text, NewValue, Loaders>;
    text<NewText extends string>(t: NewText): BlockBuilder<NewText, Value, Loaders>;
    raw(data: object): BlockBuilder<Text, Value, Loaders>;
}
export interface MenuBuilder<
    Name extends string = string,
    Items extends MenuItem[] = [],
    Extension extends ExtensionMetadata = ExtensionMetadata
> extends BuilderExcludedKeys<MenuMetadata<Name, Items>, "readback", MenuBuilder<Name, Items, Extension>> {
    name<N extends string>(name: N): MenuBuilder<N, Items, Extension>;
    item<K extends string, V extends string, N extends MenuItem<K, V>>(key: K, value?: V): MenuBuilder<Name, [...Items, N], Extension>;
    readback(method: MenuReadback<Name, Items>): MenuBuilder<Name, Items, Extension>;
}
export interface DeskBuilder<
    Title extends string = string,
    Blocks extends BlockMetadata[] = BlockMetadata[]
> extends BuilderExcludedKeys<DeskMetadata<Title, Blocks>, "blocks" | "pluginType" | "title", DeskBuilder<Title, Blocks>> {
    title<NewTitle extends string>(title: NewTitle): DeskBuilder<NewTitle, Blocks>;
    block<NewBlock extends BlockMetadata>(block: NewBlock): DeskBuilder<Title, [...Blocks, NewBlock]>;
    label<Text extends string>(text: Text): DeskBuilder<Title, Blocks>;
    button<Text extends string>(text: Text, action: () => void | Promise<void>): DeskBuilder<Title, Blocks>;
}