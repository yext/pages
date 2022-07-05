import esbuild from "esbuild";
import { copyFile, mkdirSync, rmSync } from "fs";
import glob from "glob";
import path from "path";

const builds = [];

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

/**
 * Copy yext plugin files from src/ to dist/ so they can be copied into the starter by the Vite
 * plugin.
 */
const cjsPluginPath = "./dist/cjs/plugin/";
const esmPluginPath = "./dist/esm/plugin/";
const pluginFiles = glob.sync("./plugin/**.ts");
mkdirSync(cjsPluginPath, { recursive: true });
mkdirSync(esmPluginPath, { recursive: true });
pluginFiles.map((filepath) =>
  copyFile(filepath, `${cjsPluginPath}${path.basename(filepath)}`, () => {})
);
pluginFiles.map((filepath) =>
  copyFile(filepath, `${esmPluginPath}${path.basename(filepath)}`, () => {})
);

const testFilter = f => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx") && !f.endsWith(".test.js");

// Transpile all files except this one and tests
let files = glob.sync("./src/**/*.*")
  .filter(testFilter)
  .filter((f) => f !== "./src/bundler.js");

// Add common shared code
files.push.apply(
  files,
  glob.sync("../common/**/*.*")
  .filter(testFilter)
  .filter((f) => f !== "../common/tsconfig.json")
);

const commonBuildOpts = {
  bundle: false,
  minify: false,
  entryPoints: files,
  loader: { ".ts": "ts" },
  tsconfig: "tsconfig.json",
  logLevel: "error",
  platform: "node",
};

// CJS
try {
  builds.push(
    await esbuild.build({
      ...commonBuildOpts,
      outdir: "dist/cjs/src",
      format: "cjs",
    })
  );
} catch (e) {
  console.error(e);
}

// ESM
try {
  builds.push(
    await esbuild.build({
      ...commonBuildOpts,
      outdir: "dist/esm/src",
      format: "esm",
      watch: watch && {
        onRebuild(error) {
          if (error) {
            console.error("watch build failed:", error);
            return;
          }

          console.log("Watch build succeeded. Listening for changes...");
        },
      },
    })
  );
} catch (e) {
  console.error(e);
}
