import { defineModLoader } from "fs-context/structs/plugin";

export default defineModLoader({
    id: "empty",
    isSandboxed() {
        return true;
    },
    obtainRuntime() {
        return null;
    },
    load() {
        alert("停停停，宝子你等等，这是个空插件，你再怎么加载它，它也不会做任何事情");
    }
});