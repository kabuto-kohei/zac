import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { openApiDocument } from "./openapi-data.mjs";

const outputPath = "openapi/zac-openapi.json";
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(openApiDocument, null, 2)}\n`);
console.log(`generated ${outputPath}`);

