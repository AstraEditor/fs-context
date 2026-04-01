import { ScratchRuntime, textParser } from "fs-context";
import { defineModLoader } from "fs-context/structs/plugin";
import { deepMerge } from "fs-context/structs/util";

export default defineModLoader({
    id: "tw",
    obtainRuntime(environment) {
        return environment.window.Scratch as unknown as ScratchRuntime;
    },
    load(environment, runtime) {
        runtime?.extensions.register(environment.extension.stored);
    },
    isSandboxed(_, runtime) {
        return !runtime?.extensions.unsandboxed;
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
        runtime?.translate.setup(data);
    },
    readTranslationKey(_, runtime, key) {
        return runtime?.translate(key) ?? key.default;
    }
});