import esbuild from "esbuild";
import { glob } from "glob";
import path from "path";
import { rmSync, mkdirSync, copyFileSync } from "fs";

let watch = false;
const args = process.argv.slice(2);
if (args.length > 0) {
  if (args[0] === "--watch") {
    console.log("Starting watch build. Listening for changes...");
    watch = true;
  }
}

/**
 * rm -f dist/ to have a clean build.
 */
rmSync("./dist", { recursive: true, force: true });

const testFilter = (f) =>
  !f.endsWith(".test.ts") &&
  !f.endsWith(".test.tsx") &&
  !f.endsWith(".test.js");
const filters = new Set(["./src/bundler.js"]);

const files = glob
  .sync("./src/**/*.*")
  .filter(testFilter)
  .filter((f) => !filters.has(f))
  .filter((f) => !f.endsWith(".md"));

const commonBuildOpts = {
  bundle: false,
  minify: false,
  entryPoints: files,
  loader: {
    ".ts": "ts",
    ".html": "text",
    ".ico": "copy",
  },
  tsconfig: "tsconfig.json",
  logLevel: "info",
  platform: "node",
};

/**
 * Copy yext plugin files from src/ to dist/ so they can be copied into the starter by the Vite
 * plugin.
 */
const pluginOutputPath = "./dist/plugin/";
const pluginFiles = glob.sync("../yext-function/**.ts");
if (pluginFiles.length == 0) {
  throw new Error("Failed to find plugin files. Stopping build");
}
mkdirSync(pluginOutputPath, { recursive: true });
pluginFiles.map((filepath) =>
  copyFileSync(filepath, `${pluginOutputPath}${path.basename(filepath)}`)
);

try {
  const ctx = await esbuild.context({
    ...commonBuildOpts,
    outdir: "dist",
    format: "esm",
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
} catch (e) {
  console.error(e);
}
