import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist/public");
const files = [
  "index.html",
  "content.js",
  "form-utils.js",
  "app.js",
  "styles.css",
  "goddess-hair-ritual-guide.html",
  "images",
];

await rm(path.resolve("dist"), { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of files) {
  await cp(path.resolve(file), path.join(outputDirectory, file), { recursive: true });
}

console.log(`Built ${files.length} assets to ${outputDirectory}.`);
