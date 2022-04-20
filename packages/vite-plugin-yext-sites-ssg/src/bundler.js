import esbuild from "esbuild";
import { copyFile, mkdirSync,rmSync } from "fs";
import glob from "glob";
import path from "path";

const builds = []

/**
 * rm -f dist/ to have a clean build.
 */
rmSync("./dist", { recursive: true, force: true });

// Transpile all files except this one
const files = glob.sync("./src/**/*\.*").filter(f => f !== "./src/bundler.js");

const commonBuildOpts = {
  bundle: false,
  minify: false,
  entryPoints: files,
  loader: { ".ts": "ts" },
  tsconfig: "tsconfig.json",
  logLevel: "error",
  platform: "node",
}

// CJS
try {
  builds.push(await esbuild.build({
    ...commonBuildOpts,
    outdir: "dist/cjs/src",
    format: "cjs",
  }));
} catch (e) {console.error(e);}

// ESM
try {
  builds.push(await esbuild.build({
    ...commonBuildOpts,
    outdir: "dist/esm/src",
    format: "esm",
  }));
} catch (e) {console.error(e);}

/**
 * Copy yext plugin files from src/ to dist/ so they can be copied into the starter by the Vite
 * plugin.
 */
const cjsPluginPath = "./dist/cjs/plugin/";
const esmPluginPath = "./dist/esm/plugin/";
const pluginFiles = glob.sync("./plugin/**.ts");
mkdirSync(cjsPluginPath);
mkdirSync(esmPluginPath);
pluginFiles.map(filepath => copyFile(filepath, `${cjsPluginPath}${path.basename(filepath)}`, () => { }));
pluginFiles.map(filepath => copyFile(filepath, `${esmPluginPath}${path.basename(filepath)}`, () => { }));