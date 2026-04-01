import { BlockType, BlockTypeStored } from "fs-context/structs/classify";

export const map = new Map<BlockType, BlockTypeStored>();
map.set("boolean", "Boolean");
export function store(type: BlockType): BlockTypeStored {
    return (map.get(type) ?? type) as BlockTypeStored;
}