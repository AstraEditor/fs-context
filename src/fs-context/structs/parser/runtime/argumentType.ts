import { InputType, InputTypeStored } from "fs-context/structs/classify";

export const map = new Map<InputType, InputTypeStored>();
map.set("bool", "Boolean");
map.set("hat-param", "ccw_hat_parameter");
export function store(type: InputType): InputTypeStored {
    return (map.get(type) ?? type) as InputTypeStored;
}