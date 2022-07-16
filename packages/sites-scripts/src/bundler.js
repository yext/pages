import esbuild from "esbuild";
import glob from "glob";
import { rmSync } from "fs";

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
  .sync("./src/**/*\\.*")
  .filter(testFilter)
  .filter((f) => !filters.has(f));

// Add common shared code
files.push.apply(
  files,
  glob
    .sync("../../common/**/*.*")
    .filter(testFilter)
    .filter((f) => f !== "../../common/tsconfig.json")
);

const commonBuildOpts = {
  bundle: false,
  minify: false,
  entryPoints: files,
  loader: {
    ".ts": "ts",
    ".html": "text",
  },
  tsconfig: "tsconfig.json",
  logLevel: "error",
  platform: "node",
  watch: watch && {
    onRebuild(error) {
      if (error) {
        console.error("watch build failed:", error);
        return;
      }

      console.log("Watch build succeeded. Listening for changes...");
    },
  },
};

// ESM
try {
  await esbuild.build({
    ...commonBuildOpts,
    outdir: "dist",
    format: "esm",
  });
} catch (e) {
  console.error(e);
}
