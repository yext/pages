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

const filters = new Set(["./src/bundler.js", "./src/dev/client/**/*\\.*"]);
const files = glob.sync("./src/**/*\\.*").filter((f) => !filters.has(f));

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

// CJS
try {
  esbuild.build({
    ...commonBuildOpts,
    outdir: "dist",
    outbase: ".",
    format: "esm",
  });
} catch (e) {
  console.error(e);
}

// Client
const clientFiles = glob.sync("./src/dev/client/**/*\\.*");
try {
  esbuild.build({
    ...commonBuildOpts,
    entryPoints: clientFiles,
    platform: "browser",
    bundle: true,
    outdir: "dist",
    outbase: ".",
    format: "esm",
  });
} catch (e) {
  console.error(e);
}
