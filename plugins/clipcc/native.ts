import { definePlugin } from "../../src/native/structs/plugin";
import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import yazl from "yazl";
import webpack from "webpack";
import fs from "fs-extra";

export default definePlugin({
    platform: "clipcc",
    configureWebpack() {
        return ({ filename }) => ({
            output: {
                module: true,
                library: {
                    type: "commonjs2",
                    export: "default"
                }
            },
            experiments: {
                outputModule: true
            },
            externals: {
                "clipcc-extension": "ClipCCExtension"
            },
            externalsType: "global",
            plugins: [
                new CopyWebpackPlugin({
                    patterns: [{
                        from: path.resolve("src/extension/l10n"),
                        to: path.resolve("dist/cc/locales")
                    }, {
                        from: path.resolve("src/extension/assets"),
                        to: path.resolve("dist/cc/assets")
                    }, {
                        from: path.resolve("src/extension/info.json"),
                        to: path.resolve("dist/cc/info.json")
                    }]
                }),
                {
                    apply(compiler) {
                        const { RawSource } = compiler.webpack.sources;
                        const process = function (compilation: webpack.Compilation, callback: () => void) {
                            if (compilation.compiler.isChild()) {
                                callback();
                                return;
                            }
                            const zipFile = new yazl.ZipFile();
                            for (const nameAndPath of Object.keys(compilation.assets)) {
                                const source = compilation.assets[nameAndPath].source();
                                zipFile.addBuffer(
                                    Buffer.isBuffer(source) ? source : (Buffer.from ? Buffer.from(source) : Buffer.from(source)),
                                    path.join(nameAndPath)
                                );
                            }
                            zipFile.end();
                            const bufs: Buffer[] = [];
                            zipFile.outputStream.on("data", function (buf) {
                                bufs.push(buf);
                            });
                            zipFile.outputStream.on("end", function () {
                                const outputPath = path.resolve(compilation.options.output.path!, "cc");
                                const outputFilename = `../${filename}`;
                                const outputPathAndFilename = path.resolve(outputPath, outputFilename.slice(0, -3) + ".ccx");
                                const relativeOutputPath = path.relative(
                                    compilation.options.output.path!,
                                    outputPathAndFilename
                                );
                                const zipFileSource = new RawSource(Buffer.concat(bufs));
                                compilation.emitAsset(relativeOutputPath, zipFileSource);
                                compilation.deleteAsset(path.resolve(compilation.options.output.path!, filename));
                                callback();
                                fs.removeSync(outputPath);
                            });
                        };
                        compiler.hooks.thisCompilation.tap("ZipPlugin", compilation => {
                            compilation.hooks.processAssets.tapPromise(
                                {
                                    name: "ZipPlugin",
                                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
                                },
                                () => new Promise(resolve => process(compilation, resolve))
                            );
                        });
                    }
                }
            ]
        });
    }
});