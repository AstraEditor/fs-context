import { remoteStore } from "fs-context";

export const apikey = remoteStore({
    unbankey: "" as string | undefined
});