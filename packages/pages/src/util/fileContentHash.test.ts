import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getFileContentHash } from "./fileContentHash.js";

describe("getFileContentHash", () => {
  it.each([
    {
      name: "valid UTF-8",
      contents: Buffer.from("hello 🌍"),
      expectedHash: "92de6bbfa52e6cfa0f85916fd8176cb1644b95a4c0148cdda94745ba6c35e5eb",
    },
    {
      name: "invalid UTF-8",
      contents: Buffer.from([0x66, 0x80, 0x6f]),
      expectedHash: "edb3d848684a3437ea1944dd1361b87aa07f7dbefbf5498b83d85875f50f0444",
    },
  ])("hashes the raw bytes for $name contents", ({ contents, expectedHash }) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pages-file-content-hash-"));
    const filepath = path.join(tempDir, "contents");

    try {
      fs.writeFileSync(filepath, contents);

      expect(getFileContentHash(filepath)).toBe(expectedHash);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
