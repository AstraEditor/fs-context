import { casterMap, InputType, inputTypes } from "fs-context/structs/classify";
import { unquote } from "fs-context/structs/util";
import { regexMap } from "./base";
import { BlockArgumentStored } from "fs-context/structs/stored";
import { argumentTypeParser } from "fs-context";

export interface TextPart {
    type: "text" | "arg";
    content: string;
    inputType: InputType;
    defaultValue: string;
}
export function parseArg(inputStr: string): TextPart {
    const match = inputStr.match(regexMap.ARG_SLOT);
    if (!match) {
        return {
            type: "text",
            content: inputStr,
            inputType: "string",
            defaultValue: ""
        };
    }
    const name = unquote(match[1]).trim();
    const type = (match[2] !== undefined ? unquote(match[2]) : "string").trim();
    const value = (match[3] !== undefined ? unquote(match[3]) : "").trim();
    return {
        type: "arg",
        content: name,
        inputType: type as InputType,
        defaultValue: value,
    };
}
export function isStoredType(type: string): type is InputType {
    return inputTypes.includes(type as InputType);
}
export function toParts(text: string): TextPart[] {
    const parts: TextPart[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regexMap.PART_TOTAL.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                content: text.slice(lastIndex, match.index),
                inputType: "string",
                defaultValue: ""
            });
        }
        parts.push(parseArg(`[${match[1]}]`));
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push({
            type: "text",
            content: text.slice(lastIndex),
            inputType: "string",
            defaultValue: ""
        });
    }
    return parts;
}
export function storeArg(part: TextPart): BlockArgumentStored | null {
    if (part.type === "arg") {
        const result: BlockArgumentStored = {
            type: "string",
        };
        if (isStoredType(part.inputType) && part.inputType !== "menu") {
            result.type = argumentTypeParser.store(part.inputType);
        }
        if (part.inputType === "menu") {
            result.menu = part.defaultValue || part.content;
        } else if (part.defaultValue) {
            result.defaultValue = casterMap[part.inputType](part.defaultValue);
        }
        return result;
    } else {
        return null;
    }
}
export function storeText(text: string): string {
    return toParts(text).map(part => part.type === "arg" ? `[${part.content}]` : part.content).join("");
}
export function toMetadata(parts: TextPart[]): string {
    return parts.map(part => part.type === "arg" ? `[${part.content}:${part.inputType}=${part.defaultValue}]` : part.content).join("");
}