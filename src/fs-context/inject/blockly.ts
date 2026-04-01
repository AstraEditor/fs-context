import { ExtensionStored, BlockStored, ScratchRuntime, ExtensionInfoStored } from "..";
import { ScratchBlock } from "../structs/cast";
import { InjectionError } from "../logging/exceptions";
import { ScratchBlocks } from "../structs/cast";
import { obtainBlockly } from "../utils/blockly";

export interface InjectBlockly {
    inject(blockly: ScratchBlocks): void;
}

export abstract class BlocklyInjector implements InjectBlockly {
    protected blockly: ScratchBlocks;
    constructor(blockly: ScratchBlocks) {
        this.blockly = blockly;
        this.inject(blockly);
    }
    abstract inject(blockly: ScratchBlocks): void;
}
export abstract class ExtensionBlocklyInjector extends BlocklyInjector {
    protected extension: ExtensionStored;
    protected runtime: ScratchRuntime;
    private get availableBlocks(): (BlockStored)[] {
        return this.extension.getInfo().blocks?.filter(e => typeof e !== "string").filter(this.isAvailableBlock) ?? [];
    }
    public constructor(extension?: ExtensionStored) {
        if (!extension)
            throw new InjectionError("no extension given.");
        if (!extension.runtime)
            throw new InjectionError(`no runtime found in ${extension.getInfo().id}.`);
        const blockly = obtainBlockly(extension.runtime);
        if (!blockly) {
            console.error("blockly not found.");
        }
        super(blockly!);
        this.runtime = extension.runtime;
        this.extension = extension;
        this.blockly = blockly!;
    }
    protected abstract isAvailableBlock(blockInfo: BlockStored): boolean;
    protected abstract configMap(originBlock: BlockStored): BlockStored;
    protected abstract getInfo(originInfo: ExtensionInfoStored): ExtensionInfoStored;
    protected abstract init(block: ScratchBlock, myInfo: BlockStored): void;
    abstract inject(blockly: ScratchBlocks): void;
    private findAvaliable(opcodeWithExtensionID: string): BlockStored | null {
        return this.availableBlocks.find(
            block =>
                opcodeWithExtensionID === `${this.extension.getInfo().id}_${block.opcode}`
        ) ?? null;
    }
    private isDefinitionAvailable(opcodeWithExtensionID: string): boolean {
        return this.availableBlocks.length > 0 && this.availableBlocks.some(block => opcodeWithExtensionID === `${this.extension.getInfo().id}_${block.opcode}`);
    }
    public start() {
        if (!this.blockly) return;
        const originGetInfo = this.extension.getInfo.bind(this.extension);
        this.extension.getInfo = () => {
            const originInfo = originGetInfo();
            originInfo.blocks = originInfo.blocks?.filter(e => typeof e !== "string").map(
                block => this.isAvailableBlock(block) ? this.configMap(block) : block
            ) ?? [];
            return this.getInfo(originInfo) ?? originInfo;
        };
        this.blockly.Blocks = new Proxy(this.blockly.Blocks, {
            set: (target, opcode: string, definition: ScratchBlock) => {
                const injected = definition;
                if (this.isDefinitionAvailable(opcode)) {
                    const originInit = injected.init;
                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                    const injector = this;
                    injected.init = function (this: ScratchBlock) {
                        originInit?.call(this);
                        const blockInfo = injector.findAvaliable(opcode);
                        if (blockInfo) {
                            injector.init(this, blockInfo);
                        }
                    };
                };
                return Reflect.set(target, opcode, injected);
            }
        });
    }
}