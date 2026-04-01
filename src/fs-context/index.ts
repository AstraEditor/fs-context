import * as pluginManager from "./manager/plugins";
import * as extensionManager from "./manager/extensions";

const plugins = require.context("@plugin", true, /index\.ts$/);
plugins.keys().forEach(key => {
    const plugin = plugins(key);
    pluginManager.register(plugin.default);
});

export * from "./structs";
export * from "./api";
export * as textParser from "./structs/parser/runtime/text";
export * as colorParser from "./structs/parser/runtime/color";
export * as menuParser from "./structs/parser/runtime/menu";
export * as numberParser from "./structs/parser/runtime/number";
export * as argumentTypeParser from "./structs/parser/runtime/argumentType";
export * as blockTypeParser from "./structs/parser/runtime/blockType";
export * as keyParser from "./structs/parser/runtime/key";
export {
    pluginManager,
    extensionManager
};