import { blockType, extension } from "fs-context";

export default extension()
    .block(
        blockType.command("helloWorld")
            .text("Hello World")
            .action(() => {
                alert("Hello World!");
            })
            .build(),
    )
    .on("stored", () => {
    })
