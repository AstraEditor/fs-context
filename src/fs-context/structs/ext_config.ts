export default interface ExtConfig {
    /**
     * Extension ID, it will not display.
     */
    id: string;
    /**
     * Extension Name, it will show to user.
     */
    name: string;
    /**
     * Description, but it will not display in editor.
     */
    description: string;
    /**
     * Verison.
     */
    version: string;
    /**
     * Extension supported platforms.
     */
    platform: ["tw", "gandi", "40code", "02engine", "clipcc", "empty", "gandi", "zerocat", "ae"] | string[];
    /**
     * Who made this extension.
     */
    author: string;
    /**
     * Display language of this extension.
     */
    language: string;
}