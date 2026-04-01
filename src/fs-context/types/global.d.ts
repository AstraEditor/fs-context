import { DeepReadonly } from "fs-context/structs/util";
import { ScratchVM } from "../structs/stored";

declare global {
    const fsContext: DeepReadonly<{
        platform: string;
        developing: boolean;
        extension: {
            id: string;
            name: string;
            description: string;
            version: string;
            platform: string[];
            author: string;
            language: string;
        };
    }>;
    interface Window {
        Scratch: ScratchVM;
    }
    interface ObjectConstructor {
        hasOwn<K extends string, T>(obj: T, prop: K): obj is T & Record<K, unknown>;
    }
}