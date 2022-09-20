import fs from "node:fs";
import path from "node:path";

export function editFile(
  filename: string,
  replacer: (str: string) => string
): void {
  filename = path.resolve(filename);
  console.log("F: " + filename);
  const content = fs.readFileSync(filename, "utf-8");
  const modified = replacer(content);
  fs.writeFileSync(filename, modified);
}
