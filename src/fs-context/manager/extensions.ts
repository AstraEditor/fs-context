import { blockTypeParser, menuParser, pluginManager, textParser, keyParser } from "fs-context";
import { ExtensionBuilder } from "fs-context/structs/builder";
import { BlockType } from "fs-context/structs/classify";
import { ExtensionMetadata, BlockMetadata, MenuMetadata } from "fs-context/structs/metadata";
import { menuReadback } from "fs-context/structs/parser/runtime/key";
import { isStoredType } from "fs-context/structs/parser/runtime/text";
import { ExtensionStored, ContextEnvironment, ExtensionInfoStored, BlockStored, ScratchTranslateKeyDescriptor, ScratchRuntime } from "fs-context/structs/stored";
import { BlockUtility } from "scratch-vm";

export function createExtender(md: ExtensionMetadata, initer?: (...args: unknown[]) => void, getBlockText?: (key: ScratchTranslateKeyDescriptor) => string) {
    return class implements ExtensionStored {
        [key: string]: unknown;
        runtime?: ScratchRuntime = undefined;
        constructor(...args: unknown[]) {
            if (initer) {
                initer(...args);
            }
            const stored = this;
            md.blocks.forEach(block => {
                if (block.type === "event") return;
                this[block.opcode] = (args: Record<string, unknown>, util: BlockUtility) => {
                    const inputArgs = { ...args };
                    block.parts().forEach(part => {
                        if (part.type === "arg" && !isStoredType(part.inputType)) {
                            if (part.inputType in md.loaders) {
                                inputArgs[part.content] = (md.loaders[part.inputType] as (data: unknown) => unknown)(inputArgs[part.content]);
                            } else {
                                console.error(`Argument "${part.content}" is not a stored type and no loader named "${part.inputType}" is found.`);
                                if (part.defaultValue) {
                                    inputArgs[part.content] = part.defaultValue;
                                } else {
                                    console.warn(`No default value of "${part.content}" is given.`);
                                    inputArgs[part.content] = null;
                                }
                            }
                        }
                    });
                    return block.action(inputArgs, util);
                };
            });
            md.menus.forEach(menu => {
                if (menu.readback) {
                    this[menuReadback(menu.name)] = (targetId: string) => {
                        console.log(stored);
                        return menu.readback!(menu, stored.runtime?.targets.find(t => t.id === targetId)).flatMap(menuParser.toMenuItem).map(menuParser.storeItem);
                    };
                }
            });
        }
        getInfo() {
            const result: ExtensionInfoStored = {
                id: md.id,
                name: `${md.name}${fsContext.developing ? "(Debug)" : ""}`,
                blocks: md.blocks.map(blockMd => {
                    const result: BlockStored = {
                        opcode: blockMd.opcode,
                        blockType: blockTypeParser.store(blockMd.type as BlockType),
                        text: getBlockText!({
                            id: keyParser.blockText(md.id, blockMd),
                            default: keyParser.blockText(md.id, blockMd)
                        }),
                        arguments: Object.fromEntries(blockMd.parts().map(part => [
                            part.content,
                            textParser.storeArg(part)
                        ]).filter(part => Boolean(part[1])))
                    };
                    if (blockMd.type === "label" || blockMd.type === "separator" || blockMd.type === "button") {
                        delete result.opcode;
                        if (blockMd.type === "label") {
                            delete result.arguments;
                        } else if (blockMd.type === "separator") {
                            return "---";
                        } else if (blockMd.type === "button") {
                            result.onClick = blockMd.action;
                            result.func = blockMd.opcode;
                        }
                    }
                    Object.assign(result, blockMd.raw);
                    return result;
                }),
                menus: Object.fromEntries(md.menus.map(menuMd => [
                    menuMd.name,
                    {
                        items: menuMd.readback ? keyParser.menuReadback(menuMd.name) : menuMd.items.map(menuParser.storeItem),
                        acceptReporters: menuMd.reportable
                    }
                ]))
            };
            if (md.color[0]) result.color1 = md.color[0];
            if (md.color[1]) result.color2 = md.color[1];
            if (md.color[2]) result.color3 = md.color[2];
            return result;
        }
    };
}
export function createContextEnvironment(extension: ExtensionBuilder<BlockMetadata[], MenuMetadata[], Record<string, unknown>>, initer?: (...args: unknown[]) => void, getBlockText?: (key: ScratchTranslateKeyDescriptor) => string): ContextEnvironment {
    const rawExtenderStored = createExtender(extension.build(), undefined, getBlockText);
    const rawExtensionStored = new rawExtenderStored();
    const extenderStored = createExtender(extension.build(), initer, getBlockText);
    return {
        window,
        extension: {
            metadata: extension.build(),
            stored: rawExtensionStored
        },
        extender: {
            metadata: extension,
            stored: extenderStored
        }
    };
}
export function load(environment: ContextEnvironment, runtime: ScratchRuntime, initData: unknown[]) {
    const isSandboxed = pluginManager.call(fsContext.platform, "isSandboxed", [environment, runtime]).data;
    if (fsContext.developing) {
        if (runtime) {
            console.log(`Runtime${isSandboxed ? "(sandboxed)" : ""} obtained:`, runtime);
        } else {
            console.log("No runtime obtained.");
        }
    }
    if (!environment.extension.metadata.allowSandbox && isSandboxed) {
        throw new Error(`Extension "${environment.extension.metadata.name}" doesn't allow sandboxed, but ${fsContext.platform} is running in sandboxed.`);
    }
    environment.extension.stored.runtime = runtime;
    environment.extension.metadata.hooks.stored?.(environment.extension.stored);
    pluginManager.call(fsContext.platform, "load", [environment, runtime, ...initData]);
}