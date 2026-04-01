import { BlockMetadata, ScratchRuntime } from "fs-context/structs";
import { Runtime } from "scratch-vm";

export interface ContextApi {
    runtime: ScratchRuntime | null;
    startHat(block: string | BlockMetadata): VM.Thread[];
}
export const api: ContextApi = {
    runtime: null,
    startHat(block) {
        return this.runtime?.startHats(`${fsContext.extension.id}_${typeof block === "string" ? block : block.opcode}`) ?? [];
    }
};