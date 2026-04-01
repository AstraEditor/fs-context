import { Linter } from "eslint";
import fs from "fs";
import { ExtendWebpackConfig, NativePlugin } from "./structs/plugin";
import path from "path";
import { Configuration } from "webpack";
import chalk from "chalk";

export function load() {
    console.log(
        `Mode: ${process.env.NODE_ENV === "production" ? "production" : "development"
        }`
    );
    const disablePlugins = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../../plugins/disable.json"), "utf-8")
    ) as Record<"platform" | "folder", string[]>;
    const webpack: Record<
        string,
        (config: ExtendWebpackConfig) => Configuration
    > = {};
    const eslint: Linter.Config[] = [];
    const pluginsDir = path.join(__dirname, "../../plugins");
    const pluginFolders = fs
        .readdirSync(pluginsDir)
        .filter((file) => fs.statSync(path.join(pluginsDir, file)).isDirectory());
    const pluginIds: string[] = [];
    function pad(id: string) {
        return id.padEnd(Math.max(...pluginIds.map((id) => id.length)), " ");
    }
    for (const folder of pluginFolders) {
        pluginIds.push(folder);
    }
    for (const folder of pluginFolders) {
        const currentNativeId = folder;
        if (disablePlugins.folder.includes(currentNativeId)) {
            console.log(
                `${chalk.gray(pad(currentNativeId))} | ${chalk.red("DISABLED")}`
            );
            continue;
        }
        try {
            const nativePath = path.resolve(
                "dist/native/plugins",
                folder,
                "native.js"
            );
            if (fs.existsSync(nativePath)) {
                const {
                    default: plugin,
                }: { default: NativePlugin } = require(nativePath);
                if (disablePlugins.platform.includes(plugin.platform)) {
                    console.log(
                        `${chalk.gray(pad(plugin.platform))} | ${chalk.red("DISABLED")}`
                    );
                    continue;
                }
                webpack[currentNativeId] =
                    plugin.configureWebpack?.call(plugin) ?? (() => ({}));
                eslint.push(...(plugin.configureESLint?.call(plugin) ?? []));
                console.log(
                    `${chalk.gray(pad(currentNativeId))} | ${chalk.green(
                        "loaded successfully"
                    )}: ${chalk.cyan(plugin.platform)}.`
                );
            } else {
                webpack[currentNativeId] = () => ({});
                console.warn(
                    `${chalk.gray(pad(currentNativeId))} | ${chalk.yellow(
                        "not found native module"
                    )}.`
                );
            }
        } catch (err) {
            console.error(`${chalk.gray(pad(currentNativeId))} | ${chalk.red(err)}`);
        }
    }
    return { webpack, eslint };
}
