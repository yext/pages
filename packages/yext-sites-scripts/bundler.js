import esbuild from "esbuild";
import glob from "glob";

const builds = []

const files = glob.sync("./{scripts,yext-sites-scripts,bin}/**/*\\.*");

const commonBuildOpts = {
  bundle: false,
  minify: false,
  entryPoints: files.concat("server.ts", "index.ts", "entry-server.ts"),
  loader: { ".ts": "ts" },
  tsconfig: "tsconfig.json",
  logLevel: "error",
  platform: "node",
}

// CJS
try {
  builds.push(esbuild.build({
    ...commonBuildOpts,
    outdir: "dist/",
    format: "esm",
  }));
} catch (e) { console.error(e); }