import Blockly, { Block, Workspace } from "blockly";

export type ScratchBlocks = typeof Blockly & {
    Workspace: Workspace & {
        WorkspaceDB_: Record<string, ScratchBlocks["Workspace"]>;
        getAllBlocks(): ScratchBlock[];
    };
    bindEvent_<T>(
        element: Element,
        eventName: string,
        thisArg: T,
        callback: (this: T, event: Event) => void
    ): void;
};
export type ScratchBlock = Block & {
    rendered: boolean;
    render: (d?: boolean) => void;
    initSvg: () => void;
    workspace: Blockly.Workspace & {
        isDragging: () => boolean;
    };
    getSvgRoot(): SVGElement;
};