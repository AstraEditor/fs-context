export default interface ExtConfig {
    id: string;
    name: string;
    description: string;
    version: string;
    platform: ["tw", "gandi","40code","02engine","clipcc","empty","gandi","zerocat","ae"] | string[];
    author: string;
    language: string;
}