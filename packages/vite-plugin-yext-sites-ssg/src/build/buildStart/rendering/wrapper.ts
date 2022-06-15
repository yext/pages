import { TemplateModuleInternal } from "../../../../../common/src/template/internal/types.js";
import { renderHeadConfigToString } from "../../../../../common/src/template/head.js";
import { Data, GetHeadConfig } from "../../../../../common/src/template/types.js";

export const reactWrapper = <T extends Data>(
  data: T,
  templateModuleInternal: TemplateModuleInternal<any>,
  template: string,
  hydrate: boolean,
  getHeadConfig?: GetHeadConfig<any>
): string => {
  const projectFilepaths = data.__meta.manifest.projectFilepaths;

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <script>window.__INITIAL__DATA__ = ${JSON.stringify(data)}</script>
        ${getCssTags(
          `${projectFilepaths.templatesRoot}/${templateModuleInternal.templateName}.tsx`,
          data.__meta.manifest.bundlerManifest,
          new Set()
        )
          .map((f) => `<link rel="stylesheet" href="/${f}"/>`)
          .filter((v, i, a) => a.indexOf(v) == i)
          .join("\n")}
        ${getHeadConfig ? renderHeadConfigToString(getHeadConfig(data)) : ""}
    </head>
    <body>
        <div id="reactele">${template}</div>${
    hydrate
      ? `<script type="module" src="/${findHydrationFilename(
          `${projectFilepaths.hydrationBundleOutputRoot}/${templateModuleInternal.templateName}.tsx`,
          data
        )}" defer></script>`
      : ""
  }
    </body>
    </html>`;
};

type chunkName = string;
type bundlerManifest = Record<chunkName, ManifestInfo>;

const getCssTags = (
  filepath: string,
  manifest: bundlerManifest,
  seen: Set<string>
) => {
  const entry = Object.entries(manifest).find(([file]) => file === filepath);
  if (!entry) {
    return [];
  }
  const [file, info] = entry;

  seen.add(file);
  const cssFiles = info.css || [];
  (info.imports || [])
    .flatMap((f) => getCssTags(f, manifest, seen))
    .forEach((f) => cssFiles.push(f));

  return cssFiles;
};

const findHydrationFilename = (hydrationFile: string, data: any) => {
  const { __meta } = data;
  for (const [file, info] of Object.entries(__meta.manifest.bundlerManifest)) {
    if (file !== hydrationFile) {
      continue;
    }

    // Return the name of the fingerprinted hydration asset
    return (info as ManifestInfo).file;
  }
};

type ManifestInfo = {
  file: string;
  src: string;
  isEntry: boolean;
  imports?: string[];
  css: string[];
};
