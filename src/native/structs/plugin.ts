import { Configuration } from "webpack";
import { Linter } from "eslint";

export interface ExtendWebpackConfig {
    filename: string;
    base: Configuration;
}
export interface NativePlugin {
    platform: string;
    output?: false;
    configureWebpack?: (this: NativePlugin) => (config: ExtendWebpackConfig) => Configuration;
    configureESLint?: (this: NativePlugin) => Linter.Config[];
}
export function definePlugin<T extends NativePlugin>(plugin: T): T {
    return plugin;
}