import { readFile } from "node:fs/promises";
import { openApiDocument } from "./openapi-data.mjs";

const outputPath = "openapi/zac-openapi.json";
const expected = `${JSON.stringify(openApiDocument, null, 2)}\n`;
const actual = await readFile(outputPath, "utf8").catch(() => "");

if (actual !== expected) {
  console.error(`${outputPath} is out of date. Run pnpm openapi:generate.`);
  process.exit(1);
}

console.log("openapi check ok");

