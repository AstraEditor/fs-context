import { ScratchRuntime, ScratchTranslateKeyDescriptor, textParser } from "fs-context";
import { defineModLoader } from "fs-context/structs/plugin";
import { deepMerge } from "fs-context/structs/util";

declare const window: Window & {
    tempExt: object;
};
let format: undefined | ((key: ScratchTranslateKeyDescriptor) => string | undefined);
export default defineModLoader({
    id: "gandi",
    obtainRuntime(_, ...args) {
        return args[0] as ScratchRuntime;
    },
    initExtender(extension, ...args) {
        extension.runtime = args[0] as ScratchRuntime;
    },
    apply(env) {
        window.tempExt = {
            Extension: env.extender.stored,
            info: {
                extensionId: env.extension.metadata.id
            }
        };
    },
    load() { },
    isSandboxed() {
        return false;
    },
    setupTranslation(_, runtime, translators) {
        const store = deepMerge(...translators.map(translator => translator.store));
        const data: Record<string, Record<string, string>> = {};
        for (const key in store) {
            for (const lang in store[key]) {
                data[lang] = data[lang] || {};
                data[lang][key] = textParser.storeText(store[key][lang]);
            }
        }
        format = runtime?.getFormatMessage(data);
    },
    readTranslationKey(_, __, key) {
        return format?.(key) ?? key.default;
    },
});