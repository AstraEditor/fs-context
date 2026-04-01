import extension from "./config";
import { api, extensionManager, pluginManager } from "fs-context";
import { ScratchRuntime } from "./structs/stored";

console.log(`Loading "${fsContext.extension.id} v${fsContext.extension.version}" on ${fsContext.platform}.`);
const unsupportedPlatforms = fsContext.extension.platform.filter(pf => !pluginManager.getRegistered().includes(pf));
if (unsupportedPlatforms.includes(fsContext.platform)) {
    throw new Error(`Platform ${fsContext.platform} is not supported.`);
} else if (unsupportedPlatforms.length > 0) {
    console.warn(`unknown platform ${unsupportedPlatforms.join(", ")} received.`);
}
let env = extensionManager.createContextEnvironment(extension);
let runtime: ScratchRuntime;
pluginManager.call(fsContext.platform, "apply", [
    extensionManager.createContextEnvironment(
        extension,
        (...args) => {
            pluginManager.call(fsContext.platform, "initExtender", [env.extension.stored, ...args]);
            if (fsContext.developing) console.log("Constructing stored extender with:", args);
            runtime = pluginManager.call(fsContext.platform, "obtainRuntime", [env, ...args]).data;
            api.runtime = runtime;
            env = extensionManager.createContextEnvironment(
                extension,
                undefined,
                key => {
                    const result = pluginManager.call(fsContext.platform, "readTranslationKey", [env, runtime, key]);
                    return result.data ?? key.default;
                }
            );
            pluginManager.call(fsContext.platform, "setupTranslation", [env, runtime, env.extension.metadata.translators]);
            extensionManager.load(env, runtime, args);
            if (fsContext.developing) {
                console.warn("Running in development mode. Don`t publish this extension online.");
                console.log("\n--->");
                console.log("Extension data:");
                console.log("Metadata:", env.extension.metadata);
                console.log("Stored:", env.extension.stored);
                console.log("<---");
                console.log("\ngetInfo():", env.extension.stored.getInfo());
            }
        },
        key => {
            return pluginManager.call(fsContext.platform, "readTranslationKey", [env, runtime, key]).data ?? key.default;
        }
    )
], env => new env.extender.stored());
export default pluginManager.call(fsContext.platform, "expose", [env]) ?? null;