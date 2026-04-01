export interface SymbolDescriptor {
    type: string;
    desc: string;
}
export interface ScratchDocMetadata {
    params: Record<string, SymbolDescriptor>,
    returns: SymbolDescriptor | null;
}
type RawTemplate = "type" | "string";
type RestTemplate = "string...";
type Template = RawTemplate | RestTemplate;

const DOC_COMMAND_FORMAT: Record<string, [...RawTemplate[], Template]> = {
    param: ["type", "string", "string..."],
    returns: ["type", "string"],
};
function extractSlot(parts: string[], templates: Template[]): string[] | string {
    const endTemplate = templates[templates.length - 1];
    const result: string[] = [];
    if (parts.length < templates.length) return "组件数量太少";
    else if (parts.length > templates.length && endTemplate !== "string...") return "组件数量过多";
    const startMultiPart = () => {
        if (inMultiPart) return;
        inMultiPart = true;
        partResult = [];
    };
    const endMultiPart = () => {
        inMultiPart = false;
        result.push(partResult.join(" "));
    };
    let templateIndex = 0;
    let inMultiPart = false;
    let partResult: string[] = [];
    for (let i = 0; i < parts.length; i++) {
        const template = templates[templateIndex] || endTemplate;
        if (template === "string") {
            result.push(parts[i]);
        } else if (template === "type") {
            if (inMultiPart) {
                partResult.push(parts[i]);
            } else if (parts[i].startsWith("{")) {
                startMultiPart();
                partResult.push(parts[i].slice(1));
            } else {
                return "预期为\"{\"";
            }
            const lastPartResult = partResult[partResult.length - 1];
            if (lastPartResult.endsWith("}")) {
                partResult.splice(partResult.length - 1, 1);
                partResult.push(lastPartResult.slice(0, lastPartResult.length - 1));
                endMultiPart();
            }
        } else if (template === "string...") {
            startMultiPart();
            partResult.push(parts[i]);
        }
        if (!inMultiPart) templateIndex++;
    }
    endMultiPart();
    return result;
}
export function parseDoc(fromString: string): ScratchDocMetadata {
    const result: ScratchDocMetadata = {
        params: {},
        returns: null,
    };
    const trimString = fromString.trim();
    if (!trimString.startsWith("#doc")) return result;
    const lines = trimString.split("\n");
    for (const line of lines) {
        const trimLine = line.trim();
        if (!trimLine.startsWith("@")) continue;
        const parts = trimLine.slice(1).split(" ").filter(Boolean);
        const command = parts[0];
        const args = parts.slice(1);
        if (!DOC_COMMAND_FORMAT[command]) throw `不存在命令"${command}"，可选：${Object.keys(DOC_COMMAND_FORMAT)}`;
        const slots = extractSlot(args, DOC_COMMAND_FORMAT[command]);
        if (typeof slots === "string") throw `命令"${command}"的预期格式为：${DOC_COMMAND_FORMAT[command]}，${slots}`;
        if (command === "param") {
            result.params[slots[1]] = {
                type: slots[0],
                desc: slots[2],
            };
        } else if (command === "returns") {
            result.returns = {
                type: slots[0],
                desc: slots[1],
            };
        }
    }
    return result;
}