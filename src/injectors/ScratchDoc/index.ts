import { BlocklyInjector } from "fs-context/inject/blockly";
import { ScratchBlock, ScratchBlocks } from "fs-context/structs/cast";
import { SymbolDescriptor, parseDoc } from "./parser";

type PrototypeBlock = ScratchBlock & {
    procCode_: string;
    displayNames_: string[];
    argumentIds_: string[];
};
type CallBlock = PrototypeBlock;
type DefinitionBlock = ScratchBlock & {};

interface Tooltip {
    show(x: number, y: number): Tooltip;
    hide(): Tooltip;
    setContent(content: string): Tooltip;
}

export default class ScratchDoc extends BlocklyInjector {
    inject(blockly: ScratchBlocks): void {
        const workspaces = Object.values(blockly.Workspace.WorkspaceDB_);
        for (const workspace of workspaces) {
            for (const block of workspace.getAllBlocks()) {
                this.patchTooltip(block as ScratchBlock, blockly);
            }
            workspace.addChangeListener(e => {
                if (e instanceof blockly.Events.BlockCreate) {
                    const block = workspace.getBlockById(e.blockId ?? "") as ScratchBlock | null;
                    if (!block) return;
                    this.patchTooltip(block, blockly);
                }
            });
        }
    }
    private handleTooltip(blockly: ScratchBlocks, definitionBlock: DefinitionBlock, prototypeBlock: PrototypeBlock, callBlock: CallBlock) {
        const text = (symbol: SymbolDescriptor, title: string) => `${title}：${symbol.type} - ${symbol.desc}`;
        const tooltip = this.createTooltip(text({ type: "", desc: "" }, ""));
        const args = this.mapArguments(prototypeBlock);

        for (const input of callBlock.inputList) {
            const svg = (input.connection?.targetConnection?.getSourceBlock() as ScratchBlock).getSvgRoot();
            blockly.bindEvent_(svg, "mouseover", input, () => {
                const comment = definitionBlock.getCommentText();
                if (!comment) return;
                try {
                    const doc = parseDoc(comment);

                    const paramName = args[input.name];
                    if (doc.params[paramName]) {
                        const param = doc.params[paramName];
                        tooltip.setContent(text(param, `参数 ${paramName}`));
                    }
                    if (doc.returns) {
                        tooltip.setContent(text(doc.returns, "返回值"));
                    }
                    this.mountTooltip(tooltip, svg);
                } catch (e) { console.error(e); }
            });
            blockly.bindEvent_(svg, "mouseout", input, () => {
                tooltip.hide();
            });
        }
        return tooltip;
    }
    private mountTooltip(tooltip: Tooltip, element: Element) {
        const rect = element.getBoundingClientRect();
        tooltip.show(rect.left + 10, rect.top + 30);
        return tooltip;
    }
    private createTooltip(text: string): Tooltip {
        const tooltipElement = document.createElement("div");
        tooltipElement.textContent = text;
        tooltipElement.style.position = "absolute";
        tooltipElement.style.display = "none";
        tooltipElement.style.backgroundColor = "white";
        tooltipElement.style.border = "1px solid black";
        document.body.appendChild(tooltipElement);
        return {
            show(x, y) {
                tooltipElement.style.left = `${x}px`;
                tooltipElement.style.top = `${y}px`;
                tooltipElement.style.display = "block";
                return this;
            },
            hide() {
                tooltipElement.style.display = "none";
                return this;
            },
            setContent(content) {
                tooltipElement.textContent = content;
                return this;
            },
        };
    }
    private patchTooltip(block: ScratchBlock, blockly: ScratchBlocks) {
        if (block.type !== "procedures_call") return;
        const callBlock = block as CallBlock;
        const definitionBlock = this.findCustomBlockDefinition(callBlock.procCode_, blockly);
        if (!definitionBlock) return;
        const prototypeBlock = this.getCustomBlockPrototype(definitionBlock);
        if (!prototypeBlock) return;
        this.handleTooltip(blockly, definitionBlock, prototypeBlock, callBlock);
    }
    private getCustomBlockPrototype(definition: DefinitionBlock) {
        return definition.inputList[0].connection?.targetConnection?.getSourceBlock() as PrototypeBlock | null;
    }
    private findCustomBlockDefinition(procCode: string, blockly: ScratchBlocks) {
        for (const block of Object.values(blockly.Workspace.WorkspaceDB_)[0].getAllBlocks()) {
            if (
                block.type === "procedures_definition"
                && block.inputList.length === 1
            ) {
                const prototypeBlock = block.getChildren(false)[0] as PrototypeBlock;
                if (
                    prototypeBlock.type === "procedures_prototype"
                    && prototypeBlock.procCode_ === procCode
                ) {
                    return block as DefinitionBlock;
                }
            }
        }
    }
    private mapArguments(definition: PrototypeBlock) {
        return Object.fromEntries(
            definition.argumentIds_.map((id, index) => [id, definition.displayNames_[index]])
        );
    }
}