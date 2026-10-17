import { readFile } from "node:fs/promises";

const files = ["index.html", "content.js", "form-utils.js", "app.js", "styles.css", "goddess-hair-ritual-guide.html"];
const forbiddenPatterns = [
  { pattern: /\bguarantee(?:d|s)?\b/i, label: "guaranteed claim" },
  { pattern: /\b(?:regrow|regrowth|cures?|treats?)\b/i, label: "medical or growth claim" },
  { pattern: /countdown/i, label: "countdown scarcity" },
];

const errors = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  if (source.includes("\t")) errors.push(`${file}: contains tab indentation`);
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(source)) errors.push(`${file}: contains ${label}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Linted ${files.length} source files.`);
}
