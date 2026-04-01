import { DeepReadonly, HexColorString } from "fs-context/structs/util";
import { regexMap } from "./base";

export type ColorRGB<R extends number = number, G extends number = number, B extends number = number> = DeepReadonly<{
    r: R;
    g: G;
    b: B;
}>;
export function fix(value: string): HexColorString {
    if (regexMap.COLOR.test(value)) {
        return value as HexColorString;
    }
    let cleanedValue = value.replace(regexMap.COLOR_CLEAN, "");
    if (!cleanedValue.startsWith("#")) {
        cleanedValue = "#" + cleanedValue;
    }
    if (regexMap.COLOR.test(cleanedValue)) {
        return cleanedValue as HexColorString;
    }
    if (regexMap.COLOR_3.test(cleanedValue)) {
        const match = cleanedValue.match(regexMap.COLOR_3);
        if (match && match[1]) {
            const sixDigit = match[1].split("").map(char => char + char).join("");
            return `#${sixDigit}` as HexColorString;
        }
    }
    if (regexMap.COLOR_6.test(cleanedValue)) {
        return cleanedValue as HexColorString;
    }
    return "#000000";
}
export function lighten(hexColor: string, amount: number): HexColorString {
    const { r, g, b } = toRgb(hexColor);
    const lightenR = Math.min(255, Math.max(0, r + Math.round(2.55 * amount)));
    const lightenG = Math.min(255, Math.max(0, g + Math.round(2.55 * amount)));
    const lightenB = Math.min(255, Math.max(0, b + Math.round(2.55 * amount)));
    return toHex({ r: lightenR, g: lightenG, b: lightenB });
}
export function darken(hexColor: string, amount: number): HexColorString {
    const { r, g, b } = toRgb(hexColor);
    const darkenR = Math.min(255, Math.max(0, r - Math.round(2.55 * amount)));
    const darkenG = Math.min(255, Math.max(0, g - Math.round(2.55 * amount)));
    const darkenB = Math.min(255, Math.max(0, b - Math.round(2.55 * amount)));
    return toHex({ r: darkenR, g: darkenG, b: darkenB });
}
export function toRgb(hexColor: string): ColorRGB {
    const color = fix(hexColor);
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}
export function toHex(rgb: ColorRGB): HexColorString {
    const r = Math.min(255, Math.max(0, Math.round(rgb.r)));
    const g = Math.min(255, Math.max(0, Math.round(rgb.g)));
    const b = Math.min(255, Math.max(0, Math.round(rgb.b)));
    const hexR = ("0" + r.toString(16)).slice(-2);
    const hexG = ("0" + g.toString(16)).slice(-2);
    const hexB = ("0" + b.toString(16)).slice(-2);
    return `#${hexR}${hexG}${hexB}`;
}