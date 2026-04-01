import { BlockMetadata } from "fs-context/structs/metadata";

export function blockText(extensionId: string, blockOrOpcode: BlockMetadata | string) {
    return `${extensionId}.blocks.${typeof blockOrOpcode === "string" ? blockOrOpcode : blockOrOpcode.opcode}.text` as const;
}
export function menuReadback(name: string) {
    return `menuReadback_${name}`;
}