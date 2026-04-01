import { MenuItem } from "fs-context/structs/metadata";
import { regexMap } from "./base";
import { MenuItemStored } from "fs-context/structs/stored";

export function toMenuItem(inputData: string | MenuItem[] | MenuItem): MenuItem[] {
    if (Array.isArray(inputData)) return inputData;
    if (typeof inputData !== "string") return [inputData];
    const result: MenuItem[] = [];
    const matches = inputData.matchAll(regexMap.KEY_VALUE_ARRAY);
    for (const match of matches) {
        const key = match[1] || match[2];
        const value = match[3] || match[4] || key;
        if (key) {
            result.push({ key, value });
        }
    }
    return result;
}
export function storeItem(item: MenuItem): MenuItemStored {
    return {
        text: item.key,
        value: item.value ?? item.key,
    };
}