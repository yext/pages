import esbuild from "esbuild";
import glob from "glob";

const builds = []

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
  builds.push(esbuild.build({
    ...commonBuildOpts,
    outdir: "dist/cjs",
    format: "cjs",
  }));
} catch (e) {console.error(e);}

// ESM
try {
  builds.push(esbuild.build({
    ...commonBuildOpts,
    outdir: "dist/esm",
    format: "esm",
  }));
} catch (e) {console.error(e);}