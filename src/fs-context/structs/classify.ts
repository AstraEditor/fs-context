import { HexColorString } from "./util";

export const blockTypes = ["command", "reporter", "boolean", "label", "separator", "button", "event", "hat"] as const;
export type BlockType = typeof blockTypes[number];
export type BlockTypeStored = Exclude<BlockType, "boolean"> | "Boolean";

export type InputTypeCast = {
    string: string;
    number: number;
    bool: boolean;
    menu: string;
    angle: number;
    color: HexColorString;
    "hat-param": string;
};
export type InputTypeCastWithunknown = InputTypeCast & {
    unknown: unknown;
};
export type InputType = keyof InputTypeCast;
export type InputTypeStored = Exclude<InputType, "hat-param" | "bool"> | "Boolean" | "ccw_hat_parameter";
export const casterMap: {
    [K in InputType]: (value: string) => InputTypeCast[K]
} = {
    string: String,
    number: Number,
    bool: Boolean,
    menu: String,
    angle: Number,
    color: (value: string) => String(value) as HexColorString,
    "hat-param": String,
};
export const inputTypes = Object.keys(casterMap) as InputType[];