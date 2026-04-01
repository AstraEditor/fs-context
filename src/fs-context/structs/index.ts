import { colorParser, keyParser, pluginManager, textParser } from "fs-context";
import { ExtensionBuilder, BlockBuilder, MenuBuilder, DeskBuilder } from "./builder";
import { blockTypes, BlockType } from "./classify";
import { BlockTypeSelector } from "./interface";
import { BlockMetadata, MenuMetadata, MenuItem, LoaderMetadata, TranslatorMetadata, TranslationStore, ExtensionHookStore, DeskMetadata, BlockActionExecute, MenuReadback } from "./metadata";
import { equalPluginType, HexColorString } from "./util";
import { ContextEnvironment, ScratchRuntime, ScratchTranslateKeyDescriptor } from "./stored";
import md5 from "md5";

export function extension<
    B extends BlockMetadata[] = [],
    M extends MenuMetadata[] = [],
    L extends Record<string, LoaderMetadata> = Record<string, LoaderMetadata>
>(): ExtensionBuilder<B, M, L> {
    let { name, description } = fsContext.extension;
    let allowSandbox = true;
    const blocks: B = [] as unknown as B;
    const menus: M = [] as unknown as M;
    const loaders: L = {} as unknown as L;
    const translators: TranslatorMetadata[] = [];
    const hooks: ExtensionHookStore = {};
    const defaultTranslator = translator();
    let color1: HexColorString | null = null;
    let color2: HexColorString | null = null;
    let color3: HexColorString | null = null;
    return {
        id() {
            return this;
        },
        name(v) {
            name = v;
            return this;
        },
        description(v) {
            description = v;
            return this;
        },
        menu<N extends MenuMetadata>(md: N): ExtensionBuilder<B, [...M, N], L> {
            menus.push(md);
            return this as unknown as ExtensionBuilder<B, [...M, N], L>;
        },
        block<N extends BlockMetadata>(md: N): ExtensionBuilder<[...B, N], M, L> {
            blocks.push(md);
            defaultTranslator.write(keyParser.blockText(fsContext.extension.id, md), { [fsContext.extension.language]: textParser.storeText(md.text) });
            return this as unknown as ExtensionBuilder<[...B, N], M, L>;
        },
        loader<N extends string, O>(name: N, md: LoaderMetadata<O>): ExtensionBuilder<B, M, L & { [K in N]: O; }> {
            loaders[name] = md as unknown as L[N];
            return this as unknown as ExtensionBuilder<B, M, L & { [K in N]: O; }>;
        },
        allowSandbox(v) {
            allowSandbox = v;
            return this;
        },
        theme(color, offset = 0.15) {
            color1 = color;
            color2 = colorParser.darken(color, offset);
            color3 = colorParser.darken(color, offset * 2);
            return this;
        },
        color(v) {
            color1 = v[0];
            color2 = v[1];
            color3 = v[2];
            return this;
        },
        separator() {
            blocks.push(blockType.separator("").build());
            return this;
        },
        label(text) {
            blocks.push(blockType.label("").text(text).build());
            return this;
        },
        use(...plugins: DeskMetadata[] | TranslatorMetadata[]) {
            for (const plugin of plugins) {
                if (equalPluginType(plugin, "desk")) {
                    for (const block of plugin.blocks) {
                        this.block(block);
                    }
                } else if (equalPluginType(plugin, "translator")) {
                    translators.push(plugin);
                }
            }
            return this;
        },
        on(event, handler) {
            hooks[event] = handler;
            return this;
        },
        build() {
            return {
                id: fsContext.extension.id,
                name,
                description,
                blocks,
                menus,
                loaders,
                allowSandbox,
                color: [color1, color2, color3],
                translators: [defaultTranslator, ...translators],
                hooks
            };
        },
    };
};
export const blockType: BlockTypeSelector = new Proxy({}, {
    get(_, prop) {
        if (blockTypes.includes(prop as BlockType)) {
            let blockType = prop as BlockType;
            return <L extends Record<string, unknown> = Record<string, unknown>, T extends string = string, V = unknown>(opcode: string): BlockBuilder<T, V, L> => {
                let text = "" as unknown as T;
                let action: BlockActionExecute<T, V, L> = (_: unknown) => null as unknown as V;
                const raw = {};
                return {
                    opcode(v) {
                        opcode = v;
                        return this;
                    },
                    action<NewValue>(method: BlockActionExecute<T, V, L>): BlockBuilder<T, NewValue, L> {
                        action = method;
                        return this as unknown as BlockBuilder<T, NewValue, L>;
                    },
                    text<NT extends string>(t: NT & T) {
                        text = t;
                        return this as unknown as BlockBuilder<NT, V, L>;
                    },
                    type(v) {
                        blockType = v;
                        return this;
                    },
                    build() {
                        return {
                            opcode,
                            text,
                            action,
                            type: blockType,
                            raw,
                            parts() {
                                return textParser.toParts(text);
                            },
                        };
                    },
                    raw(data) {
                        Object.assign(raw, data);
                        return this;
                    },
                };
            };
        }
    }
}) as BlockTypeSelector;
export function menu<N extends string, I extends MenuItem[]>(name: N): MenuBuilder<N, I> {
    let reportable: boolean = true;
    let readback: MenuReadback<N, I> | undefined = undefined;
    const items = [] as unknown as I;
    return {
        name<NN extends string>(v: NN) {
            name = v as unknown as N;
            return this as unknown as MenuBuilder<NN, I>;
        },
        item<K extends string, V, NI extends MenuItem = MenuItem<K, V>>(key: K, value?: V): MenuBuilder<N, [...I, NI]> {
            items.push({ key, value });
            return this as unknown as MenuBuilder<N, [...I, NI]>;
        },
        reportable(v) {
            reportable = v;
            return this;
        },
        readback(v) {
            readback = v;
            return this;
        },
        items(v) {
            items.push(...v);
            return this;
        },
        build() {
            return {
                name,
                items,
                reportable,
                readback
            };
        }
    };
}
export type StoreSelf<T extends object> = {
    [K in keyof T]: T[K];
} & {
    data: T;
    read<K extends keyof T>(key: K): T[K];
    write<K extends keyof T>(key: K, value: T[K]): void;
}
export function remoteStore<T extends object>(data: T): StoreSelf<T> {
    return {
        ...data,
        data,
        read(key) {
            return data[key];
        },
        write(key, value) {
            data[key] = value;
        }
    };
}
export function translator(): TranslatorMetadata {
    const store: TranslationStore = {};
    let env: ContextEnvironment | null = null;
    let runtime: ScratchRuntime | null = null;
    const result: TranslatorMetadata = Object.assign((key: ScratchTranslateKeyDescriptor) => {
        if (!env || !runtime) throw new Error("Failed to translate: not initialized yet.");
        return pluginManager.call(fsContext.platform, "readTranslationKey", [env, runtime, key]).data ?? key.default;
    }, {
        pluginType: "translator" as const,
        write<K extends string, V extends Record<string, string>>(key: K, value: V) {
            store[key] = value;
            return result as unknown as TranslatorMetadata<TranslationStore & Record<K, V>>;
        },
        init(newEnv: ContextEnvironment, newRuntime: ScratchRuntime) {
            env = newEnv;
            runtime = newRuntime;
            return result;
        },
        get store() {
            return store;
        }
    });
    return result;
}
export function desk<T extends string, B extends BlockMetadata[]>(initialTitle: T): DeskBuilder<T, B> {
    const blocks: BlockMetadata[] = [];
    let title: string = initialTitle;
    return {
        title<N extends string>(v: N) {
            title = v;
            return this as unknown as DeskBuilder<N, B>;
        },
        block<N extends BlockMetadata>(block: N) {
            blocks.push(block);
            return this as unknown as DeskBuilder<T, [...B, N]>;
        },
        label(text) {
            blocks.push(blockType.label().text(text).build());
            return this;
        },
        button(text, action) {
            blocks.push(blockType.button(`button_${md5(text)}`).text(text).action(action).build());
            return this;
        },
        build() {
            return {
                title: title as T,
                blocks: blocks as B,
                pluginType: "desk"
            };
        }
    };
}

export * from "./metadata";
export * from "./stored";