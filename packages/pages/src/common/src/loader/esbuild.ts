import { Loader } from "esbuild";

export const COMMON_ESBUILD_LOADERS: { [ext: string]: Loader } = {
  ".css": "css",
  ".scss": "css",
  ".ico": "dataurl",
  ".avif": "dataurl",
  ".jpg": "dataurl",
  ".jpeg": "dataurl",
  ".png": "dataurl",
  ".gif": "dataurl",
  ".svg": "dataurl",
  ".webp": "dataurl",
  ".ttf": "dataurl",
  ".woff": "dataurl",
  ".otf": "dataurl",
};
