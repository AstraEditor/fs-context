import { keyParser, translator } from "fs-context";

const EXTENSION_ID = "vvenvehelper";
export const translate = translator()
    .write(keyParser.blockText(EXTENSION_ID, "unban"), {
        "zh-cn": "启用VVenve",
        en: "UNBAN VVenve",
    })
    .write(keyParser.blockText(EXTENSION_ID, "ban"), {
        "zh-cn": "禁用VVenve",
        en: "BAN VVenve",
    })
    .write(keyParser.blockText(EXTENSION_ID, "banState"), {
        "zh-cn": "VVenve启用了吗？",
        en: "BAN state?"
    })
    .write(keyParser.blockText(EXTENSION_ID, "setDesc"), {
        "zh-cn": "设置变量[varname]的描述为[desc]",
        en: "Describe [varname] as [desc]"
    })
    .write(keyParser.blockText(EXTENSION_ID, "whenVVenveLoad"), {
        "zh-cn": "当VVenve加载完成时",
        en: "When VVenve is loaded"
    });
