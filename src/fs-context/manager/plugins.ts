import { ModLoader } from "fs-context/structs/plugin";
import { KeyOfButMatch } from "fs-context/structs/util";

const registered: Record<string, ModLoader> = {};
export function register(loader: ModLoader) {
    registered[loader.id] = loader;
}
export function unregister(id: string) {
    delete registered[id];
}
export function getRegistered() {
    return Object.keys(registered);
}
export function read<
    K extends KeyOfButMatch<ModLoader, ((...args: unknown[]) => unknown) | undefined>
>(id: string, key: K): ModLoader[K] {
    return registered[id][key];
}
export function call<
    K extends Exclude<keyof ModLoader, "id">
>(id: string, event: K, args: Parameters<NonNullable<ModLoader[K]>>, defaultMethod?: (this: ModLoader, ...args: Parameters<NonNullable<ModLoader[K]>>) => ReturnType<NonNullable<ModLoader[K]>>): {
    state: boolean;
    data: ReturnType<NonNullable<ModLoader[K]>> | null;
} {
    const loader = registered[id];
    let methodFound = false;
    if (loader) {
        const method = loader[event] as ((...args: unknown[]) => unknown) | undefined;
        if (method) {
            methodFound = true;
            return {
                state: true,
                data: method.apply(loader, args) as ReturnType<NonNullable<ModLoader[K]>>
            };
        }
    }
    if (!methodFound && defaultMethod) {
        return {
            state: true,
            data: defaultMethod.apply(loader, args)
        };
    }
    return {
        state: false,
        data: null
    };
}