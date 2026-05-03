const path = require("path");
const webpack = require("webpack");
const createJiti = require("jiti");

const Webpackbar = require("webpackbar");

const tsconfigJson = require("./tsconfig.json");
const packageJson = require("./package.json");
const { merge } = require("webpack-merge");

const projectJson = require("./extension/entry.ts").default;

/**
 * 
 * @returns {import('webpack').Configuration[]}
 */
module.exports = () => {
    const { webpack: webpackConfig } = require("./dist/native/src/native/plugins").load();
    /**
     * @type {import('webpack').Configuration}
     */
    const base = {
        resolve: {
            extensions: [".js", ".ts"],
            alias: Object.fromEntries(
                Object.entries(tsconfigJson.compilerOptions.paths).map(
                    ([key, value]) => [
                        key.replace("/*", ""),
                        path.resolve(__dirname, value[0].replace("/*", "")),
                    ]
                )
            ),
        },
        output: {
            path: path.resolve(__dirname, "dist"),
            clean: false
        },
        module: {
            rules: [
                {
                    test: /\.ts$/i,
                    use: {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true
                        }
                    },
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
        ],
        devServer: {
            setupExitSignals: false,
            webSocketServer: "ws",
            client: {
                logging: "none",
                overlay: false
            },
            allowedHosts: "all",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers":
                    "X-Requested-With, content-type, Authorization",
            },
            static: "dist"
        },
        mode: process.env.NODE_ENV,
        stats: "errors-warnings",
    };
    return [
        ...projectJson.platform.map((platform) => {
            const extensionFilename = `[${platform}]${projectJson.id}@${projectJson.version}.js`;
            return merge(base, {
                name: platform,
                entry: "fs-context/entry.ts",
                output: {
                    filename: extensionFilename,
                },
                plugins: [
                    new Webpackbar({
                        name: projectJson.name.toUpperCase(),
                        color: "green",
                    }),
                    new webpack.DefinePlugin({
                        fsContext: JSON.stringify({
                            platform,
                            developing: process.env.NODE_ENV === "development",
                            extension: projectJson,
                        }),
                    }),
                ],
                devServer: {
                    port: 8000,
                    setupMiddlewares(mw, server) {
                        const corsHeaders = {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
                        };
                        server.app.get("/meta", (_, res) => {
                            Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
                            res.json({
                                extensionUrl: `/${extensionFilename}`,
                                ...projectJson,
                            });
                        });
                        server.app.get("/", (_, res) => {
                            Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
                            res.redirect(`/${extensionFilename}`);
                        });
                        return mw;
                    },
                }
            }, webpackConfig[platform]({ filename: extensionFilename, base }) ?? {});
        }),
        merge(base, {
            name: "injector",
            entry: "@injector",
            output: {
                filename: "injector.dist.js",
                library: {
                    name: "Inject",
                    export: "default",
                    type: "assign"
                }
            },
            plugins: [
                new Webpackbar({
                    name: "INJECTOR",
                    color: "green",
                }),
                new webpack.DefinePlugin({
                    fsContext: JSON.stringify({
                        platform: "injectorOnly",
                        developing: process.env.NODE_ENV === "development",
                            extension: projectJson,
                    }),
                }),
                new webpack.BannerPlugin({
                    banner: "let Inject;",
                    raw: true
                })
            ],
            devServer: {
                port: 2778,
                setupMiddlewares(mw, server) {
                    server.app.get("/", (_, res) => {
                        res.redirect("/injector.dist.js");
                    });
                    return mw;
                },
            },
        })
    ];
};
