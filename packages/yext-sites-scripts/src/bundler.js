import esbuild from "esbuild";
import glob from "glob";

const builds = []

const files = glob.sync("./src/**/*\\.*").filter(f => f !== "./src/bundler.js");

const commonBuildOpts = {
  bundle: false,
  minify: false,
  entryPoints: files,
  loader: {
    ".ts": "ts",
    ".html": "text"
  },
  tsconfig: "tsconfig.json",
  logLevel: "error",
  platform: "node",
}

// CJS
try {
  builds.push(esbuild.build({
    ...commonBuildOpts,
    outdir: "dist",
    outbase: "src",
    format: "esm",
  }));
} catch (e) {
  console.error(e);
}