import { defineModLoader } from "fs-context/structs/plugin";
import { api, type, Extension } from "clipcc-extension";
import { BlockType, InputType } from "fs-context/structs/classify";

const blockType = new Map<BlockType, type.BlockType>();
blockType.set("command", 1);
blockType.set("reporter", 2);
blockType.set("boolean", 3);
blockType.set("label", 1);
blockType.set("separator", 1);
const inputType = new Map<InputType, type.ParameterType>();
inputType.set("number", 1);
inputType.set("string", 2);
inputType.set("bool", 3);
inputType.set("color", 5);
inputType.set("angle", 8);

export default defineModLoader({
    id: "clipcc",
    isSandboxed() {
        return false;
    },
    obtainRuntime() {
        return null;
    },
    load() { },
    expose(environment) {
        const { metadata: extension, stored: extensionStored } = environment.extension;
        return class ClipAnonymousExtension extends Extension {
            onInit() {
                extension.blocks.forEach(block => {
                    const param: Record<string, type.ParameterPrototype> = {};
                    block.parts().filter(part => part.type === "arg").forEach(input => {
                        param[input.content] = {
                            type: inputType.get(input.inputType)!,
                            default: input.defaultValue
                        };
                    });
                    api.addBlock({
                        opcode: `fsc.${extension.id}.${block.opcode}`,
                        type: blockType.get(block.type)!,
                        messageId: `fsc.${extension.id}.${block.opcode}.message`,
                        categoryId: `fsc.${extension.id}.category`,
                        param,
                        function: extensionStored[block.opcode] as (args: Record<string, unknown>) => unknown
                    });
                });
            }
            onUninit() {
                api.removeCategory(`fsc.${extension.id}.category`);
            }
        };
    },
});