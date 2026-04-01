import { parseDoc } from "./parser";

const testString = `
#doc
@param {type fewsf} a b c d
@returns {e fefa} fg a
`;
console.log(parseDoc(testString));
