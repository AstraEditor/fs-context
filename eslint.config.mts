import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import { load } from "./src/native/plugins";

export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                },
            ]
        },
    },
    {
        files: ["webpack.config.js", "src/native/plugins.ts"],
        languageOptions: { globals: globals.node },
        rules: {
            "@typescript-eslint/no-require-imports": "off"
        }
    },
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**"
        ]
    },
    ...load().eslint
];