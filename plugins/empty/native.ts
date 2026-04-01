import { definePlugin } from "../../src/native/structs/plugin";

export default definePlugin({
    platform: "empty",
    configureESLint() {
        return [
            {
                rules: {
                    "quotes": ["error", "single"]
                }
            }
        ];
    },
});
