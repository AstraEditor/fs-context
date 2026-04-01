import type { Connection, Input } from "blockly";
import type { ScratchRuntime } from "fs-context";
import type { ScratchBlock, ScratchBlocks } from "fs-context/structs/cast";
import type { InputTypeStored } from "fs-context/structs/classify";

export function attachShadow(block: ScratchBlock, input: Input, argumentType: InputTypeStored, blockly: ScratchBlocks, defaultValue = "") {
    if (argumentType === "number" || argumentType === "string") {
        const blockType = argumentType === "number" ? "math_number" : "text";
        blockly.Events.disable();
        const newBlock = block.workspace.newBlock(blockType) as ScratchBlock;
        try {
            if (argumentType === "number") {
                newBlock.setFieldValue(defaultValue, "NUM");
            } else {
                newBlock.setFieldValue(defaultValue, "TEXT");
            }
            newBlock.setShadow(true);
            if (!block.isInsertionMarker()) {
                newBlock.initSvg();
                newBlock.render(false);
            }
        } finally {
            blockly.Events.enable();
        }
        if (blockly.Events.isEnabled()) {
            blockly.Events.fire(new blockly.Events.BlockCreate(newBlock));
        }
        newBlock.outputConnection?.connect(input.connection as Connection);
    }
}
export async function appendArgumentInput(block: ScratchBlock, inputKey: string, fieldKey: string, blockly: ScratchBlocks, value: unknown): Promise<Input> {
    return new Promise((resolve) => {
        const input = block.appendValueInput(inputKey).appendField(fieldKey);
        attachShadow(block, input, "string", blockly, String(value));
        setTimeout(() => {
            input.setVisible(false);
            block.render();
            resolve(input);
        }, 0);
    });
}
export function obtainBlockly(runtime: ScratchRuntime): ScratchBlocks | null {
    return (
        runtime?.scratchBlocks ||
        window.ScratchBlocks
    ) as ScratchBlocks ?? null;
}