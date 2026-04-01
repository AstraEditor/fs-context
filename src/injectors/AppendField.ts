import { BlockStored, ExtensionInfoStored } from "fs-context";
import { ExtensionBlocklyInjector } from "fs-context/inject/blockly";
import { ScratchBlock } from "fs-context/structs/cast";
import { appendArgumentInput } from "fs-context/utils/blockly";

interface FieldConfig {
    fields: Record<string, unknown>;
}
export default class AppendField extends ExtensionBlocklyInjector {
    protected isAvailableBlock(blockInfo: BlockStored): boolean {
        return Object.hasOwn(blockInfo, "fields");
    }
    protected configMap(originBlock: BlockStored): BlockStored {
        return originBlock;
    }
    protected getInfo(originInfo: ExtensionInfoStored): ExtensionInfoStored {
        return originInfo;
    }
    inject(): void { }
    protected init(block: ScratchBlock, myInfo: BlockStored & FieldConfig): void {
        for (const [key, value] of Object.entries(myInfo.fields)) {
            appendArgumentInput(block, key, key, this.blockly, value);
        }
    }
    protected initBlockly(): void { }
}