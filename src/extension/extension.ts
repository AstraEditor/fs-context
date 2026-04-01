import { api, blockType, extension, menu } from "fs-context";
import { translate } from "./translator";
import { apikey } from "./store";

declare global {
    interface Window {
        __VVENVE__?: {
            ban(): string;
            unban(key: string | undefined): string;
            injected: boolean;
        },
        __VVENVE_PUBLIC__?: {
            variables: {
                reference: {
                    target: string;
                    name: string;
                };
                description: string;
            }[];
            updateVariable(): void;
        }
    }
}

export default extension()
    .menu(
        menu("vars")
            .readback((_, target) => {
                const result = Object.values(target?.variables ?? []).map(e => e.name);
                return result.length > 0 ? result : ["🚫👁️棍母"];
            })
            .build()
    )
    .block(
        blockType.command("ban")
            .text("BAN VVenve")
            .action(() => {
                apikey.write("unbankey", window.__VVENVE__?.ban());
            })
            .build(),
    )
    .block(
        blockType.command("unban")
            .text("UNBAN VVenve")
            .action(() => {
                window.__VVENVE__?.unban(apikey.read("unbankey"));
            })
            .build(),
    )
    .block(
        blockType.boolean("banState")
            .text("BAN state?")
            .action(() => Boolean(window.__VVENVE__?.injected))
            .build()
    )
    .block(
        blockType.command("setDesc")
            .text("Describe [varname:menu=vars] as [desc]")
            .action(({ varname, desc }, util) => {
                if (window.__VVENVE_PUBLIC__) {
                    window.__VVENVE_PUBLIC__.variables = window
                        .__VVENVE_PUBLIC__
                        .variables
                        .filter(
                            variable =>
                                variable.reference.target !== util.target.getName() || variable.reference.name !== varname
                        );
                }
                window.__VVENVE_PUBLIC__?.variables.push({
                    reference: {
                        target: util.target.getName(),
                        name: varname
                    },
                    description: desc
                });
                window.__VVENVE_PUBLIC__?.updateVariable();
            })
            .build()
    )
    .block(
        blockType.event("whenVVenveLoad")
            .raw({ isEdgeActivated: false })
            .text("When VVenve is loaded")
            .build()
    )
    .on("stored", () => {
    })
    .use(translate);
