export const regexMap = {
    PART_TOTAL: /\[(.*?)\]/g,
    ARG_SLOT: /^\[([^\]:=]+)(?::([^\]=]*))?(?:=([^\]]*))?\]$/,
    KEY_VALUE_ARRAY: /(?:^|,)\s*(?:(?:"([^"]*)")|([^=,\s]+))\s*(?:=\s*(?:"([^"]*)")|([^=,\s]+))?\s*/g,
    COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    COLOR_3: /^#([A-Fa-f0-9]{3})$/,
    COLOR_6: /^#([A-Fa-f0-9]{6})$/,
    COLOR_CLEAN: /[^#A-Fa-f0-9]/g,
};